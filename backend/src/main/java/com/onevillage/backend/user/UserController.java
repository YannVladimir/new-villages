package com.onevillage.backend.user;

import com.onevillage.backend.config.FileStorageService;
import com.onevillage.backend.messaging.BlockService;
import com.onevillage.backend.security.SecurityUtils;
import com.onevillage.backend.user.dto.ChangePasswordRequest;
import com.onevillage.backend.user.dto.PublicUserResponse;
import com.onevillage.backend.user.dto.UpdateProfileRequest;
import com.onevillage.backend.user.dto.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final FileStorageService fileStorageService;
    private final BlockService blockService;

    public UserController(UserService userService, FileStorageService fileStorageService, BlockService blockService) {
        this.userService = userService;
        this.fileStorageService = fileStorageService;
        this.blockService = blockService;
    }

    @GetMapping("/me")
    public UserResponse me() {
        return userService.getCurrentUser(SecurityUtils.currentUserId());
    }

    @PatchMapping("/me")
    public UserResponse updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(SecurityUtils.currentUserId(), request);
    }

    @PostMapping(value = "/me/avatar", consumes = "multipart/form-data")
    public UserResponse uploadAvatar(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.store(file, "avatars");
        return userService.updateAvatar(SecurityUtils.currentUserId(), url);
    }

    @PatchMapping("/me/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(SecurityUtils.currentUserId(), request.currentPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deactivateMe() {
        userService.deactivateAccount(SecurityUtils.currentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public PublicUserResponse publicProfile(@PathVariable UUID id) {
        return userService.getPublicProfile(id);
    }

    @PostMapping("/{id}/block")
    public ResponseEntity<Void> block(@PathVariable UUID id) {
        blockService.block(SecurityUtils.currentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/block")
    public ResponseEntity<Void> unblock(@PathVariable UUID id) {
        blockService.unblock(SecurityUtils.currentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/blocked")
    public List<PublicUserResponse> blocked() {
        return blockService.listBlocked(SecurityUtils.currentUserId());
    }
}
