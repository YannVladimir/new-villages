package com.onevillage.backend.moderation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {
    List<ActivityLog> findAllByOrderByCreatedAtDesc();
}
