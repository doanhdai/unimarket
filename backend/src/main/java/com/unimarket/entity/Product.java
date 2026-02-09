package com.unimarket.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    private int quantity;

    @Column(columnDefinition = "TEXT")
    private String images;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProductStatus status = ProductStatus.PENDING;

    @Column(name = "view_count")
    @Builder.Default
    private int viewCount = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @Builder.Default
    private List<CartItem> cartItems = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductVariant> variants = new ArrayList<>();

    public boolean hasVariants() {
        return variants != null && !variants.isEmpty();
    }

    public BigDecimal getMinPrice() {
        if (!hasVariants())
            return price;
        return variants.stream()
                .map(ProductVariant::getEffectivePrice)
                .min(BigDecimal::compareTo)
                .orElse(price);
    }

    public BigDecimal getMaxPrice() {
        if (!hasVariants())
            return price;
        return variants.stream()
                .map(ProductVariant::getEffectivePrice)
                .max(BigDecimal::compareTo)
                .orElse(price);
    }

    public int getTotalQuantity() {
        if (!hasVariants())
            return quantity;
        return variants.stream()
                .mapToInt(ProductVariant::getQuantity)
                .sum();
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
