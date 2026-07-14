package com.onevillage.backend.organization;

import com.onevillage.backend.organization.dto.CreateOrganizationRequest;
import com.onevillage.backend.organization.dto.OrganizationResponse;
import com.onevillage.backend.organization.dto.UpdateOrganizationRequest;
import com.onevillage.backend.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @PostMapping
    public ResponseEntity<OrganizationResponse> create(@Valid @RequestBody CreateOrganizationRequest request) {
        return ResponseEntity.status(201).body(organizationService.create(SecurityUtils.currentUserId(), request));
    }

    @GetMapping("/me")
    public OrganizationResponse mine() {
        return organizationService.getByOwner(SecurityUtils.currentUserId());
    }

    @GetMapping
    public java.util.List<OrganizationResponse> list() {
        return organizationService.listActive();
    }

    @GetMapping("/{id}")
    public OrganizationResponse getOne(@PathVariable UUID id) {
        return organizationService.getById(id);
    }

    @PatchMapping("/{id}")
    public OrganizationResponse update(@PathVariable UUID id, @RequestBody UpdateOrganizationRequest request) {
        return organizationService.update(id, SecurityUtils.currentUserId(), request);
    }
}
