package com.onevillage.backend.post;

import com.onevillage.backend.common.PageResponse;
import com.onevillage.backend.post.dto.CommunityPostResponse;
import com.onevillage.backend.security.SecurityUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/posts")
public class PostFeedController {

    private final CommunityPostService postService;

    public PostFeedController(CommunityPostService postService) {
        this.postService = postService;
    }

    @GetMapping("/feed")
    public PageResponse<CommunityPostResponse> feed(@RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "20") int size) {
        Sort sort = Sort.by("createdAt").descending();
        return PageResponse.from(postService.listFeedForUser(SecurityUtils.currentUserId(), PageRequest.of(page, size, sort)));
    }
}
