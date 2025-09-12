package com.tpl.tupalle.repositories;

import com.tpl.tupalle.entity.ShareLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ShareLikeRepository extends JpaRepository<ShareLike, UUID> {
    boolean existsByShareIdAndUserId(UUID shareId, Long userId);
    Optional<ShareLike> findByShareIdAndUserId(UUID shareId, Long userId);
    long countByShareId(UUID shareId);
}
