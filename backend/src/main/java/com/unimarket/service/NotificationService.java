package com.unimarket.service;

import com.unimarket.dto.response.NotificationResponse;
import com.unimarket.entity.Notification;
import com.unimarket.entity.User;
import com.unimarket.exception.ResourceNotFoundException;
import com.unimarket.repository.NotificationRepository;
import com.unimarket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AuthService authService;

    @Transactional
    public void sendNotification(Long userId, String title, String message, String type, String link) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .link(link)
                .isRead(false)
                .build();

        notification = notificationRepository.save(notification);

        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notifications",
                NotificationResponse.fromNotification(notification));
    }

    public void sendToAllAdmins(String title, String message, String type, String link) {
        userRepository.findByRole(com.unimarket.entity.Role.ADMIN).forEach(admin -> {
            sendNotification(admin.getId(), title, message, type, link);
        });
    }

    public Page<NotificationResponse> getMyNotifications(int page, int size) {
        User user = authService.getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size))
                .map(NotificationResponse::fromNotification);
    }

    public long getUnreadCount() {
        User user = authService.getCurrentUser();
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public void markAsRead(Long id) {
        User user = authService.getCurrentUser();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Notification not found");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        User user = authService.getCurrentUser();
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(user.getId());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
