package com.onevillage.backend.notification;

import com.onevillage.backend.common.PageResponse;
import com.onevillage.backend.notification.dto.NotificationResponse;
import com.onevillage.backend.security.SecurityUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public PageResponse<NotificationResponse> list(@RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "20") int size) {
        return PageResponse.from(notificationService.list(SecurityUtils.currentUserId(), PageRequest.of(page, size)));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable UUID id) {
        notificationService.markRead(id, SecurityUtils.currentUserId());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllRead() {
        notificationService.markAllRead(SecurityUtils.currentUserId());
        return ResponseEntity.noContent().build();
    }
}
