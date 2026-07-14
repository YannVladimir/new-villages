package com.onevillage.backend.messaging;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BlockedUserRepository extends JpaRepository<BlockedUser, UUID> {

    boolean existsByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);

    List<BlockedUser> findByBlockerId(UUID blockerId);

    void deleteByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);
}
