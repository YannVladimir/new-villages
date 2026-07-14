package com.onevillage.backend.messaging;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "conversation_participants", uniqueConstraints = @UniqueConstraint(columnNames = {"conversation_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
public class ConversationParticipant extends BaseId {

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;
}
