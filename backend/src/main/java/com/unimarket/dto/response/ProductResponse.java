package com.unimarket.dto.response;

import com.unimarket.entity.Product;
import com.unimarket.entity.ProductStatus;
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
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private int quantity;
    private String images;
    private Long sellerId;
    private String sellerName;
    private String shopName;
    private Long categoryId;
    private String categoryName;
    private ProductStatus status;
    private int viewCount;
    private LocalDateTime createdAt;
    private boolean hasVariants;
    private List<ProductVariantResponse> variants;

    public static ProductResponse fromProduct(Product product) {
        return fromProduct(product, false);
    }

    public static ProductResponse fromProduct(Product product, boolean includeVariants) {
        ProductResponseBuilder builder = ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .minPrice(product.getMinPrice())
                .maxPrice(product.getMaxPrice())
                .quantity(product.hasVariants() ? product.getTotalQuantity() : product.getQuantity())
                .images(product.getImages())
                .sellerId(product.getSeller().getId())
                .sellerName(product.getSeller().getFullName())
                .shopName(product.getSeller().getShopName())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .status(product.getStatus())
                .viewCount(product.getViewCount())
                .createdAt(product.getCreatedAt())
                .hasVariants(product.hasVariants());

        if (includeVariants && product.hasVariants()) {
            builder.variants(product.getVariants().stream()
                    .map(ProductVariantResponse::fromEntity)
                    .collect(Collectors.toList()));
        }

        return builder.build();
    }
}
