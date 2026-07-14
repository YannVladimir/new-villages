package com.onevillage.backend.community;

import com.onevillage.backend.common.PageResponse;
import com.onevillage.backend.community.dto.*;
import com.onevillage.backend.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class CommunityController {

    private final CommunityService communityService;

    public CommunityController(CommunityService communityService) {
        this.communityService = communityService;
    }

    @GetMapping("/api/communities")
    public PageResponse<CommunityResponse> search(@RequestParam(required = false) String query,
                                                    @RequestParam(required = false) String category,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return PageResponse.from(communityService.search(query, category, SecurityUtils.currentUserId(), pageable));
    }

    @GetMapping("/api/communities/mine")
    public List<CommunityResponse> mine() {
        return communityService.getMine(SecurityUtils.currentUserId());
    }

    @GetMapping("/api/communities/invitations")
    public List<CommunityInvitationResponse> invitations() {
        var user = SecurityUtils.currentUser();
        return communityService.getInvitations(user.getId(), user.getUsername());
    }

    @GetMapping("/api/communities/my-requests")
    public List<CommunityCreationRequestResponse> myRequests() {
        return communityService.getMyCreationRequests(SecurityUtils.currentUserId());
    }

    @GetMapping("/api/communities/{id}")
    public CommunityResponse getOne(@PathVariable UUID id) {
        return communityService.getById(id, SecurityUtils.currentUserId());
    }

    @PostMapping("/api/communities")
    public ResponseEntity<CommunityCreationRequestResponse> create(@Valid @RequestBody CreateCommunityRequest request) {
        return ResponseEntity.status(201).body(communityService.requestCreation(SecurityUtils.currentUserId(), request));
    }

    @PostMapping("/api/communities/{id}/join")
    public CommunityResponse join(@PathVariable UUID id) {
        return communityService.join(id, SecurityUtils.currentUserId());
    }

    @PostMapping("/api/communities/{id}/leave")
    public ResponseEntity<Void> leave(@PathVariable UUID id) {
        communityService.leave(id, SecurityUtils.currentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/communities/{id}/members")
    public List<CommunityMemberResponse> members(@PathVariable UUID id) {
        return communityService.getMembers(id);
    }

    @PostMapping("/api/communities/{id}/invite")
    public ResponseEntity<Void> invite(@PathVariable UUID id, @Valid @RequestBody InviteMemberRequest request) {
        communityService.invite(id, SecurityUtils.currentUserId(), request.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/invitations/{id}/accept")
    public ResponseEntity<Void> acceptInvitation(@PathVariable UUID id) {
        communityService.respondToInvitation(id, SecurityUtils.currentUserId(), true);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/api/invitations/{id}/decline")
    public ResponseEntity<Void> declineInvitation(@PathVariable UUID id) {
        communityService.respondToInvitation(id, SecurityUtils.currentUserId(), false);
        return ResponseEntity.noContent().build();
    }
}
