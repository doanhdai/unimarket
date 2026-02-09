package com.unimarket.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SellerRegisterRequest {

    @NotBlank(message = "Shop name is required")
    private String shopName;

    private String sellerDescription;
}
