package com.real.autosparepart.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {

    private Integer productId;

    @NotBlank(message = "Product name is required")
    private String productName;

    private String slug;

    @NotNull
    @Positive(message = "Price must be greater than 0")
    private BigDecimal price;

    private String description;

    private String status;

    @NotNull(message = "Category is required")
    private Integer categoryId;

    private Integer brandId;

    private List<Integer> vehicleIds;

    private Integer vehicleId; // backward compatibility

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}