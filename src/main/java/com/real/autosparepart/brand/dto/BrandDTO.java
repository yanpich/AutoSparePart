package com.real.autosparepart.brand.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BrandDTO {
    private Integer brandId;

    @NotBlank(message = "Please provide brand's name!")
    private String brandName;

    @NotBlank(message = "Please provide brand's image!")
    private String image;

    @JsonIgnore
    private MultipartFile file;

    // Status fields
    private boolean deleted;
    private boolean active;
    private String status;
    private LocalDateTime deletedAt;
    private Integer deletedBy;
    private LocalDateTime restoredAt;
    private Integer restoredBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Counts
    private Long productCount;

    // For soft delete operations
    private String deletedByUsername;
    private String restoredByUsername;
}