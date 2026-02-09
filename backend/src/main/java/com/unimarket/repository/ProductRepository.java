package com.unimarket.repository;

import com.unimarket.entity.Product;
import com.unimarket.entity.ProductStatus;
import com.unimarket.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    Page<Product> findByStatusAndCategoryId(ProductStatus status, Long categoryId, Pageable pageable);

    Page<Product> findBySellerId(Long sellerId, Pageable pageable);

    Page<Product> findBySellerIdAndStatus(Long sellerId, ProductStatus status, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = :status AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(@Param("status") ProductStatus status,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'APPROVED' ORDER BY p.viewCount DESC")
    List<Product> findTopProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'APPROVED' ORDER BY p.createdAt DESC")
    List<Product> findLatestProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'APPROVED' AND p.category.id = :categoryId AND p.id != :productId ORDER BY RAND()")
    List<Product> findRecommendedProducts(@Param("categoryId") Long categoryId,
            @Param("productId") Long productId,
            Pageable pageable);

    long countByStatus(ProductStatus status);

    List<Product> findBySeller(User seller);
}
