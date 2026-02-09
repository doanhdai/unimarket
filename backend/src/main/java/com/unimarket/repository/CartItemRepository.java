package com.unimarket.repository;

import com.unimarket.entity.CartItem;
import com.unimarket.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);

    List<CartItem> findByUserId(Long userId);

    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);

    Optional<CartItem> findByUserIdAndProductIdAndVariantId(Long userId, Long productId, Long variantId);

    Optional<CartItem> findByUserIdAndProductIdAndVariantIsNull(Long userId, Long productId);

    void deleteByUserIdAndProductId(Long userId, Long productId);

    void deleteByUserId(Long userId);
}
