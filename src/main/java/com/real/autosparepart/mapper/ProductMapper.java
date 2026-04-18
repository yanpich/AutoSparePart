package com.real.autosparepart.mapper;

import com.real.autosparepart.dto.ProductDTO;
import com.real.autosparepart.model.Product;
import com.real.autosparepart.model.Vehicle;

import java.util.List;
import java.util.stream.Collectors;

public class ProductMapper {

    public static ProductDTO toDTO(Product product) {

        ProductDTO dto = ProductDTO.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .slug(product.getSlug())
                .price(product.getPrice())
                .description(product.getDescription())
                .status(product.getStatus() != null ? product.getStatus().name() : null)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .categoryId(product.getCategory() != null
                        ? convertToInteger(product.getCategory().getId())
                        : null)
                .brandId(product.getBrand() != null
                        ? product.getBrand().getBrandId()
                        : null)
                .build();

        // Handle vehicles in ONE place
        if (product.getVehicles() != null && !product.getVehicles().isEmpty()) {

            List<Integer> ids = product.getVehicles()
                    .stream()
                    .map(Vehicle::getVehicleId)
                    .collect(Collectors.toList());

            dto.setVehicleIds(ids);

            // optional backward compatibility
            dto.setVehicleId(ids.get(0));
        }

        return dto;
    }

    // Safe conversion helper
    private static Integer convertToInteger(Object id) {
        if (id instanceof Integer) {
            return (Integer) id;
        }
        if (id instanceof Long) {
            return ((Long) id).intValue();
        }
        return null;
    }
}