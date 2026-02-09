package com.unimarket.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalUsers;
    private long totalSellers;
    private long totalProducts;
    private long pendingProducts;
    private long totalOrders;
    private long pendingOrders;
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private List<DailyRevenue> dailyRevenue;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyRevenue {
        private String date;
        private BigDecimal revenue;
    }
}
