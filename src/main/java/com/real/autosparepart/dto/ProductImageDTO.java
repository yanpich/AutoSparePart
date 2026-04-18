package com.real.autosparepart.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductImageDTO {
    private Integer id;  // Changed from Product productId to Integer id

    private Integer productId;  // Add product ID reference

    @NotBlank(message = "Image URL is required!")
    private String imageUrl;

    private Integer sortOrder;

    private Boolean isPrimary;

    private LocalDateTime createdAt;

    private String fileName;  // Store original filename

    private String fileUrl;   // Full URL for access
}