package com.unimarket.controller;

import com.unimarket.dto.request.OrderRequest;
import com.unimarket.dto.response.ApiResponse;
import com.unimarket.dto.response.OrderResponse;
import com.unimarket.entity.OrderStatus;
import com.unimarket.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> createOrder(@Valid @RequestBody OrderRequest request) {
        List<OrderResponse> orders = orderService.createOrders(request);
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully", orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable Long id) {
        OrderResponse order = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @GetMapping("/purchases")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyPurchases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<OrderResponse> orders = orderService.getMyPurchases(page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/sales")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMySales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<OrderResponse> orders = orderService.getMySales(page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmOrder(@PathVariable Long id) {
        OrderResponse order = orderService.sellerConfirmOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order confirmed", order));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        OrderResponse order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", order));
    }
}
