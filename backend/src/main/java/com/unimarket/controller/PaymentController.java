package com.unimarket.controller;

import com.unimarket.dto.response.ApiResponse;
import com.unimarket.entity.Order;
import com.unimarket.service.OrderService;
import com.unimarket.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;
    private final OrderService orderService;

    @PostMapping("/vnpay")
    public ResponseEntity<ApiResponse<String>> createVNPayPayment(
            @RequestParam Long orderId,
            @RequestParam long amount,
            @RequestParam String orderInfo,
            HttpServletRequest request) {
        String paymentUrl = vnPayService.createPaymentUrl(orderId, amount, orderInfo, request);
        return ResponseEntity.ok(ApiResponse.success("Payment URL created", paymentUrl));
    }

    @GetMapping("/vnpay/callback")
    public void vnpayCallback(@RequestParam Map<String, String> params, HttpServletResponse response) throws Exception {
        boolean isValid = vnPayService.validateCallback(params);
        String frontendUrl = "http://localhost:5173/payment/result";

        if (isValid) {
            String responseCode = params.get("vnp_ResponseCode");
            String txnRef = params.get("vnp_TxnRef");

            if ("00".equals(responseCode)) {
                String[] parts = txnRef.split("_");
                if (parts.length > 0) {
                    Long orderId = Long.parseLong(parts[0]);
                    orderService.markAsPaid(orderId, txnRef);
                }
                response.sendRedirect(frontendUrl + "?status=success&orderId=" + parts[0]);
            } else {
                response.sendRedirect(frontendUrl + "?status=failed&code=" + responseCode);
            }
        } else {
            response.sendRedirect(frontendUrl + "?status=failed&code=invalid");
        }
    }

    @GetMapping("/status/{txnRef}")
    public ResponseEntity<ApiResponse<Boolean>> checkPaymentStatus(@PathVariable String txnRef) {
        Optional<Order> order = orderService.findByVnpayTxnRef(txnRef);
        boolean isPaid = order.map(Order::isPaid).orElse(false);
        return ResponseEntity.ok(ApiResponse.success(isPaid));
    }
}
