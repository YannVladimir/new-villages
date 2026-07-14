package com.onevillage.backend.notification;

import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * The single write path other modules use to raise a notification. Kept
 * dependency-free (repository only) so any module can call it without risking
 * a circular bean dependency.
 */
@Service
public class NotificationDispatcher {

    private final NotificationRepository notificationRepository;

    public NotificationDispatcher(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void dispatch(UUID recipientId, NotificationType type, String title, String description, UUID relatedEntityId) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setDescription(description);
        notification.setRelatedEntityId(relatedEntityId);
        notificationRepository.save(notification);
    }
}
