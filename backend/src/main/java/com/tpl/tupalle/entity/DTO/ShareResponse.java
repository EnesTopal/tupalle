package com.tpl.tupalle.entity.DTO;

import com.tpl.tupalle.entity.CodeSnippet;

import java.util.List;

public record ShareResponse(
        String id,
        String ownerUsername,
        String ownerTitle,
        String title,
        String description,
        List<String> imageUrls,
        List<CodeSnippet> codeSnippets,
        long likeCount,
        boolean isLiked
) {}
