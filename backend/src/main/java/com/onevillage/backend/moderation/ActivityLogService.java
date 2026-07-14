package com.onevillage.backend.moderation;

import com.onevillage.backend.moderation.dto.ActivityLogResponse;
import com.onevillage.backend.user.User;
import com.onevillage.backend.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository, UserRepository userRepository) {
        this.activityLogRepository = activityLogRepository;
        this.userRepository = userRepository;
    }

    public void log(UUID actorId, String action, String targetType, UUID targetId, String description) {
        ActivityLog entry = new ActivityLog();
        entry.setActorId(actorId);
        entry.setAction(action);
        entry.setTargetType(targetType);
        entry.setTargetId(targetId);
        entry.setDescription(description);
        activityLogRepository.save(entry);
    }

    public java.util.List<ActivityLogResponse> list() {
        return activityLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(l -> new ActivityLogResponse(
                        l.getId(),
                        l.getAction(),
                        userRepository.findById(l.getActorId()).map(User::getFullName).orElse("Admin"),
                        l.getTargetType(),
                        l.getTargetId(),
                        l.getDescription(),
                        l.getCreatedAt()))
                .toList();
    }
}
