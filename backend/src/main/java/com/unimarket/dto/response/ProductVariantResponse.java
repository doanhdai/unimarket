package com.unimarket.dto.response;

import com.unimarket.entity.ProductVariant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantResponse {
    private Long id;
    private String size;
    private String color;
    private String colorCode;
    private BigDecimal price;
    private Integer quantity;
    private String sku;
    private String images;

    public static ProductVariantResponse fromEntity(ProductVariant variant) {
        return ProductVariantResponse.builder()
                .id(variant.getId())
                .size(variant.getSize())
                .color(variant.getColor())
                .colorCode(variant.getColorCode())
                .price(variant.getEffectivePrice())
                .quantity(variant.getQuantity())
                .sku(variant.getSku())
                .images(variant.getImages())
                .build();
    }
}
