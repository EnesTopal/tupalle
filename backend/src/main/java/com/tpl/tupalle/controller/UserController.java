package com.tpl.tupalle.controller;

import com.tpl.tupalle.entity.DTO.ShareResponse;
import com.tpl.tupalle.services.ShareService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final ShareService shareService;

    public UserController(ShareService shareService) {
        this.shareService = shareService;
    }

    @GetMapping("/me/shares")
    public Page<ShareResponse> getMyShares(Authentication auth,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "20") int size) {
        return shareService.getUserShares(auth.getName(), PageRequest.of(page, size))
                .map(ShareService::toDto);
    }

    @GetMapping("/me/liked")
    public Page<ShareResponse> getMyLikedShares(Authentication auth,
                                                @RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "20") int size) {
        return shareService.getUserLikedShares(auth.getName(), PageRequest.of(page, size))
                .map(share -> ShareService.toDto(share, true)); // Always true since these are liked shares
    }

    @GetMapping("/{username}/shares")
    public Page<ShareResponse> getUserShares(@PathVariable String username,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return shareService.getUserShares(username, PageRequest.of(page, size))
                .map(ShareService::toDto);
    }
}

