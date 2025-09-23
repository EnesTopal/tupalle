package com.tpl.tupalle.controller;

import com.tpl.tupalle.entity.DTO.CreateShareDTO;
import com.tpl.tupalle.entity.DTO.ShareResponse;
import com.tpl.tupalle.entity.Share;
import com.tpl.tupalle.services.ShareService;
import com.tpl.tupalle.services.S3Service;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/shares")
public class ShareController {

    private final ShareService shareService;
    private final S3Service s3Service;

    public ShareController(ShareService shareService, S3Service s3Service) {
        this.shareService = shareService;
        this.s3Service = s3Service;
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

    @PostMapping(value = "/with-images", consumes = "multipart/form-data")
    public ResponseEntity<?> createWithImages(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "imageFiles", required = false) List<MultipartFile> imageFiles,
            @RequestParam(value = "imageUrls", required = false) List<String> imageUrls,
            @RequestParam(value = "codeSnippets", required = false) String codeSnippetsJson,
            Authentication auth) {
        try {
            // Additional validation
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Title is required");
            }
            if (title.length() > 200) {
                return ResponseEntity.badRequest()
                        .body("Title must be less than 200 characters");
            }
            if (description != null && description.length() > 2000) {
                return ResponseEntity.badRequest()
                        .body("Description must be less than 2000 characters");
            }

            // Upload image files to S3
            List<String> uploadedImageUrls = new ArrayList<>();
            if (imageFiles != null && !imageFiles.isEmpty()) {
                for (MultipartFile file : imageFiles) {
                    if (!file.isEmpty()) {
                        try {
                            String imageUrl = s3Service.uploadImage(file);
                            uploadedImageUrls.add(imageUrl);
                        } catch (IOException e) {
                            return ResponseEntity.badRequest()
                                    .body("Failed to upload image: " + e.getMessage());
                        }
                    }
                }
            }

            // Combine uploaded URLs with provided URLs
            List<String> allImageUrls = new ArrayList<>();
            if (imageUrls != null) {
                allImageUrls.addAll(imageUrls.stream()
                        .filter(url -> url != null && !url.trim().isEmpty())
                        .toList());
            }
            allImageUrls.addAll(uploadedImageUrls);

            // Parse code snippets from JSON (simplified - you might want to use a proper JSON parser)
            List<com.tpl.tupalle.entity.CodeSnippet> codeSnippets = new ArrayList<>();
            if (codeSnippetsJson != null && !codeSnippetsJson.trim().isEmpty()) {
                // For now, we'll handle this in the service layer
                // You might want to use Jackson ObjectMapper to parse JSON properly
            }

            CreateShareDTO createShareDTO = new CreateShareDTO(
                    title,
                    description,
                    allImageUrls,
                    null, // imageFiles is null for the DTO when using this endpoint
                    codeSnippets
            );

            var created = shareService.createShare(auth.getName(), createShareDTO);
            return ResponseEntity.ok(ShareService.toDto(created));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create share: " + e.getMessage());
        }
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file,
                                        Authentication auth) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("File is empty");
            }

            String imageUrl = s3Service.uploadImage(file);
            return ResponseEntity.ok().body("{\"imageUrl\": \"" + imageUrl + "\"}");
        } catch (IOException e) {
            return ResponseEntity.badRequest()
                    .body("Failed to upload image: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload image: " + e.getMessage());
        }
    }

    @PostMapping("/refresh-image-url")
    public ResponseEntity<?> refreshImageUrl(@RequestParam("imageUrl") String imageUrl,
                                           Authentication auth) {
        try {
            String refreshedUrl = s3Service.refreshPresignedUrl(imageUrl);
            return ResponseEntity.ok().body("{\"imageUrl\": \"" + refreshedUrl + "\"}");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Invalid image URL: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to refresh image URL: " + e.getMessage());
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

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id, Authentication auth) {
        try {
            shareService.deleteShare(id, auth.getName());
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Share not found");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only delete your own shares");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete share: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, 
                                   @Valid @RequestBody CreateShareDTO req,
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
            
            var updated = shareService.updateShare(id, auth.getName(), req);
            return ResponseEntity.ok(ShareService.toDto(updated));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Share not found");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only update your own shares");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update share: " + e.getMessage());
        }
    }
}
