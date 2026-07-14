package com.onevillage.backend.community;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CommunityCreationRequestRepository extends JpaRepository<CommunityCreationRequest, UUID> {
    List<CommunityCreationRequest> findByStatus(CreationRequestStatus status);

    List<CommunityCreationRequest> findByApplicantIdOrderByCreatedAtDesc(UUID applicantId);
}
