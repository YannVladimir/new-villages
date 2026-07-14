package com.onevillage.backend.post;

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
@Table(name = "community_posts")
@Getter
@Setter
@NoArgsConstructor
public class CommunityPost extends BaseId {

    @Column(name = "community_id", nullable = false)
    private UUID communityId;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(columnDefinition = "text", nullable = false)
    private String body;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
