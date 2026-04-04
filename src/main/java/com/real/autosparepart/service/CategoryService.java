package com.real.autosparepart.service;

import com.real.autosparepart.dto.CategoryDTO;
import com.real.autosparepart.model.Category;
import com.real.autosparepart.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CategoryService implements ICategory {

    private final CategoryRepository categoryRepository;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public CategoryDTO createCategory(CategoryDTO dto) {

        // 1. Validate
        if (dto == null || dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new RuntimeException("Category cannot be null and must have a name");
        }
        if (dto.getSlug() == null || dto.getSlug().trim().isEmpty()) {
            throw new RuntimeException("Category cannot be null and must have a slug");
        }

        //2. Normalize for fix spelling and trim
        String name = dto.getName().trim();
        dto.setName(name);

        //3. Duplicate check
        if (categoryRepository.existsByName(name)) {
            throw new RuntimeException("Category with name '" + name + "' already exists");
        }
        if (categoryRepository.existsBySlug(dto.getSlug())) {
            throw new RuntimeException("Category with slug '" + dto.getSlug() + "' already exists");
        }

        //4. Mapping DTO -> Entity
        Category category = new Category();
        category.setName(name);
        category.setSlug(dto.getSlug());

        //5. Save - FIXED: use instance variable, not class name
        Category saved = categoryRepository.save(category);

        //6. Return DTO
        return mapToDTO(saved);
    }

    private CategoryDTO mapToDTO(Category saved) {
        if (saved == null) {
            throw new RuntimeException("Category cannot be null");
        }
        CategoryDTO dto = new CategoryDTO();
        dto.setCategoryId((Integer) saved.getId());
        dto.setName(saved.getName());
        dto.setSlug(saved.getSlug());
        return dto;
    }
}