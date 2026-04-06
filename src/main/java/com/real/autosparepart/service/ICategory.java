package com.real.autosparepart.service;

import com.real.autosparepart.dto.CategoryDTO;

import java.util.List;

public interface ICategory {
    // RCUD Operation
    CategoryDTO createCategory(CategoryDTO dto);
    // READ - by id
    CategoryDTO findById(Integer id);

    // READ - all categories
    List<CategoryDTO> findAll();

    CategoryDTO updateCategory(Integer id, CategoryDTO categoryDTO);

    // Delete
    void deleteById(Integer id);
}
