package com.real.autosparepart.validator;

import com.real.autosparepart.dto.ProductDetailsDTO;
import com.real.autosparepart.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class ProductDetailsValidator {

    public void validateCreate(ProductDetailsDTO dto) {
        if (dto == null) {
            throw new BadRequestException("Product details cannot be null");
        }

        if (dto.getProductId() == null) {
            throw new BadRequestException("Product ID is required");
        }

        if (dto.getWeight() != null && dto.getWeight().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Weight must be greater than 0");
        }

        if (dto.getReviewsCount() != null && dto.getReviewsCount() < 0) {
            throw new BadRequestException("Reviews count cannot be negative");
        }
    }

    public void validateUpdate(ProductDetailsDTO dto) {
        if (dto == null) {
            throw new BadRequestException("Product details cannot be null");
        }

        if (dto.getWeight() != null && dto.getWeight().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Weight must be greater than 0");
        }

        if (dto.getReviewsCount() != null && dto.getReviewsCount() < 0) {
            throw new BadRequestException("Reviews count cannot be negative");
        }
    }
}