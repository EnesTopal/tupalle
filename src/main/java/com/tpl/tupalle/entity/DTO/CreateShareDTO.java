package com.tpl.tupalle.entity.DTO;

import com.tpl.tupalle.entity.CodeSnippet;

import java.util.List;

public record CreateShareDTO (
        String description,
        List<String> imageUrls,
        List<CodeSnippet> codeSnippets
) {}
