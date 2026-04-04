package com.real.autosparepart.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryDTO {

    private Integer categoryId;
    @NotBlank(message = "Category name is required")
    private String name;

    @NotBlank(message = "Category slug is required")
    private String slug;
}