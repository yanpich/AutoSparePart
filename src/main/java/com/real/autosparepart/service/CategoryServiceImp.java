package com.real.autosparepart.service;

import com.real.autosparepart.dto.CategoryDTO;
import com.real.autosparepart.exception.DuplicateResourceException;
import com.real.autosparepart.exception.ResourceNotFoundException;
import com.real.autosparepart.model.Category;
import com.real.autosparepart.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryServiceImp implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImp(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional
    public CategoryDTO createCategory(CategoryDTO dto) {

        String name = dto.getName().trim();
        String slug = dto.getSlug().trim();

        if (categoryRepository.existsByName(name)) {
            throw new DuplicateResourceException("Category name already exists");
        }

        if (categoryRepository.existsBySlug(slug)) {
            throw new DuplicateResourceException("Category slug already exists");
        }

        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);

        return mapToDTO(categoryRepository.save(category));
    }

    @Override
    public CategoryDTO findById(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        return mapToDTO(category);
    }

    @Override
    public List<CategoryDTO> findAll() {
        return categoryRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList(); // return [] if empty (correct)
    }

    @Override
    @Transactional
    public CategoryDTO updateCategory(Integer id, CategoryDTO dto) {

        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            String newName = dto.getName().trim();

            if (!newName.equals(existing.getName()) &&
                    categoryRepository.existsByName(newName)) {
                throw new DuplicateResourceException("Category name already exists");
            }

            existing.setName(newName);
        }

        if (dto.getSlug() != null && !dto.getSlug().isBlank()) {
            String newSlug = dto.getSlug().trim();

            if (!newSlug.equals(existing.getSlug()) &&
                    categoryRepository.existsBySlug(newSlug)) {
                throw new DuplicateResourceException("Category slug already exists");
            }

            existing.setSlug(newSlug);
        }
        return mapToDTO(categoryRepository.save(existing));
    }

    @Override
    @Transactional
    public void deleteById(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        categoryRepository.delete(category);
    }

    private CategoryDTO mapToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setCategoryId((Integer) category.getId());
        dto.setName(category.getName());
        dto.setSlug(category.getSlug());
        return dto;
    }
}
