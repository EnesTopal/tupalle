package com.tpl.tupalle.repositories;

import com.tpl.tupalle.entity.Share;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ShareRepository extends JpaRepository<Share, UUID> {
    
    // Get shares by owner
    Page<Share> findAllByOwnerId(Long ownerId, Pageable pageable);
    
    // Search shares by title (case-insensitive)
    Page<Share> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    // Get most liked shares
    Page<Share> findAllByOrderByLikeCountDesc(Pageable pageable);
    
    // Get recent shares
    Page<Share> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

