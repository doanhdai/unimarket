package com.unimarket.dto.response;

import com.unimarket.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private boolean isRead;
    private String type;
    private String link;
    private LocalDateTime createdAt;

    public static NotificationResponse fromNotification(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .type(notification.getType())
                .link(notification.getLink())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
