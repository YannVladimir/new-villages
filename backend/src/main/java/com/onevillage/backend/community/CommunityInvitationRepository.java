package com.onevillage.backend.community;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommunityInvitationRepository extends JpaRepository<CommunityInvitation, UUID> {
    List<CommunityInvitation> findByInvitedUserIdAndStatus(UUID invitedUserId, InvitationStatus status);

    List<CommunityInvitation> findByInvitedEmailIgnoreCaseAndStatus(String invitedEmail, InvitationStatus status);

    long countByInvitedUserIdAndStatus(UUID invitedUserId, InvitationStatus status);
}
