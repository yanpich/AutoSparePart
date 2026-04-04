package com.real.autosparepart.service;

import com.real.autosparepart.dto.BrandDTO;
import com.real.autosparepart.model.Brand;
import com.real.autosparepart.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BrandService implements IBrand {

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private IFileService fileService;

    @Value("${app.images.brand-path:uploads/brands/}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    // Helper method to clean brand name
    private String cleanBrandName(String brandName) {
        if (brandName == null) return null;
        return brandName.trim()
                .replaceAll("^\"+", "")      // Remove leading quotes
                .replaceAll("\"+$", "")      // Remove trailing quotes
                .replaceAll("\"", "");       // Remove any remaining quotes
    }

    // READ - Get all brands with full image URLs
    @Override
    public List<BrandDTO> getAllBrands() {
        return brandRepository.findAll()
                .stream()
                .map(this::convertToDTOWithUrl)
                .collect(Collectors.toList());
    }

    // READ - Get brand by ID with full image URL
    @Override
    public BrandDTO getBrandById(Integer id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));
        return convertToDTOWithUrl(brand);
    }

    // READ - Get brand by name with full image URL
    @Override
    public BrandDTO getBrandByName(String brandName) {
        Brand brand = brandRepository.findByBrandName(brandName)
                .orElseThrow(() -> new RuntimeException("Brand not found with name: " + brandName));
        return convertToDTOWithUrl(brand);
    }

    // Helper method to convert Entity to DTO with full image URL
    private BrandDTO convertToDTOWithUrl(Brand brand) {
        String imageUrl = baseUrl + "/api/files/download/" + brand.getImage();

        return BrandDTO.builder()
                .brandId(brand.getBrandId())
                .brandName(brand.getBrandName())
                .image(imageUrl)  // Full URL to access the image
                .build();
    }

    // Helper method for internal use (without full URL)
    private BrandDTO convertToDTO(Brand brand) {
        return BrandDTO.builder()
                .brandId(brand.getBrandId())
                .brandName(brand.getBrandName())
                .image(brand.getImage())  // Just the filename/path
                .build();
    }

    // CREATE
    @Override
    @Transactional
    public BrandDTO createBrand(BrandDTO brandDTO) {
        try {
            // Validate and clean brand name
            if (brandDTO == null || brandDTO.getBrandName() == null || brandDTO.getBrandName().trim().isEmpty()) {
                throw new RuntimeException("Brand name is required");
            }

            String brandName = cleanBrandName(brandDTO.getBrandName());

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
            return convertToDTOWithUrl(savedBrand);

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
                String newName = cleanBrandName(brandDTO.getBrandName());

                if (!existingBrand.getBrandName().equals(newName) &&
                        brandRepository.existsByBrandName(newName)) {
                    throw new RuntimeException("Brand with name '" + newName + "' already exists");
                }
                existingBrand.setBrandName(newName);
            }

            // Update image if provided
            if (brandDTO.getFile() != null && !brandDTO.getFile().isEmpty()) {
                // Delete old image
                if (existingBrand.getImage() != null && !existingBrand.getImage().startsWith("http")) {
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
            return convertToDTOWithUrl(updatedBrand);

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
            if (brand.getImage() != null && !brand.getImage().startsWith("http")) {
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
            if (brand.getImage() != null && !brand.getImage().startsWith("http")) {
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
        String cleanedName = cleanBrandName(brandName);
        return brandRepository.existsByBrandName(cleanedName);
    }
}