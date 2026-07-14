package com.onevillage.backend.organization;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.organization.dto.CreateOrganizationRequest;
import com.onevillage.backend.organization.dto.OrganizationResponse;
import com.onevillage.backend.organization.dto.UpdateOrganizationRequest;
import com.onevillage.backend.user.User;
import com.onevillage.backend.user.UserRepository;
import com.onevillage.backend.user.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public OrganizationService(OrganizationRepository organizationRepository, UserRepository userRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrganizationResponse create(UUID ownerId, CreateOrganizationRequest request) {
        User owner = userRepository.findById(ownerId).orElseThrow(() -> ApiException.notFound("User not found"));
        if (owner.getRole() != UserRole.ORGANIZATION) {
            throw ApiException.forbidden("Only accounts registered as an Organization can create an organization page");
        }
        if (organizationRepository.findByOwnerUserId(ownerId).isPresent()) {
            throw ApiException.conflict(com.onevillage.backend.common.ErrorCode.CONFLICT, "You already have an organization page");
        }
        Organization org = new Organization();
        org.setOwnerUserId(ownerId);
        org.setName(request.name());
        org.setDescription(request.description());
        org.setServices(request.services());
        org.setContactEmail(request.contactEmail());
        // saveAndFlush: toResponse() below reads org.getCreatedAt(), which
        // @CreationTimestamp only populates once the INSERT actually executes.
        organizationRepository.saveAndFlush(org);
        return toResponse(org);
    }

    public OrganizationResponse getById(UUID id) {
        return toResponse(getEntity(id));
    }

    public OrganizationResponse getByOwner(UUID ownerId) {
        Organization org = organizationRepository.findByOwnerUserId(ownerId)
                .orElseThrow(() -> ApiException.notFound("You haven't created an organization page yet"));
        return toResponse(org);
    }

    public java.util.List<OrganizationResponse> listActive() {
        return organizationRepository.findByStatus(OrganizationStatus.ACTIVE).stream()
                .map(this::toResponse)
                .toList();
    }

    public Organization getEntity(UUID id) {
        return organizationRepository.findById(id).orElseThrow(() -> ApiException.notFound("Organization not found"));
    }

    @Transactional
    public OrganizationResponse update(UUID id, UUID requesterId, UpdateOrganizationRequest request) {
        Organization org = getEntity(id);
        if (!org.getOwnerUserId().equals(requesterId)) {
            throw ApiException.forbidden("Only the organization owner can edit this page");
        }
        if (request.name() != null) org.setName(request.name());
        if (request.description() != null) org.setDescription(request.description());
        if (request.services() != null) org.setServices(request.services());
        if (request.contactEmail() != null) org.setContactEmail(request.contactEmail());
        if (request.logoUrl() != null) org.setLogoUrl(request.logoUrl());
        organizationRepository.save(org);
        return toResponse(org);
    }

    private OrganizationResponse toResponse(Organization org) {
        return new OrganizationResponse(org.getId(), org.getOwnerUserId(), org.getName(), org.getDescription(),
                org.getServices(), org.getLogoUrl(), org.getContactEmail(), org.getStatus(), org.getCreatedAt());
    }
}
