package com.real.autosparepart.brand.repository;

import com.real.autosparepart.brand.entity.Brand;
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

public interface BrandRepository extends JpaRepository<Brand, Integer> {

    // Find active brands (not deleted)
    @Query(value = "SELECT * FROM brands WHERE deleted = false", nativeQuery = true)
    List<Brand> findAllActive();

    @Query("SELECT b FROM Brand b WHERE b.deleted = false")
    Page<Brand> findAllActive(Pageable pageable);

    // Find deleted brands
    @Query("SELECT b FROM Brand b WHERE b.deleted = true")
    List<Brand> findAllDeleted();

    // Find by status
    @Query("SELECT b FROM Brand b WHERE b.status = :status AND b.deleted = false")
    List<Brand> findByStatus(@Param("status") String status);

    // Search in active brands
    @Query("SELECT b FROM Brand b WHERE b.deleted = false AND LOWER(b.brandName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Brand> searchActive(@Param("searchTerm") String searchTerm);

    // Find active by name (case insensitive)
    @Query("SELECT b FROM Brand b WHERE LOWER(b.brandName) = LOWER(:brandName) AND b.deleted = false")
    Optional<Brand> findActiveByBrandName(@Param("brandName") String brandName);

    // Check if active brand exists by name
    @Query("SELECT COUNT(b) > 0 FROM Brand b WHERE LOWER(b.brandName) = LOWER(:brandName) AND b.deleted = false")
    boolean existsActiveByBrandName(@Param("brandName") String brandName);

    // Check if brand exists (including deleted)
    boolean existsByBrandName(String brandName);

    // Soft delete by ID
    @Modifying
    @Transactional
    @Query("UPDATE Brand b SET b.deleted = true, b.deletedAt = :deletedAt, b.deletedBy = :deletedBy, b.status = 'deleted', b.active = false WHERE b.brandId = :id")
    void softDeleteById(@Param("id") Integer id, @Param("deletedAt") LocalDateTime deletedAt, @Param("deletedBy") Integer deletedBy);

    // Restore by ID
    @Modifying
    @Transactional
    @Query("UPDATE Brand b SET b.deleted = false, b.deletedAt = NULL, b.deletedBy = NULL, b.restoredAt = :restoredAt, b.restoredBy = :restoredBy, b.status = 'active', b.active = true WHERE b.brandId = :id")
    void restoreById(@Param("id") Integer id, @Param("restoredAt") LocalDateTime restoredAt, @Param("restoredBy") Integer restoredBy);

    // Find brands deleted before a certain date
    @Query("SELECT b FROM Brand b WHERE b.deleted = true AND b.deletedAt <= :date")
    List<Brand> findDeletedBefore(@Param("date") LocalDateTime date);

    // Count active brands
    @Query("SELECT COUNT(b) FROM Brand b WHERE b.deleted = false")
    long countActive();

    // Count deleted brands
    @Query("SELECT COUNT(b) FROM Brand b WHERE b.deleted = true")
    long countDeleted();

    // Permanently delete
    @Modifying
    @Transactional
    @Query("DELETE FROM Brand b WHERE b.brandId = :id")
    void hardDeleteById(@Param("id") Integer id);

    // Find by name (including deleted)
    @Query("SELECT b FROM Brand b WHERE LOWER(b.brandName) = LOWER(:brandName)")
    Optional<Brand> findByBrandName(@Param("brandName") String brandName);

    void deleteByBrandName(String brandName);

    // Get brands with product count - fix this query
    @Query("SELECT b, COUNT(p) FROM Brand b LEFT JOIN b.products p WHERE b.deleted = false GROUP BY b")
    List<Object[]> findActiveWithProductCount();

}