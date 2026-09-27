package com.real.autosparepart.category.service;

import com.real.autosparepart.category.dto.CategoryDTO;
import com.real.autosparepart.category.entity.Category;
import com.real.autosparepart.category.repository.CategoryRepository;
import com.real.autosparepart.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class CategoryServiceImp implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImp(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // ==================== HELPER METHODS ====================

    private Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof User) {
                return ((User) principal).getUserId();
            }
        }
        return 1; // Default admin ID if not authenticated
    }

    private String generateSlug(String name) {
        if (name == null) {
            return null;
        }
        return name.toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
    }

    private CategoryDTO mapToDTO(Category c) {
        if (c == null) {
            return null;
        }

        return CategoryDTO.builder()
                .categoryId(c.getCategoryId())
                .categoryName(c.getCategoryName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .status(Boolean.valueOf(c.getStatus()))
                .productCount(c.getProducts() == null ? 0 : c.getProducts().size())
                .createdAt(c.getCreatedAt() == null ? null : c.getCreatedAt().toString())
                .updatedAt(c.getUpdatedAt() == null ? null : c.getUpdatedAt().toString())
                .build();
    }

    private Category findCategoryEntityById(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));
    }

    // ==================== GET METHODS ====================

    @Override
    public CategoryDTO findById(Integer id) {
        Category category = findCategoryEntityById(id);
        return mapToDTO(category);
    }

    @Override
    public List<CategoryDTO> findAll() {
        List<Category> categories = categoryRepository.findAllActive();
        return categories.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryDTO> findAllDeleted() {
        List<Category> categories = categoryRepository.findAllDeleted();
        return categories.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryDTO> findAllIncludingDeleted() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryDTO> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return findAll();
        }
        List<Category> categories = categoryRepository.searchActive(keyword.trim());
        return categories.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCategories", categoryRepository.count());
        stats.put("activeCategories", categoryRepository.countActive());
        stats.put("deletedCategories", categoryRepository.countDeleted());
        stats.put("activeStatusCount", categoryRepository.countByStatus("active"));
        stats.put("inactiveStatusCount", categoryRepository.countByStatus("inactive"));

        // Additional stats
        List<Category> allCategories = categoryRepository.findAll();
        long categoriesWithProducts = allCategories.stream()
                .filter(c -> c.getProducts() != null && !c.getProducts().isEmpty())
                .count();
        stats.put("categoriesWithProducts", categoriesWithProducts);
        stats.put("categoriesWithoutProducts", allCategories.size() - categoriesWithProducts);

        return stats;
    }

    @Override
    public List<CategoryDTO> getByProductCount(int minProducts) {
        List<Category> categories = categoryRepository.findAllActive();
        return categories.stream()
                .filter(c -> c.getProducts() != null && c.getProducts().size() >= minProducts)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean isSlugAvailable(String slug) {
        if (slug == null || slug.trim().isEmpty()) {
            return false;
        }
        // Check if any active category has this slug
        List<Category> categories = categoryRepository.findAllActive();
        return categories.stream()
                .noneMatch(c -> c.getSlug().equalsIgnoreCase(slug.trim()));
    }

    @Override
    public List<CategoryDTO> getByStatus(String status) {
        List<Category> categories = categoryRepository.findByStatus(status);
        return categories.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryDTO> findByActive(boolean active) {
        List<Category> categories = categoryRepository.findByActive(active);
        return categories.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CategoryDTO> getCategoriesCreatedAfter(String date) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            LocalDateTime dateTime = LocalDateTime.parse(date, formatter);
            List<Category> categories = categoryRepository.findCategoriesCreatedAfter(dateTime);
            return categories.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            throw new RuntimeException("Invalid date format. Please use ISO format (yyyy-MM-ddTHH:mm:ss)", e);
        }
    }

    @Override
    @Transactional
    public CategoryDTO toggleStatus(Integer id) {
        Category category = findCategoryEntityById(id);

        if (category.isDeleted()) {
            throw new RuntimeException("Cannot toggle status of deleted category. Please restore it first.");
        }

        // Toggle active status
        boolean newActive = !category.getActive();
        category.setActive(newActive);
        category.setStatus(newActive ? "active" : "inactive");

        Category updatedCategory = categoryRepository.save(category);
        log.info("Category status toggled: ID={}, New Status={}", id, category.getStatus());

        return mapToDTO(updatedCategory);
    }

    // ==================== CREATE & UPDATE ====================

    @Override
    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        // Validate category name
        if (categoryDTO.getCategoryName() == null || categoryDTO.getCategoryName().trim().isEmpty()) {
            throw new RuntimeException("Category name is required");
        }

        // Check if category name already exists
        if (categoryRepository.existsActiveByCategoryName(categoryDTO.getCategoryName())) {
            throw new RuntimeException("Category name already exists: " + categoryDTO.getCategoryName());
        }

        // Generate slug if not provided
        if (categoryDTO.getSlug() == null || categoryDTO.getSlug().trim().isEmpty()) {
            categoryDTO.setSlug(generateSlug(categoryDTO.getCategoryName()));
        }

        // Check if slug already exists
        String slug = categoryDTO.getSlug().trim().toLowerCase();
        if (!isSlugAvailable(slug)) {
            // Append random number to make slug unique
            slug = slug + "-" + System.currentTimeMillis() % 1000;
            categoryDTO.setSlug(slug);
        }

        Category category = new Category();
        category.setCategoryName(categoryDTO.getCategoryName().trim());
        category.setSlug(slug);
        category.setDescription(categoryDTO.getDescription());
        category.setStatus("active");
        category.setActive(true);
        category.setDeleted(false);
        category.setDisplayOrder(0);

        Category savedCategory = categoryRepository.save(category);
        log.info("Category created successfully: {} with ID: {}", savedCategory.getCategoryName(), savedCategory.getCategoryId());

        return mapToDTO(savedCategory);
    }

    @Override
    @Transactional
    public CategoryDTO updateCategory(Integer id, CategoryDTO categoryDTO) {
        Category existingCategory = findCategoryEntityById(id);

        // Check if category is deleted
        if (existingCategory.isDeleted()) {
            throw new RuntimeException("Cannot update deleted category. Please restore it first.");
        }

        // Update category name if changed
        if (categoryDTO.getCategoryName() != null && !categoryDTO.getCategoryName().trim().isEmpty()) {
            String newName = categoryDTO.getCategoryName().trim();
            if (!existingCategory.getCategoryName().equalsIgnoreCase(newName)) {
                // Check if new name conflicts with other categories
                if (categoryRepository.existsActiveByCategoryName(newName)) {
                    throw new RuntimeException("Category name already exists: " + newName);
                }
                existingCategory.setCategoryName(newName);
            }
        }

        // Update slug if provided
        if (categoryDTO.getSlug() != null && !categoryDTO.getSlug().trim().isEmpty()) {
            String newSlug = categoryDTO.getSlug().trim().toLowerCase();
            if (!existingCategory.getSlug().equalsIgnoreCase(newSlug)) {
                if (!isSlugAvailable(newSlug)) {
                    throw new RuntimeException("Slug already exists: " + newSlug);
                }
                existingCategory.setSlug(newSlug);
            }
        } else if (categoryDTO.getCategoryName() != null) {
            // Auto-generate slug from new name
            String newSlug = generateSlug(categoryDTO.getCategoryName());
            if (!existingCategory.getSlug().equalsIgnoreCase(newSlug) && isSlugAvailable(newSlug)) {
                existingCategory.setSlug(newSlug);
            }
        }

        // Update description
        if (categoryDTO.getDescription() != null) {
            existingCategory.setDescription(categoryDTO.getDescription());
        }

        // Update status
        if (categoryDTO.getStatus() != null) {
            existingCategory.setStatus(String.valueOf(categoryDTO.getStatus()));
            existingCategory.setActive("active".equalsIgnoreCase(String.valueOf(categoryDTO.getStatus())));
        }

        Category updatedCategory = categoryRepository.save(existingCategory);
        log.info("Category updated successfully: {} with ID: {}", updatedCategory.getCategoryName(), updatedCategory.getCategoryId());

        return mapToDTO(updatedCategory);
    }

    @Override
    @Transactional
    public void updateDisplayOrder(Integer id, Integer displayOrder) {
        Category category = findCategoryEntityById(id);
        categoryRepository.updateDisplayOrder(id, displayOrder);
        log.info("Display order updated for category ID: {}, New Order: {}", id, displayOrder);
    }

    // ==================== DELETE OPERATIONS ====================

    @Override
    @Transactional
    public void softDelete(Integer id) {
        Category category = findCategoryEntityById(id);

        if (category.isDeleted()) {
            throw new RuntimeException("Category already deleted: " + id);
        }

        // Check if category has products
        if (categoryRepository.isUsedInProducts(id)) {
            throw new RuntimeException("Cannot delete category as it has associated products. Please remove products first.");
        }

        Integer currentUserId = getCurrentUserId();
        categoryRepository.softDeleteById(id, LocalDateTime.now(), currentUserId);
        log.info("Category soft deleted successfully with ID: {}", id);
    }

    @Override
    @Transactional
    public void restore(Integer id) {
        Category category = findCategoryEntityById(id);

        if (!category.isDeleted()) {
            throw new RuntimeException("Category is not deleted: " + id);
        }

        Integer currentUserId = getCurrentUserId();
        categoryRepository.restoreById(id, LocalDateTime.now(), currentUserId);
        log.info("Category restored successfully with ID: {}", id);
    }

    @Override
    @Transactional
    public void hardDelete(Integer id) {
        Category category = findCategoryEntityById(id);

        // Check if category has products
        if (categoryRepository.isUsedInProducts(id)) {
            throw new RuntimeException("Cannot permanently delete category as it has associated products. Please remove products first.");
        }

        categoryRepository.hardDeleteById(id);
        log.info("Category permanently deleted with ID: {}", id);
    }

    @Override
    @Transactional
    public void bulkSoftDelete(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new RuntimeException("Category IDs list cannot be empty");
        }

        // Check if any category has products
        for (Integer id : ids) {
            if (categoryRepository.isUsedInProducts(id)) {
                Category category = findCategoryEntityById(id);
                throw new RuntimeException("Cannot delete category '" + category.getCategoryName() +
                        "' (ID: " + id + ") as it has associated products.");
            }
        }

        Integer currentUserId = getCurrentUserId();
        categoryRepository.softDeleteByIds(ids, LocalDateTime.now(), currentUserId);
        log.info("Bulk soft delete completed for {} categories", ids.size());
    }

    @Override
    @Transactional
    public void bulkRestore(List<Integer> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new RuntimeException("Category IDs list cannot be empty");
        }

        Integer currentUserId = getCurrentUserId();
        categoryRepository.restoreByIds(ids, LocalDateTime.now(), currentUserId);
        log.info("Bulk restore completed for {} categories", ids.size());
    }
}