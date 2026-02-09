package com.unimarket.dto.response;

import com.unimarket.entity.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private int quantity;
    private BigDecimal price;
    private BigDecimal subtotal;
    private Long variantId;
    private String variantSize;
    private String variantColor;

    public static OrderItemResponse fromOrderItem(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProductName())
                .productImage(item.getProductImage())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .variantId(item.getVariantId())
                .variantSize(item.getVariantSize())
                .variantColor(item.getVariantColor())
                .build();
    }
}
