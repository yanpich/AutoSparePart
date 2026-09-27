package com.real.autosparepart.brand.service;

import com.real.autosparepart.brand.dto.BrandDTO;
import com.real.autosparepart.brand.dto.BrandStats;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BrandService {
    // CRUD operations
    BrandDTO createBrand(BrandDTO brandDTO);
    BrandDTO getBrandById(Integer id);
    BrandDTO getBrandByName(String brandName);
    List<BrandDTO> getAllBrands();
    Page<BrandDTO> getAllBrands(Pageable pageable);
    BrandDTO updateBrand(Integer id, BrandDTO brandDTO);

    // Soft delete operations
    void softDeleteBrand(Integer id, Integer deletedBy);
    void softDeleteBrandByName(String brandName, Integer deletedBy);
    void restoreBrand(Integer id, Integer restoredBy);
    void restoreBrandByName(String brandName, Integer restoredBy);

    // Hard delete operations
    void hardDeleteBrand(Integer id);
    void hardDeleteBrandByName(String brandName);

    // Query operations
    List<BrandDTO> getAllDeletedBrands();
    List<BrandDTO> getBrandsByStatus(String status);
    List<BrandDTO> searchBrands(String searchTerm);
    Page<BrandDTO> searchBrands(String searchTerm, Pageable pageable);

    // Stats
    BrandStats getBrandStats();

    // Cleanup
    int permanentlyDeleteOldBrands(int daysOld);

    // Validation
    boolean existsByBrandName(String brandName);
    boolean existsActiveByBrandName(String brandName);

    // Bulk operations
    void bulkSoftDelete(List<Integer> ids, Integer deletedBy);
    void bulkRestore(List<Integer> ids, Integer restoredBy);
    void bulkHardDelete(List<Integer> ids);
}