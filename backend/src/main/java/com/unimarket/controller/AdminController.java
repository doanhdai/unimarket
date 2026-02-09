package com.unimarket.controller;

import com.unimarket.dto.response.*;
import com.unimarket.service.AdminService;
import com.unimarket.service.OrderService;
import com.unimarket.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final ProductService productService;
    private final OrderService orderService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboard() {
        DashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<UserResponse> users = adminService.getAllUsers(page, size);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }

    @GetMapping("/sellers/pending")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getPendingSellers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<UserResponse> sellers = adminService.getPendingSellers(page, size);
        return ResponseEntity.ok(ApiResponse.success(sellers));
    }

    @PutMapping("/sellers/{id}/approve")
    public ResponseEntity<ApiResponse<UserResponse>> approveSeller(
            @PathVariable Long id,
            @RequestParam boolean approve) {
        UserResponse user = adminService.approveSeller(id, approve);
        String message = approve ? "Seller approved" : "Seller rejected";
        return ResponseEntity.ok(ApiResponse.success(message, user));
    }

    @GetMapping("/products/pending")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getPendingProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ProductResponse> products = productService.getPendingProducts(page, size);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PutMapping("/products/{id}/approve")
    public ResponseEntity<ApiResponse<ProductResponse>> approveProduct(
            @PathVariable Long id,
            @RequestParam boolean approve) {
        ProductResponse product = productService.approveProduct(id, approve);
        String message = approve ? "Product approved" : "Product rejected";
        return ResponseEntity.ok(ApiResponse.success(message, product));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<OrderResponse> orders = orderService.getAllOrders(page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/orders/pending")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getPendingOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<OrderResponse> orders = orderService.getPendingOrders(page, size);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PutMapping("/orders/{id}/approve")
    public ResponseEntity<ApiResponse<OrderResponse>> approveOrder(@PathVariable Long id) {
        OrderResponse order = orderService.adminApproveOrder(id);
        return ResponseEntity.ok(ApiResponse.success("Order approved", order));
    }
}
