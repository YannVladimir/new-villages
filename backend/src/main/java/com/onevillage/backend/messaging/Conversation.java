package com.onevillage.backend.messaging;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor
public class Conversation extends BaseId {

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
