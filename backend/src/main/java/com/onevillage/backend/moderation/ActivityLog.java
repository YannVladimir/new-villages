package com.onevillage.backend.moderation;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "activity_logs")
@Getter
@Setter
@NoArgsConstructor
public class ActivityLog extends BaseId {

    @Column(name = "actor_id", nullable = false)
    private UUID actorId;

    @Column(nullable = false)
    private String action;

    @Column(name = "target_type")
    private String targetType;

    @Column(name = "target_id")
    private UUID targetId;

    @Column(columnDefinition = "text")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
