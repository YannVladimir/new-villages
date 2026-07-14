package com.onevillage.backend.community;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Unifies the "Create Community" flow and the "Leader Application" approval
 * queue seen in the admin mockups — both are the same event: a user asking
 * to lead a new community.
 */
@Entity
@Table(name = "community_creation_requests")
@Getter
@Setter
@NoArgsConstructor
public class CommunityCreationRequest extends BaseId {

    @Column(name = "applicant_id", nullable = false)
    private UUID applicantId;

    @Column(name = "proposed_name", nullable = false)
    private String proposedName;

    @Column(columnDefinition = "text")
    private String description;

    private String category;

    private String city;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommunityVisibility visibility = CommunityVisibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CreationRequestStatus status = CreationRequestStatus.PENDING;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "resulting_community_id")
    private UUID resultingCommunityId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
