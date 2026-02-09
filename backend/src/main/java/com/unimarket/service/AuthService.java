package com.unimarket.service;

import com.unimarket.dto.request.LoginRequest;
import com.unimarket.dto.request.RegisterRequest;
import com.unimarket.dto.request.SellerRegisterRequest;
import com.unimarket.dto.response.AuthResponse;
import com.unimarket.dto.response.UserResponse;
import com.unimarket.entity.Role;
import com.unimarket.entity.User;
import com.unimarket.exception.BadRequestException;
import com.unimarket.exception.ResourceNotFoundException;
import com.unimarket.repository.UserRepository;
import com.unimarket.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .role(Role.USER)
                .build();

        user = userRepository.save(user);
        String token = tokenProvider.generateTokenFromEmail(user.getEmail());

        return AuthResponse.fromUser(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);
        User user = (User) authentication.getPrincipal();

        return AuthResponse.fromUser(user, token);
    }

    @Transactional
    public UserResponse registerAsSeller(SellerRegisterRequest request) {
        User user = getCurrentUser();

        if (user.isSeller()) {
            throw new BadRequestException("You have already registered as a seller");
        }

        user.setSeller(true);
        user.setSellerApproved(false);
        user.setShopName(request.getShopName());
        user.setSellerDescription(request.getSellerDescription());

        user = userRepository.save(user);
        return UserResponse.fromUser(user);
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse getProfile() {
        return UserResponse.fromUser(getCurrentUser());
    }

    @Transactional
    public UserResponse updateProfile(String fullName, String phone, String address, String avatar) {
        User user = getCurrentUser();
        if (fullName != null)
            user.setFullName(fullName);
        if (phone != null)
            user.setPhone(phone);
        if (address != null)
            user.setAddress(address);
        if (avatar != null)
            user.setAvatar(avatar);

        user = userRepository.save(user);
        return UserResponse.fromUser(user);
    }
}
