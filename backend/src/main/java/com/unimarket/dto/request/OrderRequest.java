package com.unimarket.dto.request;

import com.unimarket.entity.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {

    @NotNull(message = "Items are required")
    private List<Long> cartItemIds;

    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;

    @NotBlank(message = "Phone is required")
    private String phone;

    private String note;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
}
