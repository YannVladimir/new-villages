package com.onevillage.backend.messaging;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, UUID> {

    List<ConversationParticipant> findByConversationId(UUID conversationId);

    List<ConversationParticipant> findByUserId(UUID userId);

    boolean existsByConversationIdAndUserId(UUID conversationId, UUID userId);

    @Query("""
            select p1.conversationId from ConversationParticipant p1
            join ConversationParticipant p2 on p1.conversationId = p2.conversationId
            where p1.userId = :userA and p2.userId = :userB
            """)
    Optional<UUID> findDirectConversationBetween(@Param("userA") UUID userA, @Param("userB") UUID userB);
}
