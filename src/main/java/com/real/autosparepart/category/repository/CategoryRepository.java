package com.real.autosparepart.category.repository;

import com.real.autosparepart.category.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Integer> {

    // ==================== FIND METHODS ====================

    // Find active categories (not deleted)
    @Query("SELECT c FROM Category c WHERE c.deleted = false ORDER BY c.displayOrder ASC")
    List<Category> findAllActive();

    @Query("SELECT c FROM Category c WHERE c.deleted = false")
    Page<Category> findAllActive(Pageable pageable);

    // Find deleted categories
    @Query("SELECT c FROM Category c WHERE c.deleted = true")
    List<Category> findAllDeleted();

    @Query("SELECT c FROM Category c WHERE c.deleted = true")
    Page<Category> findAllDeleted(Pageable pageable);

    // Find by status
    @Query("SELECT c FROM Category c WHERE c.status = :status AND c.deleted = false")
    List<Category> findByStatus(@Param("status") String status);

    // Find by active status
    @Query("SELECT c FROM Category c WHERE c.active = :active AND c.deleted = false")
    List<Category> findByActive(@Param("active") Boolean active);

    // Search active categories
    @Query("SELECT c FROM Category c WHERE c.deleted = false AND LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Category> searchActive(@Param("searchTerm") String searchTerm);

    // Search all categories (including deleted)
    @Query("SELECT c FROM Category c WHERE LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Category> searchAll(@Param("searchTerm") String searchTerm);

    // Find by name (including deleted)
    @Query("SELECT c FROM Category c WHERE LOWER(c.categoryName) = LOWER(:categoryName)")
    Optional<Category> findByCategoryName(@Param("categoryName") String categoryName);

    // Find active by name (case insensitive)
    @Query("SELECT c FROM Category c WHERE LOWER(c.categoryName) = LOWER(:categoryName) AND c.deleted = false")
    Optional<Category> findActiveByCategoryName(@Param("categoryName") String categoryName);

    // Find categories created after date
    @Query("SELECT c FROM Category c WHERE c.createdAt >= :date AND c.deleted = false ORDER BY c.createdAt DESC")
    List<Category> findCategoriesCreatedAfter(@Param("date") LocalDateTime date);

    // Find categories by multiple IDs
    @Query("SELECT c FROM Category c WHERE c.categoryId IN :ids AND c.deleted = false")
    List<Category> findByIds(@Param("ids") List<Integer> ids);

    // Find categories deleted before a certain date
    @Query("SELECT c FROM Category c WHERE c.deleted = true AND c.deletedAt <= :date")
    List<Category> findDeletedBefore(@Param("date") LocalDateTime date);

    // Find recently updated categories
    @Query("SELECT c FROM Category c WHERE c.updatedAt >= :date AND c.deleted = false ORDER BY c.updatedAt DESC")
    List<Category> findRecentlyUpdated(@Param("date") LocalDateTime date);

    // ==================== CHECK METHODS ====================

    // Check if active category exists by name
    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE LOWER(c.categoryName) = LOWER(:categoryName) AND c.deleted = false")
    boolean existsActiveByCategoryName(@Param("categoryName") String categoryName);

    // Check if category exists (including deleted)
    boolean existsByCategoryName(String categoryName);

    // Check if category is used in products
    @Query("SELECT COUNT(p) > 0 FROM Product p WHERE p.category.categoryId = :categoryId")
    boolean isUsedInProducts(@Param("categoryId") Integer categoryId);

    // Check if category is active and not deleted
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Category c WHERE c.categoryId = :id AND c.active = true AND c.deleted = false")
    boolean isActiveAndNotDeleted(@Param("id") Integer id);

    // ==================== COUNT METHODS ====================

    // Count active categories
    @Query("SELECT COUNT(c) FROM Category c WHERE c.deleted = false")
    Long countActive();

    // Count deleted categories
    @Query("SELECT COUNT(c) FROM Category c WHERE c.deleted = true")
    Long countDeleted();

    // Count by status
    @Query("SELECT COUNT(c) FROM Category c WHERE c.status = :status")
    Long countByStatus(@Param("status") String status);

    // Count categories with products
    @Query("SELECT COUNT(DISTINCT c) FROM Category c JOIN c.products p WHERE c.deleted = false")
    Long countCategoriesWithProducts();

    // ==================== UPDATE METHODS ====================

    // Soft delete by ID
    @Modifying
    @Transactional
    @Query("UPDATE Category c SET c.deleted = true, c.deletedAt = :deletedAt, c.deletedBy = :deletedBy, c.status = 'deleted', c.active = false WHERE c.categoryId = :id")
    void softDeleteById(@Param("id") Integer id, @Param("deletedAt") LocalDateTime deletedAt, @Param("deletedBy") Integer deletedBy);

    // Restore by ID
    @Modifying
    @Transactional
    @Query("UPDATE Category c SET c.deleted = false, c.deletedAt = NULL, c.deletedBy = NULL, c.restoredAt = :restoredAt, c.restoredBy = :restoredBy, c.status = 'active', c.active = true WHERE c.categoryId = :id")
    void restoreById(@Param("id") Integer id, @Param("restoredAt") LocalDateTime restoredAt, @Param("restoredBy") Integer restoredBy);

    // Update display order
    @Modifying
    @Transactional
    @Query("UPDATE Category c SET c.displayOrder = :displayOrder WHERE c.categoryId = :id")
    void updateDisplayOrder(@Param("id") Integer id, @Param("displayOrder") Integer displayOrder);

    // Bulk soft delete by IDs
    @Modifying
    @Transactional
    @Query("UPDATE Category c SET c.deleted = true, c.deletedAt = :deletedAt, c.deletedBy = :deletedBy, c.status = 'deleted', c.active = false WHERE c.categoryId IN :ids")
    void softDeleteByIds(@Param("ids") List<Integer> ids, @Param("deletedAt") LocalDateTime deletedAt, @Param("deletedBy") Integer deletedBy);

    // Bulk restore by IDs
    @Modifying
    @Transactional
    @Query("UPDATE Category c SET c.deleted = false, c.deletedAt = NULL, c.deletedBy = NULL, c.restoredAt = :restoredAt, c.restoredBy = :restoredBy, c.status = 'active', c.active = true WHERE c.categoryId IN :ids")
    void restoreByIds(@Param("ids") List<Integer> ids, @Param("restoredAt") LocalDateTime restoredAt, @Param("restoredBy") Integer restoredBy);

    // Update category status
    @Modifying
    @Transactional
    @Query("UPDATE Category c SET c.status = :status, c.active = :active WHERE c.categoryId = :id")
    void updateStatus(@Param("id") Integer id, @Param("status") String status, @Param("active") Boolean active);

    // Update category name
    @Modifying
    @Transactional
    @Query("UPDATE Category c SET c.categoryName = :name WHERE c.categoryId = :id")
    void updateCategoryName(@Param("id") Integer id, @Param("name") String name);

    // ==================== DELETE METHODS ====================

    // Permanently delete by ID
    @Modifying
    @Transactional
    @Query("DELETE FROM Category c WHERE c.categoryId = :id")
    void hardDeleteById(@Param("id") Integer id);

    // Delete by category name
    @Modifying
    @Transactional
    void deleteByCategoryName(String categoryName);

    // Bulk permanent delete
    @Modifying
    @Transactional
    @Query("DELETE FROM Category c WHERE c.categoryId IN :ids")
    void hardDeleteByIds(@Param("ids") List<Integer> ids);

    // Delete categories deleted before date
    @Modifying
    @Transactional
    @Query("DELETE FROM Category c WHERE c.deleted = true AND c.deletedAt <= :date")
    void deletePermanentlyBefore(@Param("date") LocalDateTime date);

    // ==================== COMPLEX QUERIES ====================

    // Find categories with product count
    @Query("SELECT c, COUNT(p) as productCount FROM Category c LEFT JOIN c.products p WHERE c.deleted = false GROUP BY c ORDER BY COUNT(p) DESC")
    List<Object[]> findCategoriesWithProductCount();

    // Find top categories by product count
    @Query("SELECT c, COUNT(p) as productCount FROM Category c LEFT JOIN c.products p WHERE c.deleted = false GROUP BY c ORDER BY COUNT(p) DESC")
    List<Object[]> findTopCategoriesByProductCount(Pageable pageable);

    // Find categories with no products
    @Query("SELECT c FROM Category c WHERE c.deleted = false AND c.categoryId NOT IN (SELECT DISTINCT p.category.categoryId FROM Product p WHERE p.category IS NOT NULL)")
    List<Category> findCategoriesWithNoProducts();

    // Search categories with pagination
    @Query("SELECT c FROM Category c WHERE c.deleted = false AND LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Category> searchActivePaginated(@Param("searchTerm") String searchTerm, Pageable pageable);

    // Find categories by date range
    @Query("SELECT c FROM Category c WHERE c.createdAt BETWEEN :startDate AND :endDate AND c.deleted = false")
    List<Category> findCategoriesByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Get all categories with their product count using native query
    @Query(value = "SELECT c.*, COUNT(p.product_id) as product_count FROM categories c LEFT JOIN products p ON c.category_id = p.category_id WHERE c.deleted = false GROUP BY c.category_id ORDER BY c.display_order ASC", nativeQuery = true)
    List<Object[]> findCategoriesWithProductCountNative();
}