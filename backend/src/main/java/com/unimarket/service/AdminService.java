package com.unimarket.service;

import com.unimarket.dto.response.DashboardStats;
import com.unimarket.dto.response.UserResponse;
import com.unimarket.entity.OrderStatus;
import com.unimarket.entity.ProductStatus;
import com.unimarket.entity.Role;
import com.unimarket.entity.User;
import com.unimarket.exception.BadRequestException;
import com.unimarket.exception.ResourceNotFoundException;
import com.unimarket.repository.OrderRepository;
import com.unimarket.repository.ProductRepository;
import com.unimarket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;

    public Page<UserResponse> getAllUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(UserResponse::fromUser);
    }

    public Page<UserResponse> getPendingSellers(int page, int size) {
        List<User> sellers = userRepository.findByIsSellerTrueAndSellerApprovedFalse();
        int start = page * size;
        int end = Math.min(start + size, sellers.size());

        List<UserResponse> content = sellers.subList(start, end).stream()
                .map(UserResponse::fromUser)
                .collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(
                content,
                PageRequest.of(page, size),
                sellers.size());
    }

    @Transactional
    public UserResponse approveSeller(Long userId, boolean approve) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isSeller()) {
            throw new BadRequestException("User has not applied to be a seller");
        }

        user.setSellerApproved(approve);
        if (approve) {
            user.setRole(Role.SELLER);
        }

        user = userRepository.save(user);

        String message = approve
                ? "Chúc mừng! Đơn đăng ký bán hàng của bạn đã được duyệt."
                : "Đơn đăng ký bán hàng của bạn đã bị từ chối.";

        notificationService.sendNotification(userId,
                "Kết quả đăng ký bán hàng",
                message,
                "SELLER_APPROVAL",
                "/seller/dashboard");

        return UserResponse.fromUser(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            throw new BadRequestException("Cannot delete admin user");
        }

        userRepository.delete(user);
    }

    public DashboardStats getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalSellers = userRepository.countByIsSellerTrueAndSellerApprovedTrue();
        long totalProducts = productRepository.count();
        long pendingProducts = productRepository.countByStatus(ProductStatus.PENDING);
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus(OrderStatus.PENDING);

        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        if (totalRevenue == null)
            totalRevenue = BigDecimal.ZERO;

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        BigDecimal monthlyRevenue = orderRepository.getRevenueByDateRange(startOfMonth, LocalDateTime.now());
        if (monthlyRevenue == null)
            monthlyRevenue = BigDecimal.ZERO;

        LocalDateTime start30Days = LocalDateTime.now().minusDays(30);
        List<Object[]> dailyData = orderRepository.getDailyRevenue(start30Days, LocalDateTime.now());

        List<DashboardStats.DailyRevenue> dailyRevenue = dailyData.stream()
                .map(row -> DashboardStats.DailyRevenue.builder()
                        .date(row[0].toString())
                        .revenue((BigDecimal) row[1])
                        .build())
                .collect(Collectors.toList());

        return DashboardStats.builder()
                .totalUsers(totalUsers)
                .totalSellers(totalSellers)
                .totalProducts(totalProducts)
                .pendingProducts(pendingProducts)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthlyRevenue)
                .dailyRevenue(dailyRevenue)
                .build();
    }
}
