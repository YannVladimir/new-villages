package com.onevillage.backend.messaging;

import com.onevillage.backend.common.ApiException;
import com.onevillage.backend.user.dto.PublicUserResponse;
import com.onevillage.backend.user.User;
import com.onevillage.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class BlockService {

    private final BlockedUserRepository blockedUserRepository;
    private final UserRepository userRepository;

    public BlockService(BlockedUserRepository blockedUserRepository, UserRepository userRepository) {
        this.blockedUserRepository = blockedUserRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void block(UUID blockerId, UUID blockedId) {
        if (blockerId.equals(blockedId)) {
            throw ApiException.badRequest("You cannot block yourself");
        }
        if (blockedUserRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            return;
        }
        BlockedUser entry = new BlockedUser();
        entry.setBlockerId(blockerId);
        entry.setBlockedId(blockedId);
        blockedUserRepository.save(entry);
    }

    @Transactional
    public void unblock(UUID blockerId, UUID blockedId) {
        blockedUserRepository.deleteByBlockerIdAndBlockedId(blockerId, blockedId);
    }

    public boolean isBlockedEitherDirection(UUID userA, UUID userB) {
        return blockedUserRepository.existsByBlockerIdAndBlockedId(userA, userB)
                || blockedUserRepository.existsByBlockerIdAndBlockedId(userB, userA);
    }

    public List<PublicUserResponse> listBlocked(UUID blockerId) {
        return blockedUserRepository.findByBlockerId(blockerId).stream()
                .map(b -> userRepository.findById(b.getBlockedId()).orElse(null))
                .filter(java.util.Objects::nonNull)
                .map(u -> new PublicUserResponse(u.getId(), u.getFullName(), u.getRole(), u.getCity(), u.getBio(), u.getAvatarUrl()))
                .toList();
    }
}
