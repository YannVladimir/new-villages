package com.onevillage.backend.community;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommunityRepository extends JpaRepository<Community, UUID> {

    @Query("select c.name from Community c where c.id = :id")
    Optional<String> findNameById(@Param("id") UUID id);

    @Query("""
            select c from Community c
            where c.status = com.onevillage.backend.community.CommunityStatus.ACTIVE
              and (:search is null or :search = ''
                   or lower(c.name) like lower(concat('%', :search, '%'))
                   or lower(c.description) like lower(concat('%', :search, '%')))
              and (:category is null or :category = '' or c.category = :category)
            """)
    Page<Community> search(@Param("search") String search, @Param("category") String category, Pageable pageable);

    List<Community> findByStatus(CommunityStatus status);

    long countByStatus(CommunityStatus status);

    boolean existsByLeaderIdAndStatus(UUID leaderId, CommunityStatus status);
}
