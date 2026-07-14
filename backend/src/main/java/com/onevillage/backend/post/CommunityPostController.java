package com.onevillage.backend.post;

import com.onevillage.backend.common.PageResponse;
import com.onevillage.backend.post.dto.CommunityPostResponse;
import com.onevillage.backend.post.dto.CreatePostRequest;
import com.onevillage.backend.security.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/communities/{communityId}/posts")
public class CommunityPostController {

    private final CommunityPostService postService;

    public CommunityPostController(CommunityPostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public PageResponse<CommunityPostResponse> list(@PathVariable UUID communityId,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "20") int size) {
        Sort sort = Sort.by("createdAt").descending();
        return PageResponse.from(postService.listForCommunity(communityId, PageRequest.of(page, size, sort)));
    }

    @PostMapping
    public ResponseEntity<CommunityPostResponse> create(@PathVariable UUID communityId,
                                                          @Valid @RequestBody CreatePostRequest request) {
        CommunityPostResponse response = postService.create(communityId, SecurityUtils.currentUserId(), request.body());
        return ResponseEntity.status(201).body(response);
    }
}
