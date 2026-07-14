package com.onevillage.backend.event;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {

    @Query("""
            select e from Event e
            where (:communityId is null or e.communityId = :communityId)
              and (:upcomingOnly = false or e.startAt >= :now)
            order by e.startAt asc
            """)
    Page<Event> findFiltered(@Param("communityId") UUID communityId,
                              @Param("upcomingOnly") boolean upcomingOnly,
                              @Param("now") Instant now,
                              Pageable pageable);

    long countByCommunityIdAndStartAtAfter(UUID communityId, Instant after);
}
