package com.unimarket.dto.response;

import com.unimarket.entity.CartItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private BigDecimal productPrice;
    private int quantity;
    private BigDecimal subtotal;
    private Long sellerId;
    private String shopName;
    private int availableQuantity;
    private Long variantId;
    private String variantSize;
    private String variantColor;

    public static CartItemResponse fromCartItem(CartItem cartItem) {
        BigDecimal price = cartItem.getEffectivePrice();
        int availableQty = cartItem.getVariant() != null
                ? cartItem.getVariant().getQuantity()
                : cartItem.getProduct().getQuantity();

        CartItemResponseBuilder builder = CartItemResponse.builder()
                .id(cartItem.getId())
                .productId(cartItem.getProduct().getId())
                .productName(cartItem.getProduct().getName())
                .productImage(cartItem.getProduct().getImages())
                .productPrice(price)
                .quantity(cartItem.getQuantity())
                .subtotal(price.multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                .sellerId(cartItem.getProduct().getSeller().getId())
                .shopName(cartItem.getProduct().getSeller().getShopName())
                .availableQuantity(availableQty);

        if (cartItem.getVariant() != null) {
            builder.variantId(cartItem.getVariant().getId())
                    .variantSize(cartItem.getVariant().getSize())
                    .variantColor(cartItem.getVariant().getColor());
        }

        return builder.build();
    }
}
