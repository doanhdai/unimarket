package com.unimarket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private String size;

    private String color;

    @Column(name = "color_code")
    private String colorCode;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    @Builder.Default
    private int quantity = 0;

    @Column(unique = true)
    private String sku;

    @Column(columnDefinition = "TEXT")
    private String images;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public BigDecimal getEffectivePrice() {
        return price != null ? price : product.getPrice();
    }
}
