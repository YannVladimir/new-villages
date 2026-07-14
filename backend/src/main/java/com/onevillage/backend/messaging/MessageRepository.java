package com.onevillage.backend.messaging;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    Page<Message> findByConversationIdOrderBySentAtDesc(UUID conversationId, Pageable pageable);

    Optional<Message> findTopByConversationIdOrderBySentAtDesc(UUID conversationId);

    long countByConversationIdAndSenderIdNotAndReadAtIsNull(UUID conversationId, UUID senderId);
}
