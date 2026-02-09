package com.unimarket.service;

import com.unimarket.dto.request.CartRequest;
import com.unimarket.dto.response.CartItemResponse;
import com.unimarket.entity.CartItem;
import com.unimarket.entity.Product;
import com.unimarket.entity.ProductStatus;
import com.unimarket.entity.ProductVariant;
import com.unimarket.entity.User;
import com.unimarket.exception.BadRequestException;
import com.unimarket.exception.ResourceNotFoundException;
import com.unimarket.repository.CartItemRepository;
import com.unimarket.repository.ProductRepository;
import com.unimarket.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final AuthService authService;

    public List<CartItemResponse> getCart() {
        User user = authService.getCurrentUser();
        return cartItemRepository.findByUserId(user.getId())
                .stream()
                .map(CartItemResponse::fromCartItem)
                .collect(Collectors.toList());
    }

    public BigDecimal getCartTotal() {
        return getCart().stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional
    public CartItemResponse addToCart(CartRequest request) {
        User user = authService.getCurrentUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getStatus() != ProductStatus.APPROVED) {
            throw new BadRequestException("Product is not available");
        }

        if (product.getSeller().getId().equals(user.getId())) {
            throw new BadRequestException("You cannot add your own product to cart");
        }

        ProductVariant variant = null;
        int availableStock;

        if (request.getVariantId() != null) {
            variant = variantRepository.findById(request.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));
            if (!variant.getProduct().getId().equals(product.getId())) {
                throw new BadRequestException("Variant does not belong to this product");
            }
            availableStock = variant.getQuantity();
        } else if (product.hasVariants()) {
            throw new BadRequestException("Please select a variant (size/color)");
        } else {
            availableStock = product.getQuantity();
        }

        if (availableStock < request.getQuantity()) {
            throw new BadRequestException("Not enough stock");
        }

        Optional<CartItem> existingItem;
        if (variant != null) {
            existingItem = cartItemRepository.findByUserIdAndProductIdAndVariantId(
                    user.getId(), product.getId(), variant.getId());
        } else {
            existingItem = cartItemRepository.findByUserIdAndProductIdAndVariantIsNull(
                    user.getId(), product.getId());
        }

        CartItem cartItem = existingItem.orElse(CartItem.builder()
                .user(user)
                .product(product)
                .variant(variant)
                .quantity(0)
                .build());

        int newQuantity = cartItem.getQuantity() + request.getQuantity();
        if (newQuantity > availableStock) {
            throw new BadRequestException("Not enough stock");
        }

        cartItem.setQuantity(newQuantity);
        cartItem = cartItemRepository.save(cartItem);

        return CartItemResponse.fromCartItem(cartItem);
    }

    @Transactional
    public CartItemResponse updateCartItem(Long id, int quantity) {
        User user = authService.getCurrentUser();
        CartItem cartItem = cartItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Cart item does not belong to you");
        }

        int availableStock = cartItem.getVariant() != null
                ? cartItem.getVariant().getQuantity()
                : cartItem.getProduct().getQuantity();

        if (quantity > availableStock) {
            throw new BadRequestException("Not enough stock");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }

        cartItem.setQuantity(quantity);
        cartItem = cartItemRepository.save(cartItem);

        return CartItemResponse.fromCartItem(cartItem);
    }

    @Transactional
    public void removeFromCart(Long id) {
        User user = authService.getCurrentUser();
        CartItem cartItem = cartItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Cart item does not belong to you");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart() {
        User user = authService.getCurrentUser();
        cartItemRepository.deleteByUserId(user.getId());
    }

    public List<CartItem> getCartItemsByIds(List<Long> ids) {
        User user = authService.getCurrentUser();
        return ids.stream()
                .map(id -> {
                    CartItem item = cartItemRepository.findById(id)
                            .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + id));
                    if (!item.getUser().getId().equals(user.getId())) {
                        throw new BadRequestException("Cart item does not belong to you: " + id);
                    }
                    return item;
                })
                .collect(Collectors.toList());
    }
}
