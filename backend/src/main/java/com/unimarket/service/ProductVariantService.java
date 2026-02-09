package com.unimarket.service;

import com.unimarket.dto.request.ProductVariantRequest;
import com.unimarket.dto.response.ProductVariantResponse;
import com.unimarket.entity.Product;
import com.unimarket.entity.ProductVariant;
import com.unimarket.exception.BadRequestException;
import com.unimarket.exception.ResourceNotFoundException;
import com.unimarket.repository.ProductRepository;
import com.unimarket.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;

    public List<ProductVariantResponse> getVariantsByProductId(Long productId) {
        return variantRepository.findByProductId(productId)
                .stream()
                .map(ProductVariantResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ProductVariantResponse getVariantById(Long id) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));
        return ProductVariantResponse.fromEntity(variant);
    }

    @Transactional
    public ProductVariantResponse createVariant(Long productId, ProductVariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (variantRepository.existsByProductIdAndSizeAndColor(productId, request.getSize(), request.getColor())) {
            throw new BadRequestException("Variant with this size and color already exists");
        }

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .size(request.getSize())
                .color(request.getColor())
                .colorCode(request.getColorCode())
                .price(request.getPrice())
                .quantity(request.getQuantity() != null ? request.getQuantity() : 0)
                .sku(request.getSku())
                .images(request.getImages())
                .build();

        variant = variantRepository.save(variant);
        return ProductVariantResponse.fromEntity(variant);
    }

    @Transactional
    public List<ProductVariantResponse> createVariants(Long productId, List<ProductVariantRequest> requests) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        List<ProductVariant> variants = requests.stream()
                .map(request -> ProductVariant.builder()
                        .product(product)
                        .size(request.getSize())
                        .color(request.getColor())
                        .colorCode(request.getColorCode())
                        .price(request.getPrice())
                        .quantity(request.getQuantity() != null ? request.getQuantity() : 0)
                        .sku(request.getSku())
                        .images(request.getImages())
                        .build())
                .collect(Collectors.toList());

        variants = variantRepository.saveAll(variants);
        return variants.stream()
                .map(ProductVariantResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductVariantResponse updateVariant(Long variantId, ProductVariantRequest request) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));

        if (request.getSize() != null)
            variant.setSize(request.getSize());
        if (request.getColor() != null)
            variant.setColor(request.getColor());
        if (request.getColorCode() != null)
            variant.setColorCode(request.getColorCode());
        if (request.getPrice() != null)
            variant.setPrice(request.getPrice());
        if (request.getQuantity() != null)
            variant.setQuantity(request.getQuantity());
        if (request.getSku() != null)
            variant.setSku(request.getSku());
        if (request.getImages() != null)
            variant.setImages(request.getImages());

        variant = variantRepository.save(variant);
        return ProductVariantResponse.fromEntity(variant);
    }

    @Transactional
    public void deleteVariant(Long variantId) {
        if (!variantRepository.existsById(variantId)) {
            throw new ResourceNotFoundException("Variant not found");
        }
        variantRepository.deleteById(variantId);
    }

    @Transactional
    public void deleteAllVariantsByProductId(Long productId) {
        variantRepository.deleteByProductId(productId);
    }

    public ProductVariant getVariantEntity(Long variantId) {
        return variantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Variant not found"));
    }

    @Transactional
    public void updateVariantQuantity(Long variantId, int quantityChange) {
        ProductVariant variant = getVariantEntity(variantId);
        int newQuantity = variant.getQuantity() + quantityChange;
        if (newQuantity < 0) {
            throw new BadRequestException("Insufficient stock for variant");
        }
        variant.setQuantity(newQuantity);
        variantRepository.save(variant);
    }
}
