package com.tpl.tupalle.services;

import com.tpl.tupalle.entity.DTO.CreateShareDTO;
import com.tpl.tupalle.entity.DTO.ShareResponse;
import com.tpl.tupalle.entity.Share;
import com.tpl.tupalle.entity.ShareLike;
import com.tpl.tupalle.repositories.ShareLikeRepository;
import com.tpl.tupalle.repositories.ShareRepository;
import com.tpl.tupalle.entity.User;
import com.tpl.tupalle.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ShareService {

    private final ShareRepository shareRepo;
    private final ShareLikeRepository likeRepo;
    private final UserRepository userRepository;
    private final UserService userService;

    public ShareService(ShareRepository shareRepo, ShareLikeRepository likeRepo, UserRepository userRepository, UserService userService) {
        this.shareRepo = shareRepo;
        this.likeRepo = likeRepo;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @Transactional
    public Share createShare(String ownerUsername, CreateShareDTO req) {
        User owner = userRepository.findByUsername(ownerUsername)
                .orElseThrow(() -> new EntityNotFoundException("Owner not found"));

        if (owner == null) {
            throw new EntityNotFoundException("Owner not found");
        }

        Share s = new Share();
        s.setOwner(owner);
        s.setTitle(req.title());
        s.setDescription(req.description());
        s.setImageUrls(req.imageUrls() != null ? req.imageUrls() : java.util.Collections.emptyList());
        s.setCodeSnippets(req.codeSnippets() != null ? req.codeSnippets() : java.util.Collections.emptyList());

        return shareRepo.save(s);
    }

    @Transactional
    public void likeShare(UUID shareId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Share share = shareRepo.findById(shareId)
                .orElseThrow(() -> new EntityNotFoundException("Share not found"));

        if (likeRepo.existsByShareIdAndUserId(shareId, user.getId())) return; // idempotent

        ShareLike like = new ShareLike();
        like.setShare(share);
        like.setUser(user);
        likeRepo.save(like);

        share.setLikeCount(share.getLikeCount() + 1);
        
        // Update the share owner's title
        userService.updateUserTitle(share.getOwner().getUsername());
    }

    @Transactional
    public void unlikeShare(UUID shareId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        Share share = shareRepo.findById(shareId)
                .orElseThrow(() -> new EntityNotFoundException("Share not found"));

        likeRepo.findByShareIdAndUserId(shareId, user.getId()).ifPresent(l -> {
            likeRepo.delete(l);
            share.setLikeCount(Math.max(0, share.getLikeCount() - 1));
            
            // Update the share owner's title
            userService.updateUserTitle(share.getOwner().getUsername());
        });
    }

    @Transactional(readOnly = true)
    public Share getShare(UUID id) {
        return shareRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Share not found"));
    }

    @Transactional(readOnly = true)
    public Page<Share> list(Pageable pageable) {
        return shareRepo.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Share> listMostLiked(Pageable pageable) {
        return shareRepo.findAllByOrderByLikeCountDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Share> listRecent(Pageable pageable) {
        return shareRepo.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Share> searchByTitle(String title, Pageable pageable) {
        return shareRepo.findByTitleContainingIgnoreCase(title, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Share> getUserShares(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return shareRepo.findAllByOwnerId(user.getId(), pageable);
    }

    @Transactional(readOnly = true)
    public boolean hasUserLiked(UUID shareId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return likeRepo.existsByShareIdAndUserId(shareId, user.getId());
    }

    @Transactional(readOnly = true)
    public Page<Share> getUserLikedShares(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return likeRepo.findLikedSharesByUserIdExcludingOwnShares(user.getId(), pageable);
    }

    @Transactional
    public void deleteShare(UUID shareId, String username) {
        Share share = shareRepo.findById(shareId)
                .orElseThrow(() -> new EntityNotFoundException("Share not found"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        // Check if user owns the share
        if (!share.getOwner().getId().equals(user.getId())) {
            throw new SecurityException("You can only delete your own shares");
        }
        
        // Delete associated likes first
        likeRepo.deleteByShareId(shareId);
        
        // Delete the share
        shareRepo.delete(share);
    }

    @Transactional
    public Share updateShare(UUID shareId, String username, CreateShareDTO req) {
        Share share = shareRepo.findById(shareId)
                .orElseThrow(() -> new EntityNotFoundException("Share not found"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        // Check if user owns the share
        if (!share.getOwner().getId().equals(user.getId())) {
            throw new SecurityException("You can only update your own shares");
        }
        
        // Update the share
        share.setTitle(req.title());
        share.setDescription(req.description());
        share.setImageUrls(req.imageUrls() != null ? req.imageUrls() : java.util.Collections.emptyList());
        share.setCodeSnippets(req.codeSnippets() != null ? req.codeSnippets() : java.util.Collections.emptyList());
        
        return shareRepo.save(share);
    }

    public static ShareResponse toDto(Share share) {
        return new ShareResponse(
                share.getId().toString(),
                share.getOwner().getUsername(),
                share.getOwner().getTitle() != null ? share.getOwner().getTitle() : "Newbie Coder",
                share.getTitle(),
                share.getDescription(),
                share.getImageUrls(),
                share.getCodeSnippets(),
                share.getLikeCount(),
                false // Default to false, will be set by controller
        );
    }

    public static ShareResponse toDto(Share share, boolean isLiked) {
        return new ShareResponse(
                share.getId().toString(),
                share.getOwner().getUsername(),
                share.getOwner().getTitle() != null ? share.getOwner().getTitle() : "Newbie Coder",
                share.getTitle(),
                share.getDescription(),
                share.getImageUrls(),
                share.getCodeSnippets(),
                share.getLikeCount(),
                isLiked
        );
    }
}
