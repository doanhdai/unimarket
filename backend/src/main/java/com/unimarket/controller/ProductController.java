package com.unimarket.controller;

import com.unimarket.dto.request.ProductRequest;
import com.unimarket.dto.request.ProductVariantRequest;
import com.unimarket.dto.response.ApiResponse;
import com.unimarket.dto.response.ProductResponse;
import com.unimarket.dto.response.ProductVariantResponse;
import com.unimarket.service.ProductService;
import com.unimarket.service.ProductVariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductVariantService variantService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Page<ProductResponse> products = productService.getApprovedProducts(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProduct(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Page<ProductResponse> products = productService.getProductsByCategory(categoryId, page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProductsBySeller(
            @PathVariable Long sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Page<ProductResponse> products = productService.getProductsBySeller(sellerId, page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Page<ProductResponse> products = productService.searchProducts(keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getRecommendations(
            @PathVariable Long id,
            @RequestParam(defaultValue = "4") int limit) {
        List<ProductResponse> products = productService.getRecommendedProducts(id, limit);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/top")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getTopProducts(
            @RequestParam(defaultValue = "8") int limit) {
        List<ProductResponse> products = productService.getTopProducts(limit);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/latest")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getLatestProducts(
            @RequestParam(defaultValue = "8") int limit) {
        List<ProductResponse> products = productService.getLatestProducts(limit);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.success("Product created. Waiting for approval.", product));
    }

    @GetMapping("/my-products")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getMyProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Page<ProductResponse> products = productService.getMyProducts(page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        ProductResponse product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated", product));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    // Variant endpoints
    @GetMapping("/{id}/variants")
    public ResponseEntity<ApiResponse<List<ProductVariantResponse>>> getVariants(@PathVariable Long id) {
        List<ProductVariantResponse> variants = variantService.getVariantsByProductId(id);
        return ResponseEntity.ok(ApiResponse.success(variants));
    }

    @PostMapping("/{id}/variants")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> addVariant(
            @PathVariable Long id,
            @Valid @RequestBody ProductVariantRequest request) {
        ProductVariantResponse variant = variantService.createVariant(id, request);
        return ResponseEntity.ok(ApiResponse.success("Variant added", variant));
    }

    @PostMapping("/{id}/variants/bulk")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<List<ProductVariantResponse>>> addVariants(
            @PathVariable Long id,
            @Valid @RequestBody List<ProductVariantRequest> requests) {
        List<ProductVariantResponse> variants = variantService.createVariants(id, requests);
        return ResponseEntity.ok(ApiResponse.success("Variants added", variants));
    }

    @PutMapping("/{productId}/variants/{variantId}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<ProductVariantResponse>> updateVariant(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @Valid @RequestBody ProductVariantRequest request) {
        ProductVariantResponse variant = variantService.updateVariant(variantId, request);
        return ResponseEntity.ok(ApiResponse.success("Variant updated", variant));
    }

    @DeleteMapping("/{productId}/variants/{variantId}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ApiResponse<Void>> deleteVariant(
            @PathVariable Long productId,
            @PathVariable Long variantId) {
        variantService.deleteVariant(variantId);
        return ResponseEntity.ok(ApiResponse.success("Variant deleted", null));
    }
}
