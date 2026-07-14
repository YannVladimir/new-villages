package com.onevillage.backend.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    @Query("""
            select u from User u
            where lower(u.fullName) like lower(concat('%', :search, '%'))
               or lower(u.email) like lower(concat('%', :search, '%'))
            """)
    Page<User> search(@Param("search") String search, Pageable pageable);

    long countByRole(UserRole role);

    Optional<User> findFirstByRole(UserRole role);
}
