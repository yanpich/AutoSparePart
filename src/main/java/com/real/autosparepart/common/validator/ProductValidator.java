package com.real.autosparepart.common.validator;

import com.real.autosparepart.product.dto.ProductDTO;
import com.real.autosparepart.common.exception.BadRequestException;

public class ProductValidator {

    public static void validate(ProductDTO dto) {
        if (dto == null) {
            throw new BadRequestException("Product cannot be null");
        }
    }
}