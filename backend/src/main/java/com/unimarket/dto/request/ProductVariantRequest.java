package com.unimarket.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductVariantRequest {
    private String size;
    private String color;
    private String colorCode;
    private BigDecimal price;
    private Integer quantity;
    private String sku;
    private String images;
}
