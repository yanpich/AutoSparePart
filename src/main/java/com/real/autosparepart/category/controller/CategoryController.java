package com.real.autosparepart.category.controller;

import com.real.autosparepart.category.dto.CategoryDTO;
import com.real.autosparepart.category.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // ==================== GET ACTIVE CATEGORIES ====================
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping
    public ResponseEntity<?> findAll() {
        try {
            List<CategoryDTO> categories = categoryService.findAll();
            Map<String, Object> response = new HashMap<>();
            response.put("content", categories);
            response.put("total", categories.size());
            response.put("type", "active");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch categories: " + e.getMessage()));
        }
    }

    // ==================== SPECIFIC ENDPOINTS (MUST COME BEFORE {id}) ====================

    /**
     * Get all deleted categories
     * GET /api/admin/categories/deleted
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/deleted")
    public ResponseEntity<?> getDeletedCategories() {
        try {
            List<CategoryDTO> categories = categoryService.findAllDeleted();
            Map<String, Object> response = new HashMap<>();
            response.put("content", categories);
            response.put("total", categories.size());
            response.put("type", "deleted");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch deleted categories: " + e.getMessage()));
        }
    }

    /**
     * Get all categories including deleted
     * GET /api/admin/categories/all
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllCategoriesIncludingDeleted() {
        try {
            List<CategoryDTO> categories = categoryService.findAllIncludingDeleted();
            Map<String, Object> response = new HashMap<>();
            response.put("content", categories);
            response.put("total", categories.size());
            response.put("type", "all");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch all categories: " + e.getMessage()));
        }
    }

    /**
     * Get category statistics
     * GET /api/admin/categories/stats
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            Map<String, Object> stats = categoryService.getStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch stats: " + e.getMessage()));
        }
    }

    /**
     * Search categories by keyword
     * GET /api/admin/categories/search?q=keyword
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/search")
    public ResponseEntity<?> searchCategories(@RequestParam("q") String keyword) {
        try {
            List<CategoryDTO> categories = categoryService.search(keyword);
            Map<String, Object> response = new HashMap<>();
            response.put("content", categories);
            response.put("total", categories.size());
            response.put("keyword", keyword);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search categories: " + e.getMessage()));
        }
    }

    /**
     * Check if slug is available
     * GET /api/admin/categories/check-slug/{slug}
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/check-slug/{slug}")
    public ResponseEntity<?> checkSlug(@PathVariable String slug) {
        try {
            boolean available = categoryService.isSlugAvailable(slug);
            return ResponseEntity.ok(Map.of(
                    "slug", slug,
                    "available", available
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to check slug: " + e.getMessage()));
        }
    }

    /**
     * Get categories by minimum product count
     * GET /api/admin/categories/by-product-count?min=5
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/by-product-count")
    public ResponseEntity<?> getByProductCount(@RequestParam(value = "min", defaultValue = "0") int minProducts) {
        try {
            List<CategoryDTO> categories = categoryService.getByProductCount(minProducts);
            Map<String, Object> response = new HashMap<>();
            response.put("content", categories);
            response.put("total", categories.size());
            response.put("minProducts", minProducts);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch categories: " + e.getMessage()));
        }
    }

    /**
     * Get categories by status
     * GET /api/admin/categories/by-status?status=active
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/by-status")
    public ResponseEntity<?> getCategoriesByStatus(@RequestParam String status) {
        try {
            List<CategoryDTO> categories = categoryService.getByStatus(status);
            Map<String, Object> response = new HashMap<>();
            response.put("content", categories);
            response.put("total", categories.size());
            response.put("status", status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to fetch categories by status: " + e.getMessage()));
        }
    }

    /**
     * Get categories by active status
     * GET /api/admin/categories/by-active?active=true
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/by-active")
    public ResponseEntity<?> getByActiveStatus(@RequestParam boolean active) {
        try {
            List<CategoryDTO> categories = categoryService.findByActive(active);
            Map<String, Object> response = new HashMap<>();
            response.put("content", categories);
            response.put("total", categories.size());
            response.put("active", active);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch categories: " + e.getMessage()));
        }
    }

    /**
     * Get categories created after date
     * GET /api/admin/categories/created-after?date=2024-01-01T00:00:00
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/created-after")
    public ResponseEntity<?> getCategoriesCreatedAfter(@RequestParam String date) {
        try {
            List<CategoryDTO> categories = categoryService.getCategoriesCreatedAfter(date);
            Map<String, Object> response = new HashMap<>();
            response.put("content", categories);
            response.put("total", categories.size());
            response.put("date", date);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Failed to fetch categories: " + e.getMessage()));
        }
    }

    /**
     * Export categories
     * GET /api/admin/categories/export?format=json
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/export")
    public ResponseEntity<?> exportCategories(@RequestParam(defaultValue = "json") String format) {
        try {
            List<CategoryDTO> categories = categoryService.findAll();
            Map<String, Object> response = new HashMap<>();
            response.put("format", format);
            response.put("total", categories.size());
            response.put("data", categories);
            response.put("exportedAt", java.time.LocalDateTime.now().toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to export categories: " + e.getMessage()));
        }
    }

    // ==================== CRUD ENDPOINTS WITH ID (MUST COME AFTER SPECIFIC ENDPOINTS) ====================

    /**
     * Get category by ID
     * GET /api/admin/categories/{id}
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Integer id) {
        try {
            CategoryDTO category = categoryService.findById(id);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch category: " + e.getMessage()));
        }
    }

    /**
     * Create new category
     * POST /api/admin/categories
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CategoryDTO dto) {
        try {
            CategoryDTO saved = categoryService.createCategory(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Category created successfully",
                    "category", saved
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create category: " + e.getMessage()));
        }
    }

    /**
     * Update category
     * PUT /api/admin/categories/{id}
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @Valid @RequestBody CategoryDTO dto) {
        try {
            CategoryDTO updated = categoryService.updateCategory(id, dto);
            return ResponseEntity.ok(Map.of(
                    "message", "Category updated successfully",
                    "category", updated
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update category: " + e.getMessage()));
        }
    }

    /**
     * Toggle category status
     * PATCH /api/admin/categories/{id}/toggle-status
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleStatus(@PathVariable Integer id) {
        try {
            CategoryDTO category = categoryService.toggleStatus(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Category status toggled successfully",
                    "categoryId", id,
                    "status", category.getStatus(),
                    "active", category.getActive()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to toggle status: " + e.getMessage()));
        }
    }

    /**
     * Update display order
     * PATCH /api/admin/categories/{id}/display-order?order=5
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/display-order")
    public ResponseEntity<?> updateDisplayOrder(
            @PathVariable Integer id,
            @RequestParam Integer order) {
        try {
            if (order == null || order < 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Display order must be a positive number"));
            }
            categoryService.updateDisplayOrder(id, order);
            return ResponseEntity.ok(Map.of(
                    "message", "Display order updated successfully",
                    "categoryId", id,
                    "displayOrder", order
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update display order: " + e.getMessage()));
        }
    }

    /**
     * Soft delete category
     * DELETE /api/admin/categories/{id}
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> softDelete(@PathVariable Integer id) {
        try {
            categoryService.softDelete(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Category deleted successfully",
                    "categoryId", id,
                    "status", "deleted"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete category: " + e.getMessage()));
        }
    }

    /**
     * Restore deleted category
     * PATCH /api/admin/categories/{id}/restore
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/restore")
    public ResponseEntity<?> restore(@PathVariable Integer id) {
        try {
            categoryService.restore(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Category restored successfully",
                    "categoryId", id,
                    "status", "active"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to restore category: " + e.getMessage()));
        }
    }

    /**
     * Hard delete (permanent) category
     * DELETE /api/admin/categories/{id}/permanent
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<?> hardDelete(@PathVariable Integer id) {
        try {
            categoryService.hardDelete(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Category permanently deleted",
                    "categoryId", id
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to permanently delete category: " + e.getMessage()));
        }
    }

    // ==================== BULK OPERATIONS ====================

    /**
     * Bulk soft delete categories
     * DELETE /api/admin/categories/bulk
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/bulk")
    public ResponseEntity<?> bulkSoftDelete(@RequestBody List<Integer> ids) {
        try {
            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Category IDs list cannot be empty"));
            }
            categoryService.bulkSoftDelete(ids);
            return ResponseEntity.ok(Map.of(
                    "message", "Categories deleted successfully",
                    "count", ids.size()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete categories: " + e.getMessage()));
        }
    }

    /**
     * Bulk restore categories
     * PATCH /api/admin/categories/bulk/restore
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/bulk/restore")
    public ResponseEntity<?> bulkRestore(@RequestBody List<Integer> ids) {
        try {
            if (ids == null || ids.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Category IDs list cannot be empty"));
            }
            categoryService.bulkRestore(ids);
            return ResponseEntity.ok(Map.of(
                    "message", "Categories restored successfully",
                    "count", ids.size()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to restore categories: " + e.getMessage()));
        }
    }
}