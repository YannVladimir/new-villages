package com.onevillage.backend.moderation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, UUID> {
    List<Report> findAllByOrderByCreatedAtDesc();

    long countByStatus(ReportStatus status);
}
