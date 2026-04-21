package com.real.autosparepart.service;

import com.real.autosparepart.dto.BrandDTO;

import java.util.List;

public interface BrandService {

    // READ - Get brand-admin-panel by name with full image URL
    BrandDTO getBrandByName(String brandName);

    // CREATE
    BrandDTO createBrand(BrandDTO brandDTO);

    // READ - Get all brands
    List<BrandDTO> getAllBrands();

    // READ - Get brand-admin-panel by ID
    BrandDTO getBrandById(Integer id);

//    // READ - Get brand-admin-panel by name
//    BrandDTO getBrandByName(String brandName);

    // UPDATE
    BrandDTO updateBrand(Integer id, BrandDTO brandDTO);

    // DELETE
    void deleteBrand(Integer id);

    // DELETE by name
    void deleteBrandByName(String brandName);

    // Check exists
    boolean existsByBrandName(String brandName);
}

