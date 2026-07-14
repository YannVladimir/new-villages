package com.onevillage.backend.event;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "event_rsvps", uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
public class EventRsvp extends BaseId {

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RsvpStatus status;

    @Column(name = "responded_at", nullable = false)
    private Instant respondedAt;
}
