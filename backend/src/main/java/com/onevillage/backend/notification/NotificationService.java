package com.onevillage.backend.notification;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.notification.dto.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Page<NotificationResponse> list(UUID userId, Pageable pageable) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable).map(this::toResponse);
    }

    @Transactional
    public void markRead(UUID id, UUID userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Notification not found"));
        if (!notification.getRecipientId().equals(userId)) {
            throw ApiException.forbidden("This notification does not belong to you");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead(UUID userId) {
        var pageable = org.springframework.data.domain.PageRequest.of(0, 500);
        notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, pageable)
                .filter(n -> !n.isRead())
                .forEach(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                });
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(n.getId(), n.getType().name(), n.getTitle(), n.getDescription(),
                n.getRelatedEntityId(), n.isRead(), n.getCreatedAt());
    }
}
