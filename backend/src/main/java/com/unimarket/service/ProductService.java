package com.unimarket.service;

import com.unimarket.dto.request.ProductRequest;
import com.unimarket.dto.response.ProductResponse;
import com.unimarket.entity.Category;
import com.unimarket.entity.Product;
import com.unimarket.entity.ProductStatus;
import com.unimarket.entity.ProductVariant;
import com.unimarket.entity.User;
import com.unimarket.exception.BadRequestException;
import com.unimarket.exception.ResourceNotFoundException;
import com.unimarket.repository.CategoryRepository;
import com.unimarket.repository.ProductRepository;
import com.unimarket.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final AuthService authService;

    public Page<ProductResponse> getApprovedProducts(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return productRepository.findByStatus(ProductStatus.APPROVED, pageable)
                .map(ProductResponse::fromProduct);
    }

    public Page<ProductResponse> getProductsByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findByStatusAndCategoryId(ProductStatus.APPROVED, categoryId, pageable)
                .map(ProductResponse::fromProduct);
    }

    public Page<ProductResponse> getProductsBySeller(Long sellerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findBySellerIdAndStatus(sellerId, ProductStatus.APPROVED, pageable)
                .map(ProductResponse::fromProduct);
    }

    public Page<ProductResponse> searchProducts(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.searchProducts(ProductStatus.APPROVED, keyword, pageable)
                .map(ProductResponse::fromProduct);
    }

    @Transactional
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setViewCount(product.getViewCount() + 1);
        productRepository.save(product);

        return ProductResponse.fromProduct(product, true);
    }

    public List<ProductResponse> getRecommendedProducts(Long productId, int limit) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return productRepository.findRecommendedProducts(
                product.getCategory().getId(),
                productId,
                PageRequest.of(0, limit))
                .stream()
                .map(ProductResponse::fromProduct)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getTopProducts(int limit) {
        return productRepository.findTopProducts(PageRequest.of(0, limit))
                .stream()
                .map(ProductResponse::fromProduct)
                .collect(Collectors.toList());
    }

    public List<ProductResponse> getLatestProducts(int limit) {
        return productRepository.findLatestProducts(PageRequest.of(0, limit))
                .stream()
                .map(ProductResponse::fromProduct)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        User seller = authService.getCurrentUser();

        if (!seller.isSeller() || !seller.isSellerApproved()) {
            throw new BadRequestException("You must be an approved seller to create products");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .images(request.getImages())
                .seller(seller)
                .category(category)
                .status(ProductStatus.PENDING)
                .build();

        product = productRepository.save(product);

        // Save variants if present
        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            Product finalProduct = product;
            int index = 1;
            List<ProductVariant> variants = new java.util.ArrayList<>();
            for (var v : request.getVariants()) {
                String sku = v.getSku();
                if (sku == null || sku.trim().isEmpty()) {
                    // Auto-generate SKU: PROD-{productId}-{index}-{timestamp}
                    sku = "SKU-" + finalProduct.getId() + "-" + index + "-" + System.currentTimeMillis();
                }
                variants.add(ProductVariant.builder()
                        .product(finalProduct)
                        .size(v.getSize())
                        .color(v.getColor())
                        .colorCode(v.getColorCode())
                        .price(v.getPrice())
                        .quantity(v.getQuantity() != null ? v.getQuantity() : 0)
                        .sku(sku)
                        .images(v.getImages())
                        .build());
                index++;
            }
            variantRepository.saveAll(variants);
            product.setVariants(variants);
        }

        return ProductResponse.fromProduct(product);
    }

    public Page<ProductResponse> getMyProducts(int page, int size) {
        User seller = authService.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findBySellerId(seller.getId(), pageable)
                .map(ProductResponse::fromProduct);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        User seller = authService.getCurrentUser();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new BadRequestException("You can only update your own products");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setImages(request.getImages());
        product.setCategory(category);

        // Update variants - clear existing and add new ones to maintain reference
        if (product.getVariants() != null) {
            product.getVariants().clear();
        }

        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            Product finalProduct = product;
            int index = 1;
            for (var v : request.getVariants()) {
                String sku = v.getSku();
                if (sku == null || sku.trim().isEmpty()) {
                    sku = "SKU-" + finalProduct.getId() + "-" + index + "-" + System.currentTimeMillis();
                }
                ProductVariant variant = ProductVariant.builder()
                        .product(finalProduct)
                        .size(v.getSize())
                        .color(v.getColor())
                        .colorCode(v.getColorCode())
                        .price(v.getPrice())
                        .quantity(v.getQuantity() != null ? v.getQuantity() : 0)
                        .sku(sku)
                        .images(v.getImages())
                        .build();
                product.getVariants().add(variant);
                index++;
            }
        }

        product = productRepository.save(product);

        return ProductResponse.fromProduct(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        User seller = authService.getCurrentUser();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new BadRequestException("You can only delete your own products");
        }

        productRepository.delete(product);
    }

    public Page<ProductResponse> getPendingProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return productRepository.findByStatus(ProductStatus.PENDING, pageable)
                .map(ProductResponse::fromProduct);
    }

    @Transactional
    public ProductResponse approveProduct(Long id, boolean approve) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        product.setStatus(approve ? ProductStatus.APPROVED : ProductStatus.REJECTED);
        product = productRepository.save(product);

        return ProductResponse.fromProduct(product);
    }
}
