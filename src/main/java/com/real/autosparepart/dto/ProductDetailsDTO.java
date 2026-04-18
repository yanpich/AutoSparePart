package com.real.autosparepart.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDetailsDTO {

    private Integer id;

    @NotNull(message = "Product ID is required")
    private Integer productId;

    private BigDecimal oldPrice;

    private Integer reviewsCount;

    private String features;

    private String specifications;

    private BigDecimal weight;

    private String dimension;

    private String material;
}