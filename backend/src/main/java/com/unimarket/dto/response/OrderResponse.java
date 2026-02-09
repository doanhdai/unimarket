package com.unimarket.dto.response;

import com.unimarket.entity.Order;
import com.unimarket.entity.OrderStatus;
import com.unimarket.entity.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long buyerId;
    private String buyerName;
    private String buyerEmail;
    private Long sellerId;
    private String sellerName;
    private String shopName;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private String phone;
    private String note;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private boolean isPaid;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;

    public static OrderResponse fromOrder(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .buyerId(order.getBuyer().getId())
                .buyerName(order.getBuyer().getFullName())
                .buyerEmail(order.getBuyer().getEmail())
                .sellerId(order.getSeller().getId())
                .sellerName(order.getSeller().getFullName())
                .shopName(order.getSeller().getShopName())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .phone(order.getPhone())
                .note(order.getNote())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .isPaid(order.isPaid())
                .createdAt(order.getCreatedAt())
                .items(order.getOrderItems().stream()
                        .map(OrderItemResponse::fromOrderItem)
                        .collect(Collectors.toList()))
                .build();
    }
}
