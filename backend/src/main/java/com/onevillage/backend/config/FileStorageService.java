package com.onevillage.backend.config;

import com.onevillage.backend.common.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Local-disk file storage for the MVP. Swap the implementation for an S3-compatible
 * client later without changing any caller — everything depends on this interface's
 * single method.
 */
@Service
public class FileStorageService {

    private final Path root;
    private final String publicBaseUrl;

    public FileStorageService(
            @Value("${app.uploads.dir}") String uploadsDir,
            @Value("${app.uploads.public-base-url}") String publicBaseUrl
    ) {
        this.root = Path.of(uploadsDir);
        this.publicBaseUrl = publicBaseUrl;
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create uploads directory " + root, e);
        }
    }

    public String store(MultipartFile file, String subDirectory) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("File is required");
        }
        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
        String extension = original.contains(".") ? original.substring(original.lastIndexOf('.')) : "";
        String filename = UUID.randomUUID() + extension;

        Path targetDir = root.resolve(subDirectory);
        try {
            Files.createDirectories(targetDir);
            Path target = targetDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store file", e);
        }

        return publicBaseUrl + "/" + subDirectory + "/" + filename;
    }
}
