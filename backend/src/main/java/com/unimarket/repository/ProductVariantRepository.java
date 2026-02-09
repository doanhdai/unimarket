package com.unimarket.repository;

import com.unimarket.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    List<ProductVariant> findByProductId(Long productId);

    Optional<ProductVariant> findByProductIdAndSizeAndColor(Long productId, String size, String color);

    Optional<ProductVariant> findBySku(String sku);

    void deleteByProductId(Long productId);

    boolean existsByProductIdAndSizeAndColor(Long productId, String size, String color);
}
