package com.real.autosparepart.service;

import com.real.autosparepart.dto.ProductImageDTO;
import com.real.autosparepart.model.Product;
import com.real.autosparepart.model.ProductImage;
import com.real.autosparepart.repository.ProductImgRepository;
import com.real.autosparepart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductImgService implements IProductImage {

    @Autowired
    private ProductImgRepository productImgRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private IFileService fileService;

    @Value("${app.images.product-path:uploads/products/}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Override
    public ProductImageDTO getById(Integer id) {
        ProductImage image = productImgRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + id));
        return mapToDTO(image);
    }

    @Override
    public List<ProductImageDTO> getByProductId(Integer productId) {
        // You need to add this method to ProductImgRepository
        List<ProductImage> images = productImgRepository.findByProductId_ProductId(productId);
        return images.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductImageDTO uploadImage(Integer productId, MultipartFile file, Boolean isPrimary) {
        try {
            // Validate product exists
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

            // Upload file using FileService
            String fileName = fileService.uploadFile(uploadDir, file);

            // If this is primary, unset other primary images for this product
            if (isPrimary != null && isPrimary) {
                unsetOtherPrimaryImages(productId);
            }

            // Create image entity
            ProductImage productImage = new ProductImage();
            productImage.setProductId(product);
            productImage.setImageUrl(fileName);
            productImage.setSortOrder(getNextSortOrder(productId));
            productImage.setIsPrimary(isPrimary != null ? isPrimary : false);
            productImage.setCreatedAt(LocalDateTime.now());

            ProductImage saved = productImgRepository.save(productImage);
            return mapToDTO(saved);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public List<ProductImageDTO> uploadMultipleImages(Integer productId, List<MultipartFile> files, List<Boolean> isPrimaryList) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("At least one file is required");
        }

        List<ProductImageDTO> uploadedImages = new ArrayList<>();

        // Validate product exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        int sortOrder = getNextSortOrder(productId);

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            Boolean isPrimary = (isPrimaryList != null && i < isPrimaryList.size())
                    ? isPrimaryList.get(i)
                    : false;

            try {
                // Upload file
                String fileName = fileService.uploadFile(uploadDir, file);

                // If this is primary, unset other primary images
                if (isPrimary != null && isPrimary) {
                    unsetOtherPrimaryImages(productId);
                }

                // Create image entity
                ProductImage productImage = new ProductImage();
                productImage.setProductId(product);
                productImage.setImageUrl(fileName);
                productImage.setSortOrder(sortOrder++);
                productImage.setIsPrimary(isPrimary);
                productImage.setCreatedAt(LocalDateTime.now());

                ProductImage saved = productImgRepository.save(productImage);
                uploadedImages.add(mapToDTO(saved));

            } catch (IOException e) {
                throw new RuntimeException("Failed to upload image: " + file.getOriginalFilename() + " - " + e.getMessage(), e);
            }
        }

        return uploadedImages;
    }

    @Override
    @Transactional
    public List<ProductImageDTO> uploadMultipleImages(Integer productId, List<MultipartFile> files, Boolean isPrimary) {
        // Create a list where all images have the same isPrimary value
        List<Boolean> isPrimaryList = new ArrayList<>();
        for (int i = 0; i < files.size(); i++) {
            // Only first image can be primary if isPrimary is true
            isPrimaryList.add(isPrimary != null && isPrimary && i == 0);
        }

        // If first image is primary, unset other primaries
        if (isPrimary != null && isPrimary && !files.isEmpty()) {
            unsetOtherPrimaryImages(productId);
        }

        return uploadMultipleImages(productId, files, isPrimaryList);
    }

    @Override
    @Transactional
    public ProductImageDTO update(Integer id, ProductImageDTO dto) {
        ProductImage existingImage = productImgRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + id));

        if (dto.getSortOrder() != null) {
            existingImage.setSortOrder(dto.getSortOrder());
        }

        if (dto.getIsPrimary() != null && dto.getIsPrimary()) {
            // Unset other primary images for this product
            unsetOtherPrimaryImages(existingImage.getProductId().getProductId());
            existingImage.setIsPrimary(true);
        } else if (dto.getIsPrimary() != null && !dto.getIsPrimary()) {
            existingImage.setIsPrimary(false);
        }

        ProductImage updated = productImgRepository.save(existingImage);
        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public void delete(Integer id) {
        ProductImage image = productImgRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + id));

        // Delete physical file
        String fileName = image.getImageUrl();
        if (fileName != null && !fileName.isEmpty()) {
            try {
                fileService.deleteFile(uploadDir, fileName);
            } catch (Exception e) {
                System.err.println("Warning: Could not delete physical file: " + fileName);
            }
        }

        // Delete database record
        productImgRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteByProductId(Integer productId) {
        List<ProductImage> images = productImgRepository.findByProductId_ProductId(productId);

        // Delete physical files
        for (ProductImage image : images) {
            String fileName = image.getImageUrl();
            if (fileName != null && !fileName.isEmpty()) {
                try {
                    fileService.deleteFile(uploadDir, fileName);
                } catch (Exception e) {
                    System.err.println("Warning: Could not delete physical file: " + fileName);
                }
            }
        }

        // Delete database records
        productImgRepository.deleteByProductId_ProductId(productId);
    }

    @Override
    @Transactional
    public void deleteMultiple(List<Integer> ids) {
        for (Integer id : ids) {
            delete(id);
        }
    }

    @Override
    @Transactional
    public ProductImageDTO setPrimaryImage(Integer id, Integer productId) {
        // Unset all primary images for this product
        unsetOtherPrimaryImages(productId);

        // Set the selected image as primary
        ProductImage image = productImgRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + id));
        image.setIsPrimary(true);

        ProductImage saved = productImgRepository.save(image);
        return mapToDTO(saved);
    }

    // Helper methods

    private void unsetOtherPrimaryImages(Integer productId) {
        List<ProductImage> images = productImgRepository.findByProductId_ProductId(productId);
        for (ProductImage image : images) {
            if (image.getIsPrimary() != null && image.getIsPrimary()) {
                image.setIsPrimary(false);
                productImgRepository.save(image);
            }
        }
    }

    private int getNextSortOrder(Integer productId) {
        List<ProductImage> images = productImgRepository.findByProductId_ProductId(productId);
        return images.size();
    }

    private ProductImageDTO mapToDTO(ProductImage image) {
        if (image == null) return null;

        String fileUrl = baseUrl + "/api/files/download/" + image.getImageUrl();

        return ProductImageDTO.builder()
                .id(image.getId())
                .productId(image.getProductId() != null ? image.getProductId().getProductId() : null)
                .imageUrl(image.getImageUrl())
                .fileUrl(fileUrl)
                .sortOrder(image.getSortOrder())
                .isPrimary(image.getIsPrimary())
                .createdAt(image.getCreatedAt())
                .fileName(image.getImageUrl())
                .build();
    }
}