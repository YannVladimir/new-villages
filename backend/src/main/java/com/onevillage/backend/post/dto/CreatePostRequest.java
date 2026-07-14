package com.onevillage.backend.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePostRequest(
        @NotBlank @Size(max = 2000) String body
) {
}
