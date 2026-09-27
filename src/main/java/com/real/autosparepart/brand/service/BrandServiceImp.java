package com.real.autosparepart.brand.service;

import com.real.autosparepart.brand.dto.BrandDTO;
import com.real.autosparepart.brand.dto.BrandStats;
import com.real.autosparepart.brand.entity.Brand;
import com.real.autosparepart.brand.repository.BrandRepository;
import com.real.autosparepart.common.utils.BrandUtils;
import com.real.autosparepart.upload.service.FileService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BrandServiceImp implements BrandService {

    private final BrandRepository brandRepository;
    private final FileService fileService;

    @Value("${app.images.brand-admin-panel-path:uploads/brands/}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    public BrandServiceImp(BrandRepository brandRepository, FileService fileService) {
        this.brandRepository = brandRepository;
        this.fileService = fileService;
    }

    @Override
    @Transactional
    public BrandDTO createBrand(BrandDTO brandDTO) {
        try {
            BrandUtils.validateBrandDTO(brandDTO);
            String brandName = BrandUtils.cleanBrandName(brandDTO.getBrandName());

            if (brandRepository.existsByBrandName(brandName)) {
                throw new RuntimeException("Brand with name '" + brandName + "' already exists");
            }

            // Handle file upload
            String imagePath = handleFileUpload(brandDTO);

            Brand brand = Brand.builder()
                    .brandName(brandName)
                    .image(imagePath)
                    .active(true)
                    .status("active")
                    .deleted(false)
                    .build();

            Brand savedBrand = brandRepository.save(brand);
            return BrandUtils.convertToDTOWithUrl(savedBrand, baseUrl);

        } catch (IOException e) {
            throw new RuntimeException("Failed to create brand: " + e.getMessage());
        }
    }

    @Override
    public BrandDTO getBrandById(Integer id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));
        return BrandUtils.convertToDTOWithUrl(brand, baseUrl);
    }

    @Override
    public BrandDTO getBrandByName(String brandName) {
        Brand brand = brandRepository.findActiveByBrandName(brandName)
                .orElseThrow(() -> new RuntimeException("Brand not found with name: " + brandName));
        return BrandUtils.convertToDTOWithUrl(brand, baseUrl);
    }

    @Override
    public List<BrandDTO> getAllBrands() {
        return brandRepository.findAllActive()
                .stream()
                .map(brand -> BrandUtils.convertToDTOWithUrl(brand, baseUrl))
                .collect(Collectors.toList());
    }

    @Override
    public Page<BrandDTO> getAllBrands(Pageable pageable) {
        return brandRepository.findAllActive(pageable)
                .map(brand -> BrandUtils.convertToDTOWithUrl(brand, baseUrl));
    }

    @Override
    @Transactional
    public BrandDTO updateBrand(Integer id, BrandDTO brandDTO) {
        try {
            Brand existingBrand = brandRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));

            if (existingBrand.isDeleted()) {
                throw new RuntimeException("Cannot update a deleted brand. Please restore it first.");
            }

            // Update name if provided
            if (brandDTO.getBrandName() != null && !brandDTO.getBrandName().trim().isEmpty()) {
                String newName = BrandUtils.cleanBrandName(brandDTO.getBrandName());

                if (!existingBrand.getBrandName().equalsIgnoreCase(newName) &&
                        brandRepository.existsByBrandName(newName)) {
                    throw new RuntimeException("Brand with name '" + newName + "' already exists");
                }
                existingBrand.setBrandName(newName);
            }

            // Update image if provided
            if (brandDTO.getFile() != null && !brandDTO.getFile().isEmpty()) {
                // Delete old image
                if (BrandUtils.isLocalFile(existingBrand.getImage())) {
                    try {
                        fileService.deleteFile(uploadDir, existingBrand.getImage());
                    } catch (Exception e) {
                        System.err.println("Could not delete old image: " + e.getMessage());
                    }
                }
                String newImagePath = fileService.uploadFile(uploadDir, brandDTO.getFile());
                existingBrand.setImage(newImagePath);
            }

            Brand updatedBrand = brandRepository.save(existingBrand);
            return BrandUtils.convertToDTOWithUrl(updatedBrand, baseUrl);

        } catch (IOException e) {
            throw new RuntimeException("Failed to update brand: " + e.getMessage());
        }
    }

    // Soft Delete Operations
    @Override
    @Transactional
    public void softDeleteBrand(Integer id, Integer deletedBy) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));

        if (brand.isDeleted()) {
            throw new RuntimeException("Brand is already deleted");
        }

        brandRepository.softDeleteById(id, LocalDateTime.now(), deletedBy);
    }

    @Override
    @Transactional
    public void softDeleteBrandByName(String brandName, Integer deletedBy) {
        Brand brand = brandRepository.findActiveByBrandName(brandName)
                .orElseThrow(() -> new RuntimeException("Brand not found with name: " + brandName));

        brandRepository.softDeleteById(brand.getBrandId(), LocalDateTime.now(), deletedBy);
    }

    @Override
    @Transactional
    public void restoreBrand(Integer id, Integer restoredBy) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));

        if (!brand.isDeleted()) {
            throw new RuntimeException("Brand is not deleted");
        }

        brandRepository.restoreById(id, LocalDateTime.now(), restoredBy);
    }

    @Override
    @Transactional
    public void restoreBrandByName(String brandName, Integer restoredBy) {
        Brand brand = brandRepository.findByBrandName(brandName)
                .orElseThrow(() -> new RuntimeException("Brand not found with name: " + brandName));

        if (!brand.isDeleted()) {
            throw new RuntimeException("Brand is not deleted");
        }

        brandRepository.restoreById(brand.getBrandId(), LocalDateTime.now(), restoredBy);
    }

    // Hard Delete Operations
    @Override
    @Transactional
    public void hardDeleteBrand(Integer id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id: " + id));

        // Delete image file
        if (BrandUtils.isLocalFile(brand.getImage())) {
            try {
                fileService.deleteFile(uploadDir, brand.getImage());
            } catch (Exception e) {
                System.err.println("Could not delete image: " + e.getMessage());
            }
        }

        brandRepository.hardDeleteById(id);
    }

    @Override
    @Transactional
    public void hardDeleteBrandByName(String brandName) {
        Brand brand = brandRepository.findByBrandName(brandName)
                .orElseThrow(() -> new RuntimeException("Brand not found with name: " + brandName));

        if (BrandUtils.isLocalFile(brand.getImage())) {
            try {
                fileService.deleteFile(uploadDir, brand.getImage());
            } catch (Exception e) {
                System.err.println("Could not delete image: " + e.getMessage());
            }
        }

        brandRepository.deleteByBrandName(brandName);
    }

    @Override
    public List<BrandDTO> getAllDeletedBrands() {
        return brandRepository.findAllDeleted()
                .stream()
                .map(brand -> BrandUtils.convertToDTOWithUrl(brand, baseUrl))
                .collect(Collectors.toList());
    }

    @Override
    public List<BrandDTO> getBrandsByStatus(String status) {
        return brandRepository.findByStatus(status)
                .stream()
                .map(brand -> BrandUtils.convertToDTOWithUrl(brand, baseUrl))
                .collect(Collectors.toList());
    }

    @Override
    public List<BrandDTO> searchBrands(String searchTerm) {
        return brandRepository.searchActive(searchTerm)
                .stream()
                .map(brand -> BrandUtils.convertToDTOWithUrl(brand, baseUrl))
                .collect(Collectors.toList());
    }

    @Override
    public Page<BrandDTO> searchBrands(String searchTerm, Pageable pageable) {
        // Implement custom search with pagination
        // For simplicity, using findAll with specification would be better
        return brandRepository.findAllActive(pageable)
                .map(brand -> BrandUtils.convertToDTOWithUrl(brand, baseUrl));
    }

    @Override
    public BrandStats getBrandStats() {
        long total = brandRepository.count();
        long active = brandRepository.countActive();
        long deleted = brandRepository.countDeleted();

        return BrandStats.builder()
                .total(total)
                .active(active)
                .deleted(deleted)
                .inactive(total - active - deleted)
                .build();
    }

    @Override
    @Transactional
    public int permanentlyDeleteOldBrands(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        List<Brand> oldDeletedBrands = brandRepository.findDeletedBefore(cutoffDate);

        int count = 0;
        for (Brand brand : oldDeletedBrands) {
            try {
                if (BrandUtils.isLocalFile(brand.getImage())) {
                    fileService.deleteFile(uploadDir, brand.getImage());
                }
                brandRepository.hardDeleteById(brand.getBrandId());
                count++;
            } catch (Exception e) {
                System.err.println("Failed to permanently delete brand: " + brand.getBrandName());
            }
        }
        return count;
    }

    @Override
    public boolean existsByBrandName(String brandName) {
        return brandRepository.existsByBrandName(brandName);
    }

    @Override
    public boolean existsActiveByBrandName(String brandName) {
        return brandRepository.existsActiveByBrandName(brandName);
    }

    @Override
    @Transactional
    public void bulkSoftDelete(List<Integer> ids, Integer deletedBy) {
        for (Integer id : ids) {
            try {
                softDeleteBrand(id, deletedBy);
            } catch (Exception e) {
                System.err.println("Failed to delete brand " + id + ": " + e.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public void bulkRestore(List<Integer> ids, Integer restoredBy) {
        for (Integer id : ids) {
            try {
                restoreBrand(id, restoredBy);
            } catch (Exception e) {
                System.err.println("Failed to restore brand " + id + ": " + e.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public void bulkHardDelete(List<Integer> ids) {
        for (Integer id : ids) {
            try {
                hardDeleteBrand(id);
            } catch (Exception e) {
                System.err.println("Failed to permanently delete brand " + id + ": " + e.getMessage());
            }
        }
    }

    // Helper Methods
    private String handleFileUpload(BrandDTO brandDTO) throws IOException {
        if (brandDTO.getFile() != null && !brandDTO.getFile().isEmpty()) {
            return fileService.uploadFile(uploadDir, brandDTO.getFile());
        } else if (brandDTO.getImage() != null && !brandDTO.getImage().isEmpty()) {
            return brandDTO.getImage();
        } else {
            throw new RuntimeException("Brand image is required");
        }
    }

}