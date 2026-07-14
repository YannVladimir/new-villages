package com.onevillage.backend.upload;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.config.FileStorageService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Generic authenticated image upload used wherever the frontend needs to attach
 * a picture before the parent resource exists yet (e.g. a community cover image
 * while the community itself is still just a pending creation request).
 */
@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private final FileStorageService fileStorageService;

    public UploadController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    public record UploadResponse(String url) {
    }

    @PostMapping(value = "/images", consumes = "multipart/form-data")
    public UploadResponse uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw ApiException.badRequest("Only image files are allowed");
        }
        if (file.getSize() > MAX_BYTES) {
            throw ApiException.badRequest("Image must be 5MB or smaller");
        }
        return new UploadResponse(fileStorageService.store(file, "images"));
    }
}
