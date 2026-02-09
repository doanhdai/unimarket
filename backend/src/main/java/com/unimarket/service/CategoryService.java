package com.unimarket.service;

import com.unimarket.dto.request.CategoryRequest;
import com.unimarket.dto.response.CategoryResponse;
import com.unimarket.entity.Category;
import com.unimarket.exception.BadRequestException;
import com.unimarket.exception.ResourceNotFoundException;
import com.unimarket.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::fromCategory)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByActiveTrue().stream()
                .map(CategoryResponse::fromCategory)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        return CategoryResponse.fromCategory(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category name already exists");
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .image(request.getImage())
                .active(request.isActive())
                .build();

        category = categoryRepository.save(category);
        return CategoryResponse.fromCategory(category);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getName().equals(request.getName()) &&
                categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category name already exists");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setImage(request.getImage());
        category.setActive(request.isActive());

        category = categoryRepository.save(category);
        return CategoryResponse.fromCategory(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (!category.getProducts().isEmpty()) {
            throw new BadRequestException("Cannot delete category with products");
        }

        categoryRepository.delete(category);
    }
}
