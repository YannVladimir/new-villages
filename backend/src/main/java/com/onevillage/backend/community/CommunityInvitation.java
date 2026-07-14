package com.onevillage.backend.community;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "community_invitations")
@Getter
@Setter
@NoArgsConstructor
public class CommunityInvitation extends BaseId {

    @Column(name = "community_id", nullable = false)
    private UUID communityId;

    @Column(name = "invited_email")
    private String invitedEmail;

    @Column(name = "invited_user_id")
    private UUID invitedUserId;

    @Column(name = "invited_by", nullable = false)
    private UUID invitedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status = InvitationStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
