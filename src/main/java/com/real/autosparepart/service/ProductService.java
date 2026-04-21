package com.real.autosparepart.service;

import com.real.autosparepart.dto.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ProductService {

    ProductDTO create(ProductDTO dto);

    ProductDTO findById(Integer id);

    List<ProductDTO> findAll();

    Page<ProductDTO> findAll(Pageable pageable);

//    Optional<Object> findBySlug(String slug);

//    Page<ProductDTO> findByStatus(Product.Status status, Pageable pageable);


    ProductDTO update(Integer id, ProductDTO dto);

    void delete(Integer id);

    boolean existsByName(String name);

    boolean existsBySlug(String slug);

    Optional<ProductDTO> findByIdOptional(Integer id);
}