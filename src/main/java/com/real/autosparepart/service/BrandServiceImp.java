package com.real.autosparepart.service;

import com.real.autosparepart.dto.BrandDTO;
import com.real.autosparepart.model.Brand;
import com.real.autosparepart.repository.BrandRepository;
import com.real.autosparepart.util.BrandUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BrandServiceImp implements BrandService {

    private final BrandRepository brandRepository;
    private final FileService fileService;

    public BrandServiceImp(BrandRepository brandRepository, FileService fileService) {
        this.brandRepository = brandRepository;
        this.fileService = fileService;
    }

    @Value("${app.images.brand-admin-panel-path:uploads/brands/}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    // READ - Get all brands with full image URLs
    @Override
    public List<BrandDTO> getAllBrands() {
        return brandRepository.findAll()
                .stream()
                .map(brand -> BrandUtils.convertToDTOWithUrl(brand, baseUrl))
                .collect(Collectors.toList());
    }

    // READ - Get brand by ID with full image URL
    @Override
    public BrandDTO getBrandById(Integer id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));
        return BrandUtils.convertToDTOWithUrl(brand, baseUrl);
    }

    // READ - Get brand by name with full image URL
    @Override
    public BrandDTO getBrandByName(String brandName) {
        Brand brand = brandRepository.findByBrandName(brandName)
                .orElseThrow(() -> new RuntimeException("Brand not found with name: " + brandName));
        return BrandUtils.convertToDTOWithUrl(brand, baseUrl);
    }

    // CREATE
    @Override
    @Transactional
    public BrandDTO createBrand(BrandDTO brandDTO) {
        try {
            // Validate and clean brand name
            BrandUtils.validateBrandDTO(brandDTO);

            String brandName = BrandUtils.cleanBrandName(brandDTO.getBrandName());

            // Check duplicate
            if (brandRepository.existsByBrandName(brandName)) {
                throw new RuntimeException("Brand with name '" + brandName + "' already exists");
            }

            // Handle file upload
            String imagePath = null;
            if (brandDTO.getFile() != null && !brandDTO.getFile().isEmpty()) {
                imagePath = fileService.uploadFile(uploadDir, brandDTO.getFile());
            } else if (brandDTO.getImage() != null && !brandDTO.getImage().isEmpty()) {
                imagePath = brandDTO.getImage();
            } else {
                throw new RuntimeException("Brand image is required");
            }

            // Save brand
            Brand brand = Brand.builder()
                    .brandName(brandName)
                    .image(imagePath)
                    .build();

            Brand savedBrand = brandRepository.save(brand);

            // Return DTO with full URL
            return BrandUtils.convertToDTOWithUrl(savedBrand, baseUrl);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload brand image: " + e.getMessage());
        }
    }

    // UPDATE
    @Override
    @Transactional
    public BrandDTO updateBrand(Integer id, BrandDTO brandDTO) {
        try {
            Brand existingBrand = brandRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));

            // Update name if provided
            if (brandDTO.getBrandName() != null && !brandDTO.getBrandName().trim().isEmpty()) {
                String newName = BrandUtils.cleanBrandName(brandDTO.getBrandName());

                if (!existingBrand.getBrandName().equals(newName) &&
                        brandRepository.existsByBrandName(newName)) {
                    throw new RuntimeException("Brand with name '" + newName + "' already exists");
                }
                existingBrand.setBrandName(newName);
            }

            // Update image if provided
            if (brandDTO.getFile() != null && !brandDTO.getFile().isEmpty()) {
                // Delete old image if it's a local file
                if (BrandUtils.isLocalFile(existingBrand.getImage())) {
                    try {
                        fileService.deleteFile(uploadDir, existingBrand.getImage());
                    } catch (Exception e) {
                        System.err.println("Could not delete old image: " + e.getMessage());
                    }
                }
                // Upload new image
                String newImagePath = fileService.uploadFile(uploadDir, brandDTO.getFile());
                existingBrand.setImage(newImagePath);
            } else if (brandDTO.getImage() != null && !brandDTO.getImage().isEmpty()) {
                existingBrand.setImage(brandDTO.getImage());
            }

            Brand updatedBrand = brandRepository.save(existingBrand);
            return BrandUtils.convertToDTOWithUrl(updatedBrand, baseUrl);

        } catch (IOException e) {
            throw new RuntimeException("Failed to update brand image: " + e.getMessage());
        }
    }

    // DELETE by ID
    @Override
    @Transactional
    public void deleteBrand(Integer id) {
        try {
            Brand brand = brandRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));

            // Delete image file if it's a local file
            if (BrandUtils.isLocalFile(brand.getImage())) {
                try {
                    fileService.deleteFile(uploadDir, brand.getImage());
                } catch (Exception e) {
                    System.err.println("Could not delete image: " + e.getMessage());
                }
            }

            brandRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete brand: " + e.getMessage());
        }
    }

    // DELETE by Name
    @Override
    @Transactional
    public void deleteBrandByName(String brandName) {
        try {
            Brand brand = brandRepository.findByBrandName(brandName)
                    .orElseThrow(() -> new RuntimeException("Brand not found with name: " + brandName));

            // Delete image file if it's a local file
            if (BrandUtils.isLocalFile(brand.getImage())) {
                try {
                    fileService.deleteFile(uploadDir, brand.getImage());
                } catch (Exception e) {
                    System.err.println("Could not delete image: " + e.getMessage());
                }
            }

            brandRepository.deleteByBrandName(brandName);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete brand by name: " + e.getMessage());
        }
    }

    // Check if brand exists by name
    @Override
    public boolean existsByBrandName(String brandName) {
        if (brandName == null || brandName.trim().isEmpty()) {
            return false;
        }
        String cleanedName = BrandUtils.cleanBrandName(brandName);
        return brandRepository.existsByBrandName(cleanedName);
    }
}
