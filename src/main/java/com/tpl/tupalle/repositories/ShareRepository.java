package com.tpl.tupalle.repositories;

import com.tpl.tupalle.entity.Share;
import com.tpl.tupalle.entity.ShareLike;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ShareRepository extends JpaRepository<Share, UUID> {
    Page<Share> findAllByOwnerId(Long ownerId, Pageable pageable);
}

