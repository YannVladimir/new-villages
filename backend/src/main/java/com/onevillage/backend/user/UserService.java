package com.onevillage.backend.user;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.community.CommunityRepository;
import com.onevillage.backend.terms.TermsService;
import com.onevillage.backend.user.dto.AdminUserResponse;
import com.onevillage.backend.user.dto.PublicUserResponse;
import com.onevillage.backend.user.dto.UpdateProfileRequest;
import com.onevillage.backend.user.dto.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final TermsService termsService;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                        CommunityRepository communityRepository,
                        TermsService termsService,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.communityRepository = communityRepository;
        this.termsService = termsService;
        this.passwordEncoder = passwordEncoder;
    }

    public User getEntity(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    public UserResponse toResponse(User user) {
        String communityName = user.getSelectedCommunityId() == null ? null
                : communityRepository.findNameById(user.getSelectedCommunityId()).orElse(null);
        var acceptance = termsService.getLatestAcceptanceInfo(user.getId()).orElse(null);

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getCountry(),
                user.getCity(),
                user.getPreferredLanguage(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getAccountStatus(),
                user.isEmailVerified(),
                user.getSelectedCommunityId(),
                communityName,
                user.getSpokenLanguages(),
                acceptance == null ? null : acceptance.version(),
                acceptance == null ? null : acceptance.acceptedAt(),
                user.getCreatedAt()
        );
    }

    public UserResponse getCurrentUser(UUID userId) {
        return toResponse(getEntity(userId));
    }

    public PublicUserResponse getPublicProfile(UUID id) {
        User user = getEntity(id);
        return new PublicUserResponse(user.getId(), user.getFullName(), user.getRole(), user.getCity(), user.getBio(), user.getAvatarUrl());
    }

    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = getEntity(userId);
        if (request.fullName() != null) user.setFullName(request.fullName());
        if (request.bio() != null) user.setBio(request.bio());
        if (request.city() != null) user.setCity(request.city());
        if (request.preferredLanguage() != null) user.setPreferredLanguage(request.preferredLanguage());
        if (request.spokenLanguages() != null) {
            user.getSpokenLanguages().clear();
            user.getSpokenLanguages().addAll(request.spokenLanguages());
        }
        if (request.selectedCommunityId() != null) {
            if (!communityRepository.existsById(request.selectedCommunityId())) {
                throw ApiException.badRequest("Selected community does not exist");
            }
            user.setSelectedCommunityId(request.selectedCommunityId());
        }
        userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public UserResponse updateAvatar(UUID userId, String avatarUrl) {
        User user = getEntity(userId);
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public void changePassword(UUID userId, String currentPassword, String newPassword) {
        User user = getEntity(userId);
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw ApiException.badRequest("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void deactivateAccount(UUID userId) {
        User user = getEntity(userId);
        user.setAccountStatus(AccountStatus.DEACTIVATED);
        userRepository.save(user);
    }

    // --- Admin operations ---

    public Page<AdminUserResponse> adminSearch(String search, Pageable pageable) {
        Page<User> page = (search == null || search.isBlank())
                ? userRepository.findAll(pageable)
                : userRepository.search(search, pageable);
        return page.map(this::toAdminResponse);
    }

    private AdminUserResponse toAdminResponse(User user) {
        return new AdminUserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(),
                user.getCity(), user.getAccountStatus(), user.getCreatedAt());
    }

    @Transactional
    public void suspend(UUID userId) {
        User user = getEntity(userId);
        user.setAccountStatus(AccountStatus.SUSPENDED);
        userRepository.save(user);
    }

    @Transactional
    public void reinstate(UUID userId) {
        User user = getEntity(userId);
        user.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(user);
    }

    public long countByRole(UserRole role) {
        return userRepository.countByRole(role);
    }

    public long countAll() {
        return userRepository.count();
    }
}
