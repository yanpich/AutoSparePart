package com.real.autosparepart.service;

import com.real.autosparepart.dto.ProductImageDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductImageService {
    ProductImageDTO getById(Integer id);

    List<ProductImageDTO> getByProductId(Integer productId);

    // Upload single image
    ProductImageDTO uploadImage(Integer productId, MultipartFile file, Boolean isPrimary);

    // Upload multiple images at once
    List<ProductImageDTO> uploadMultipleImages(Integer productId, List<MultipartFile> files, List<Boolean> isPrimaryList);

    // Upload multiple images with same primary setting
    List<ProductImageDTO> uploadMultipleImages(Integer productId, List<MultipartFile> files, Boolean isPrimary);

    ProductImageDTO update(Integer id, ProductImageDTO dto);

    void delete(Integer id);

    void deleteByProductId(Integer productId);

    void deleteMultiple(List<Integer> ids);

    ProductImageDTO setPrimaryImage(Integer id, Integer productId);
}