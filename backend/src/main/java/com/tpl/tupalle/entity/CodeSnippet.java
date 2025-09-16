package com.tpl.tupalle.entity;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Embeddable
@Data
public class CodeSnippet {
    @NotBlank
    private String language;
    private String filename;
    @NotBlank
    private String content;

}