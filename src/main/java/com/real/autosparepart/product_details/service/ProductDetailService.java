package com.real.autosparepart.product_details.service;

import com.real.autosparepart.product_details.dto.ProductDetailsDTO;

import java.util.List;

public interface ProductDetailService {

    ProductDetailsDTO findById(Integer id);

    List<ProductDetailsDTO> findAll();

    ProductDetailsDTO create(ProductDetailsDTO dto);

    ProductDetailsDTO update(Integer id, ProductDetailsDTO dto);

    void deleteById(Integer id);
}