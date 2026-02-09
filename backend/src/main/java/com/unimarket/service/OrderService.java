package com.unimarket.service;

import com.unimarket.dto.request.OrderRequest;
import com.unimarket.dto.response.OrderResponse;
import com.unimarket.entity.*;
import com.unimarket.exception.BadRequestException;
import com.unimarket.exception.ResourceNotFoundException;
import com.unimarket.repository.CartItemRepository;
import com.unimarket.repository.OrderRepository;
import com.unimarket.repository.ProductRepository;
import com.unimarket.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final AuthService authService;
    private final CartService cartService;
    private final NotificationService notificationService;

    @Transactional
    public List<OrderResponse> createOrders(OrderRequest request) {
        User buyer = authService.getCurrentUser();
        List<CartItem> cartItems = cartService.getCartItemsByIds(request.getCartItemIds());

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Map<Long, List<CartItem>> itemsBySeller = cartItems.stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getSeller().getId()));

        List<Order> orders = new ArrayList<>();

        for (Map.Entry<Long, List<CartItem>> entry : itemsBySeller.entrySet()) {
            List<CartItem> sellerItems = entry.getValue();
            User seller = sellerItems.get(0).getProduct().getSeller();

            BigDecimal totalAmount = BigDecimal.ZERO;
            List<OrderItem> orderItems = new ArrayList<>();

            for (CartItem cartItem : sellerItems) {
                Product product = cartItem.getProduct();
                ProductVariant variant = cartItem.getVariant();

                int availableStock;
                BigDecimal itemPrice;

                if (variant != null) {
                    availableStock = variant.getQuantity();
                    itemPrice = variant.getEffectivePrice();
                } else {
                    availableStock = product.getQuantity();
                    itemPrice = product.getPrice();
                }

                if (availableStock < cartItem.getQuantity()) {
                    throw new BadRequestException("Not enough stock for: " + product.getName());
                }

                BigDecimal itemTotal = itemPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
                totalAmount = totalAmount.add(itemTotal);

                // Deduct stock
                if (variant != null) {
                    variant.setQuantity(variant.getQuantity() - cartItem.getQuantity());
                    variantRepository.save(variant);
                } else {
                    product.setQuantity(product.getQuantity() - cartItem.getQuantity());
                    productRepository.save(product);
                }

                String firstImage = product.getImages() != null ? product.getImages().split(",")[0] : null;

                OrderItem orderItem = OrderItem.builder()
                        .product(product)
                        .quantity(cartItem.getQuantity())
                        .price(itemPrice)
                        .productName(product.getName())
                        .productImage(firstImage)
                        .variantId(variant != null ? variant.getId() : null)
                        .variantSize(variant != null ? variant.getSize() : null)
                        .variantColor(variant != null ? variant.getColor() : null)
                        .build();

                orderItems.add(orderItem);
            }

            Order order = Order.builder()
                    .buyer(buyer)
                    .seller(seller)
                    .totalAmount(totalAmount)
                    .shippingAddress(request.getShippingAddress())
                    .phone(request.getPhone())
                    .note(request.getNote())
                    .paymentMethod(request.getPaymentMethod())
                    .status(OrderStatus.PENDING)
                    .isPaid(false)
                    .build();

            order = orderRepository.save(order);

            for (OrderItem item : orderItems) {
                item.setOrder(order);
            }
            order.setOrderItems(orderItems);
            order = orderRepository.save(order);

            orders.add(order);

            notificationService.sendNotification(seller.getId(),
                    "Đơn hàng mới",
                    "Bạn có đơn hàng mới #" + order.getId() + " từ " + buyer.getFullName(),
                    "NEW_ORDER",
                    "/seller/orders/" + order.getId());

            notificationService.sendToAllAdmins(
                    "Đơn hàng mới trên hệ thống",
                    "Đơn hàng #" + order.getId() + " vừa được đặt bởi " + buyer.getFullName(),
                    "NEW_ORDER",
                    "/admin/orders/" + order.getId());
        }

        for (CartItem cartItem : cartItems) {
            cartItemRepository.delete(cartItem);
        }

        return orders.stream()
                .map(OrderResponse::fromOrder)
                .collect(Collectors.toList());
    }

    public Page<OrderResponse> getMyPurchases(int page, int size) {
        User buyer = authService.getCurrentUser();
        return orderRepository.findByBuyerId(buyer.getId(),
                PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(OrderResponse::fromOrder);
    }

    public Page<OrderResponse> getMySales(int page, int size) {
        User seller = authService.getCurrentUser();
        return orderRepository.findBySellerId(seller.getId(),
                PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(OrderResponse::fromOrder);
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        User user = authService.getCurrentUser();
        if (!order.getBuyer().getId().equals(user.getId()) &&
                !order.getSeller().getId().equals(user.getId()) &&
                user.getRole() != Role.ADMIN) {
            throw new BadRequestException("You don't have access to this order");
        }

        return OrderResponse.fromOrder(order);
    }

    @Transactional
    public OrderResponse adminApproveOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BadRequestException("Order cannot be approved");
        }

        order.setStatus(OrderStatus.ADMIN_APPROVED);
        order = orderRepository.save(order);

        notificationService.sendNotification(order.getSeller().getId(),
                "Đơn hàng đã được duyệt",
                "Đơn hàng #" + order.getId() + " đã được admin duyệt. Vui lòng xác nhận giao hàng.",
                "ORDER_APPROVED",
                "/seller/orders/" + order.getId());

        return OrderResponse.fromOrder(order);
    }

    @Transactional
    public OrderResponse sellerConfirmOrder(Long id) {
        User seller = authService.getCurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getSeller().getId().equals(seller.getId())) {
            throw new BadRequestException("This order does not belong to you");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.ADMIN_APPROVED) {
            throw new BadRequestException("Order status must be PENDING or ADMIN_APPROVED to confirm");
        }

        order.setStatus(OrderStatus.SELLER_CONFIRMED);
        order = orderRepository.save(order);

        notificationService.sendNotification(order.getBuyer().getId(),
                "Đơn hàng đang được xử lý",
                "Đơn hàng #" + order.getId() + " đã được người bán xác nhận và chuẩn bị giao.",
                "ORDER_CONFIRMED",
                "/orders/" + order.getId());

        return OrderResponse.fromOrder(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setStatus(status);
        order = orderRepository.save(order);

        String statusText = switch (status) {
            case SHIPPING -> "đang được giao";
            case DELIVERED -> "đã được giao thành công";
            case CANCELLED -> "đã bị hủy";
            default -> "đã được cập nhật";
        };

        notificationService.sendNotification(order.getBuyer().getId(),
                "Cập nhật đơn hàng",
                "Đơn hàng #" + order.getId() + " " + statusText,
                "ORDER_STATUS",
                "/orders/" + order.getId());

        return OrderResponse.fromOrder(order);
    }

    public Page<OrderResponse> getPendingOrders(int page, int size) {
        return orderRepository.findByStatus(OrderStatus.PENDING,
                PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(OrderResponse::fromOrder);
    }

    public Page<OrderResponse> getAllOrders(int page, int size) {
        return orderRepository.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))
                .map(OrderResponse::fromOrder);
    }

    @Transactional
    public void markAsPaid(Long id, String vnpayTxnRef) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        order.setPaid(true);
        order.setVnpayTxnRef(vnpayTxnRef);
        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);
    }

    public Optional<Order> findByVnpayTxnRef(String txnRef) {
        return orderRepository.findByVnpayTxnRef(txnRef);
    }
}
