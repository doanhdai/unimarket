package com.unimarket.dto.response;

import com.unimarket.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String image;
    private boolean active;
    private int productCount;

    public static CategoryResponse fromCategory(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .image(category.getImage())
                .active(category.isActive())
                .productCount(category.getProducts() != null ? category.getProducts().size() : 0)
                .build();
    }
}
