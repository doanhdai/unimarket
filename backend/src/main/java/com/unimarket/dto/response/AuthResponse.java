package com.unimarket.dto.response;

import com.unimarket.entity.Role;
import com.unimarket.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Long id;
    private String email;
    private String fullName;
    private Role role;
    private boolean isSeller;
    private boolean sellerApproved;
    private String shopName;

    public static AuthResponse fromUser(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .isSeller(user.isSeller())
                .sellerApproved(user.isSellerApproved())
                .shopName(user.getShopName())
                .build();
    }
}
