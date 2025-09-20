package com.tpl.tupalle.controller;

import com.tpl.tupalle.entity.DTO.ShareResponse;
import com.tpl.tupalle.entity.Share;
import com.tpl.tupalle.entity.User;
import com.tpl.tupalle.services.ShareService;
import com.tpl.tupalle.services.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {
    
    private final UserService userService;
    private final ShareService shareService;
    
    public UserProfileController(UserService userService, ShareService shareService) {
        this.userService = userService;
        this.shareService = shareService;
    }
    
    @GetMapping("/{username}/profile")
    public ResponseEntity<Map<String, Object>> getUserProfile(@PathVariable String username) {
        try {
            User user = userService.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
            
            long totalLikes = userService.getTotalLikesForUser(username);
            String title = user.getTitle() != null ? user.getTitle() : "Newbie Coder";
            
            Map<String, Object> profile = new HashMap<>();
            profile.put("username", user.getUsername());
            profile.put("title", title);
            profile.put("totalLikes", totalLikes);
            profile.put("enabled", user.isEnabled());
            
            return ResponseEntity.ok(profile);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{username}/shares")
    public ResponseEntity<Map<String, Object>> getUserShares(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Share> shares = shareService.getUserShares(username, pageable);
            
            Page<ShareResponse> shareResponses = shares.map(share -> {
                boolean isLiked = false;
                if (authentication != null) {
                    isLiked = shareService.hasUserLiked(share.getId(), authentication.getName());
                }
                return ShareService.toDto(share, isLiked);
            });
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", shareResponses.getContent());
            response.put("totalElements", shareResponses.getTotalElements());
            response.put("totalPages", shareResponses.getTotalPages());
            response.put("size", shareResponses.getSize());
            response.put("number", shareResponses.getNumber());
            
            return ResponseEntity.ok(response);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
