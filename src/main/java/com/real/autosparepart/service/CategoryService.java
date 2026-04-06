package com.real.autosparepart.service;

import com.real.autosparepart.dto.CategoryDTO;
import com.real.autosparepart.model.Category;
import com.real.autosparepart.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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

        // 2. Normalize for fix spelling and trim
        String name = dto.getName().trim();
        String slug = dto.getSlug().trim();
        dto.setName(name);
        dto.setSlug(slug);

        // 3. Duplicate check
        if (categoryRepository.existsByName(name)) {
            throw new RuntimeException("Category with name '" + name + "' already exists");
        }
        if (categoryRepository.existsBySlug(slug)) {
            throw new RuntimeException("Category with slug '" + slug + "' already exists");
        }

        // 4. Mapping DTO -> Entity
        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);

        // 5. Save
        Category saved = categoryRepository.save(category);

        // 6. Return DTO
        return mapToDTO(saved);
    }

    @Override
    public CategoryDTO findById(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category with id '" + id + "' not found"));
        return mapToDTO(category);
    }

    @Override
    public List<CategoryDTO> findAll() {
        List<Category> categories = categoryRepository.findAll();
        if (categories.isEmpty()) {
            throw new RuntimeException("Categories not found");
        }
        return categories.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDTO updateCategory(Integer id, CategoryDTO categoryDTO) {
        // 1. Validate input
        if (categoryDTO == null) {
            throw new RuntimeException("Category cannot be null");
        }

        // 2. Find existing category
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category with id '" + id + "' not found"));

        // 3. Update name if provided
        if (categoryDTO.getName() != null && !categoryDTO.getName().trim().isEmpty()) {
            String newName = categoryDTO.getName().trim();

            // Check if name is being changed and if new name already exists
            if (!newName.equals(existingCategory.getName()) &&
                    categoryRepository.existsByName(newName)) {
                throw new RuntimeException("Category with name '" + newName + "' already exists");
            }
            existingCategory.setName(newName);
        }

        // 4. Update slug if provided
        if (categoryDTO.getSlug() != null && !categoryDTO.getSlug().trim().isEmpty()) {
            String newSlug = categoryDTO.getSlug().trim();

            // Check if slug is being changed and if new slug already exists
            if (!newSlug.equals(existingCategory.getSlug()) &&
                    categoryRepository.existsBySlug(newSlug)) {
                throw new RuntimeException("Category with slug '" + newSlug + "' already exists");
            }
            existingCategory.setSlug(newSlug);
        }

        // 5. Save updated category
        Category updated = categoryRepository.save(existingCategory);

        // 6. Return DTO
        return mapToDTO(updated);
    }

    @Override
    public void deleteById(Integer id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category with id '" + id + "' not found");
        }
        categoryRepository.deleteById(id);
    }

    private CategoryDTO mapToDTO(Category category) {
        if (category == null) {
            throw new RuntimeException("Category cannot be null");
        }
        CategoryDTO dto = new CategoryDTO();
        // FIXED: Removed unnecessary cast (Integer) since category.getId() likely returns Integer
        dto.setCategoryId((Integer) category.getId());
        dto.setName(category.getName());
        dto.setSlug(category.getSlug());
        return dto;
    }
}