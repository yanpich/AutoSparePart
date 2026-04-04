package com.real.autosparepart.service;

import com.real.autosparepart.dto.BrandDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

public interface IBrand {

    // READ - Get brand by name with full image URL
    BrandDTO getBrandByName(String brandName);

    // CREATE
    BrandDTO createBrand(BrandDTO brandDTO);

    // READ - Get all brands
    List<BrandDTO> getAllBrands();

    // READ - Get brand by ID
    BrandDTO getBrandById(Integer id);

//    // READ - Get brand by name
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

