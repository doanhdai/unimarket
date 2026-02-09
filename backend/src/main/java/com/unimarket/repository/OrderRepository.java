package com.unimarket.repository;

import com.unimarket.entity.Order;
import com.unimarket.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByBuyerId(Long buyerId, Pageable pageable);

    Page<Order> findBySellerId(Long sellerId, Pageable pageable);

    List<Order> findByStatus(OrderStatus status);

    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    Optional<Order> findByVnpayTxnRef(String txnRef);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.isPaid = true")
    BigDecimal getTotalRevenue();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.isPaid = true AND o.createdAt BETWEEN :start AND :end")
    BigDecimal getRevenueByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);

    @Query("SELECT DATE(o.createdAt) as date, SUM(o.totalAmount) as total FROM Order o " +
            "WHERE o.isPaid = true AND o.createdAt BETWEEN :start AND :end " +
            "GROUP BY DATE(o.createdAt) ORDER BY DATE(o.createdAt)")
    List<Object[]> getDailyRevenue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
