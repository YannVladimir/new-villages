package com.onevillage.backend.messaging;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "blocked_users", uniqueConstraints = @UniqueConstraint(columnNames = {"blocker_id", "blocked_id"}))
@Getter
@Setter
@NoArgsConstructor
public class BlockedUser extends BaseId {

    @Column(name = "blocker_id", nullable = false)
    private UUID blockerId;

    @Column(name = "blocked_id", nullable = false)
    private UUID blockedId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
