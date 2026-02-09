package com.unimarket.controller;

import com.unimarket.dto.request.CartRequest;
import com.unimarket.dto.response.ApiResponse;
import com.unimarket.dto.response.CartItemResponse;
import com.unimarket.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CartItemResponse>>> getCart() {
        List<CartItemResponse> cart = cartService.getCart();
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @GetMapping("/total")
    public ResponseEntity<ApiResponse<BigDecimal>> getCartTotal() {
        BigDecimal total = cartService.getCartTotal();
        return ResponseEntity.ok(ApiResponse.success(total));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CartItemResponse>> addToCart(@Valid @RequestBody CartRequest request) {
        CartItemResponse item = cartService.addToCart(request);
        return ResponseEntity.ok(ApiResponse.success("Added to cart", item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CartItemResponse>> updateCartItem(
            @PathVariable Long id,
            @RequestParam int quantity) {
        CartItemResponse item = cartService.updateCartItem(id, quantity);
        if (item == null) {
            return ResponseEntity.ok(ApiResponse.success("Item removed from cart", null));
        }
        return ResponseEntity.ok(ApiResponse.success("Cart updated", item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeFromCart(@PathVariable Long id) {
        cartService.removeFromCart(id);
        return ResponseEntity.ok(ApiResponse.success("Removed from cart", null));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
