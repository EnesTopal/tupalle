package com.tpl.tupalle.controller;

import com.tpl.tupalle.entity.DTO.CreateShareDTO;
import com.tpl.tupalle.entity.DTO.ShareResponse;
import com.tpl.tupalle.services.ShareService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
    public ShareResponse create(@Valid @RequestBody CreateShareDTO req,
                                Authentication auth) {
        var created = shareService.createShare(auth.getName(), req);
        return ShareService.toDto(created);
    }

    @GetMapping("/{id}")
    public ShareResponse get(@PathVariable UUID id) {
        return ShareService.toDto(shareService.getShare(id));
    }

    @GetMapping
    public Page<ShareResponse> list(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size) {
        return shareService.list(PageRequest.of(page, size)).map(ShareService::toDto);
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
