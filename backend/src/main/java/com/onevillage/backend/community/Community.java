package com.onevillage.backend.community;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "communities")
@Getter
@Setter
@NoArgsConstructor
public class Community extends BaseId {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommunityVisibility visibility = CommunityVisibility.PUBLIC;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(name = "icon_name")
    private String iconName;

    private String color;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommunityStatus status = CommunityStatus.PENDING;

    @Column(name = "leader_id", nullable = false)
    private UUID leaderId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
