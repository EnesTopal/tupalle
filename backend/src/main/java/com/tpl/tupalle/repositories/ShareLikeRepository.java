package com.tpl.tupalle.repositories;

import com.tpl.tupalle.entity.ShareLike;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ShareLikeRepository extends JpaRepository<ShareLike, UUID> {
    boolean existsByShareIdAndUserId(UUID shareId, Long userId);
    Optional<ShareLike> findByShareIdAndUserId(UUID shareId, Long userId);
    long countByShareId(UUID shareId);
    
    @Query("SELECT sl.share FROM ShareLike sl WHERE sl.user.id = :userId AND sl.share.owner.id != :userId ORDER BY sl.share.createdAt DESC")
    Page<com.tpl.tupalle.entity.Share> findLikedSharesByUserIdExcludingOwnShares(@Param("userId") Long userId, Pageable pageable);
    
    void deleteByShareId(UUID shareId);
    
    void deleteByUserId(Long userId);
}
