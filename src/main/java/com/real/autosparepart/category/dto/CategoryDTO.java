package com.real.autosparepart.category.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Integer categoryId;
    private String categoryName;
    private String slug;
    private String description;
    private Boolean status;
    private Integer productCount;
    private String createdAt;
    private String updatedAt;

    public Serializable getActive() {
        return null;
    }

}