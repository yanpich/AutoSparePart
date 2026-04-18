package com.real.autosparepart.validator;

import com.real.autosparepart.dto.ProductDTO;
import com.real.autosparepart.exception.BadRequestException;

public class ProductValidator {

    public static void validate(ProductDTO dto) {
        if (dto == null) {
            throw new BadRequestException("Product cannot be null");
        }
    }
}