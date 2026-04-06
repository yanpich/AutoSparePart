package com.real.autosparepart.dto;

import com.real.autosparepart.model.Brand;
import com.real.autosparepart.model.Category;
import com.real.autosparepart.model.Product;
import com.real.autosparepart.model.Vehicle;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {

    private Integer productId;

    @NotBlank(message = "product name is required")
    private String productName;

    private String slug;

    @NotNull(message = "price is required")
    @DecimalMin(value = "0.01", message = "Price must be > 0")
    private BigDecimal price;

    private String description;

    private Product.Status status;

    // FIXED: Changed from Vehicle object to Integer ID
    private Integer vehicleId;

    // For multiple vehicles support
    private List<Integer> vehicleIds;

    // FIXED: Changed from Category object to Integer ID
    private Integer categoryId;

    // FIXED: Changed from Brand object to Integer ID
    private Integer brandId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}