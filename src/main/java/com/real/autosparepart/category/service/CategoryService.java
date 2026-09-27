package com.real.autosparepart.category.service;

import com.real.autosparepart.category.dto.CategoryDTO;

import java.util.List;
import java.util.Map;

public interface CategoryService {
    // ==================== GET METHODS ====================
    CategoryDTO findById(Integer id);
    List<CategoryDTO> findAll();
    List<CategoryDTO> findAllDeleted();
    List<CategoryDTO> findAllIncludingDeleted();
    List<CategoryDTO> search(String keyword);
    Map<String, Object> getStats();
    List<CategoryDTO> getByProductCount(int minProducts);
    boolean isSlugAvailable(String slug);
    List<CategoryDTO> getByStatus(String status);
    List<CategoryDTO> findByActive(boolean active);
    List<CategoryDTO> getCategoriesCreatedAfter(String date);
    CategoryDTO toggleStatus(Integer id);

    // ==================== CREATE & UPDATE ====================
    CategoryDTO createCategory(CategoryDTO categoryDTO);
    CategoryDTO updateCategory(Integer id, CategoryDTO categoryDTO);
    void updateDisplayOrder(Integer id, Integer displayOrder);

    // ==================== DELETE OPERATIONS ====================
    void softDelete(Integer id);
    void restore(Integer id);
    void hardDelete(Integer id);
    void bulkSoftDelete(List<Integer> ids);
    void bulkRestore(List<Integer> ids);
}