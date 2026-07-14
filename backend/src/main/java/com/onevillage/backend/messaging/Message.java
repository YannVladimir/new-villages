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
import java.util.UUID;

@Entity
@Table(name = "messages")
@Getter
@Setter
@NoArgsConstructor
public class Message extends BaseId {

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Column(name = "sender_id", nullable = false)
    private UUID senderId;

    @Column(columnDefinition = "text", nullable = false)
    private String body;

    @CreationTimestamp
    @Column(name = "sent_at", nullable = false, updatable = false)
    private Instant sentAt;

    @Column(name = "read_at")
    private Instant readAt;
}
