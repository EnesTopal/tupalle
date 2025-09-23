package com.tpl.tupalle.entity.DTO;

import com.tpl.tupalle.entity.CodeSnippet;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record CreateShareDTO (
        String title,
        String description,
        List<String> imageUrls,
        List<MultipartFile> imageFiles,
        List<CodeSnippet> codeSnippets
) {}
