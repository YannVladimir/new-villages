package com.onevillage.backend.terms;

import com.onevillage.backend.common.BaseId;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "terms_versions")
@Getter
@Setter
@NoArgsConstructor
public class TermsVersion extends BaseId {

    @Column(nullable = false, unique = true)
    private String version;

    @Column(columnDefinition = "text", nullable = false)
    private String body;

    @Column(name = "published_at", nullable = false)
    private Instant publishedAt;

    @Column(name = "is_current", nullable = false)
    private boolean current;
}
