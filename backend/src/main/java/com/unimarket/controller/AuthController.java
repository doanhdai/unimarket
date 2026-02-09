package com.unimarket.controller;

import com.unimarket.dto.request.LoginRequest;
import com.unimarket.dto.request.RegisterRequest;
import com.unimarket.dto.request.SellerRegisterRequest;
import com.unimarket.dto.response.ApiResponse;
import com.unimarket.dto.response.AuthResponse;
import com.unimarket.dto.response.UserResponse;
import com.unimarket.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/register-seller")
    public ResponseEntity<ApiResponse<UserResponse>> registerSeller(@Valid @RequestBody SellerRegisterRequest request) {
        UserResponse response = authService.registerAsSeller(request);
        return ResponseEntity
                .ok(ApiResponse.success("Seller registration submitted. Please wait for admin approval.", response));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile() {
        UserResponse response = authService.getProfile();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) String avatar) {
        UserResponse response = authService.updateProfile(fullName, phone, address, avatar);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", response));
    }
}
