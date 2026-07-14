package com.onevillage.backend.event;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
public class Event extends BaseId {

    @Column(name = "community_id")
    private UUID communityId;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType type;

    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @Column(name = "is_online", nullable = false)
    private boolean online;

    private String location;

    @Column(name = "online_link")
    private String onlineLink;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
