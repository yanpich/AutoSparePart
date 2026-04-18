package com.real.autosparepart.service;

import com.real.autosparepart.dto.ProductDetailsDTO;

import java.util.List;

public interface ProductDetailService {

    ProductDetailsDTO findById(Integer id);

    List<ProductDetailsDTO> findAll();

    ProductDetailsDTO create(ProductDetailsDTO dto);

    ProductDetailsDTO update(Integer id, ProductDetailsDTO dto);

    void deleteById(Integer id);
}