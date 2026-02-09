package com.unimarket.dto.response;

import com.unimarket.entity.Role;
import com.unimarket.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private String avatar;
    private Role role;
    private boolean isSeller;
    private boolean sellerApproved;
    private String shopName;
    private String sellerDescription;
    private LocalDateTime createdAt;

    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .isSeller(user.isSeller())
                .sellerApproved(user.isSellerApproved())
                .shopName(user.getShopName())
                .sellerDescription(user.getSellerDescription())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
