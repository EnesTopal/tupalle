package com.tpl.tupalle.controller;

import com.tpl.tupalle.entity.DTO.CreateShareDTO;
import com.tpl.tupalle.entity.DTO.ShareResponse;
import com.tpl.tupalle.entity.Share;
import com.tpl.tupalle.services.ShareService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/shares")
public class ShareController {

    private final ShareService shareService;

    public ShareController(ShareService shareService) {
        this.shareService = shareService;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateShareDTO req,
                                    Authentication auth) {
        try {
            // Additional validation
            if (req.title() == null || req.title().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Title is required");
            }
            if (req.title().length() > 200) {
                return ResponseEntity.badRequest()
                        .body("Title must be less than 200 characters");
            }
            if (req.description() != null && req.description().length() > 2000) {
                return ResponseEntity.badRequest()
                        .body("Description must be less than 2000 characters");
            }
            
            var created = shareService.createShare(auth.getName(), req);
            return ResponseEntity.ok(ShareService.toDto(created));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create share: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ShareResponse get(@PathVariable UUID id, Authentication auth) {
        Share share = shareService.getShare(id);
        boolean isLiked = auth != null ? shareService.hasUserLiked(id, auth.getName()) : false;
        return ShareService.toDto(share, isLiked);
    }

    @GetMapping
    public Page<ShareResponse> list(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size,
                                    @RequestParam(defaultValue = "recent") String sort,
                                    Authentication auth) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Share> shares = switch (sort) {
            case "most-liked" -> shareService.listMostLiked(pageable);
            case "recent" -> shareService.listRecent(pageable);
            default -> shareService.list(pageable);
        };
        
        return shares.map(share -> {
            boolean isLiked = auth != null ? shareService.hasUserLiked(share.getId(), auth.getName()) : false;
            return ShareService.toDto(share, isLiked);
        });
    }

    @GetMapping("/search")
    public Page<ShareResponse> search(@RequestParam String q,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size,
                                      Authentication auth) {
        Page<Share> shares = shareService.searchByTitle(q, PageRequest.of(page, size));
        return shares.map(share -> {
            boolean isLiked = auth != null ? shareService.hasUserLiked(share.getId(), auth.getName()) : false;
            return ShareService.toDto(share, isLiked);
        });
    }

    @PostMapping("/{id}/like")
    public void like(@PathVariable UUID id, Authentication auth) {
        shareService.likeShare(id, auth.getName());
    }

    @DeleteMapping("/{id}/like")
    public void unlike(@PathVariable UUID id, Authentication auth) {
        shareService.unlikeShare(id, auth.getName());
    }
}
