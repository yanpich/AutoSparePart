package com.real.autosparepart.controller;

import com.real.autosparepart.dto.ProductImageDTO;
import com.real.autosparepart.service.ProductImageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products/{productId}/images")
public class ProductImageController {

    private final ProductImageService productImageService;

    public ProductImageController(ProductImageService productImageService) {
        this.productImageService = productImageService;
    }

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    // Get all images of a product (with full URLs)
    @GetMapping
    public ResponseEntity<?> getProductImages(@PathVariable Integer productId) {
        try {
            List<ProductImageDTO> images = productImageService.getByProductId(productId);

            // Add full URLs to each image
            for (ProductImageDTO image : images) {
                if (image.getImageUrl() != null) {
                    image.setFileUrl(baseUrl + "api/files/download/" + image.getImageUrl());
                }
            }

            return ResponseEntity.ok(images);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get single image by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getImageById(@PathVariable Integer productId, @PathVariable Integer id) {
        try {
            ProductImageDTO image = productImageService.getById(id);

            // Verify image belongs to product
            if (!image.getProductId().equals(productId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Image does not belong to this product");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Add full URL
            if (image.getImageUrl() != null) {
                image.setFileUrl(baseUrl + "api/files/download/" + image.getImageUrl());
            }

            return ResponseEntity.ok(image);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Get primary image of a product
    @GetMapping("/primary")
    public ResponseEntity<?> getPrimaryImage(@PathVariable Integer productId) {
        try {
            List<ProductImageDTO> images = productImageService.getByProductId(productId);

            ProductImageDTO primaryImage = images.stream()
                    .filter(img -> img.getIsPrimary() != null && img.getIsPrimary())
                    .findFirst()
                    .orElse(images.isEmpty() ? null : images.get(0));

            if (primaryImage == null) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "No images found for this product");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Add full URL
            if (primaryImage.getImageUrl() != null) {
                primaryImage.setFileUrl(baseUrl + "api/files/download/" + primaryImage.getImageUrl());
            }

            return ResponseEntity.ok(primaryImage);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get image file directly (for viewing in browser)
    @GetMapping("/file/{fileName}")
    public ResponseEntity<?> getImageFile(@PathVariable Integer productId, @PathVariable String fileName) {
        try {
            // Verify that this file belongs to the product
            List<ProductImageDTO> productImages = productImageService.getByProductId(productId);
            boolean fileBelongsToProduct = productImages.stream()
                    .anyMatch(img -> fileName.equals(img.getImageUrl()));

            if (!fileBelongsToProduct) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Image does not belong to this product");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Redirect to file download endpoint
            String fileUrl = baseUrl + "api/files/download/" + fileName;
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("fileName", fileName);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

//    // Upload single image
//    @PostMapping("/upload")
//    public ResponseEntity<?> uploadImage(
//            @PathVariable Integer productId,
//            @RequestParam("file") MultipartFile file,
//            @RequestParam(value = "isPrimary", defaultValue = "false") Boolean isPrimary) {
//
//        try {
//            ProductImageDTO uploaded = productImageService.uploadImage(productId, file, isPrimary);
//
//            // Add full URL
//            if (uploaded.getImageUrl() != null) {
//                uploaded.setFileUrl(baseUrl + "/api/files/download/" + uploaded.getImageUrl());
//            }
//
//            return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
//        } catch (Exception e) {
//            Map<String, String> error = new HashMap<>();
//            error.put("error", e.getMessage());
//            error.put("type", e.getClass().getSimpleName());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
//        }
//    }

    // Upload multiple images at once
    @PostMapping(value = "/upload-multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadMultipleImages(
            @PathVariable Integer productId,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "file", required = false) List<MultipartFile> singleFileList,
            @RequestParam(value = "isPrimary", required = false, defaultValue = "false") Boolean isPrimary) {

        try {
            // Support both "files" and "file" parameter names
            List<MultipartFile> actualFiles = (files != null && !files.isEmpty()) ? files : singleFileList;

            if (actualFiles == null || actualFiles.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "No files provided");
                error.put("detail", "Please provide files with key 'files' or 'file' in form-data");
                return ResponseEntity.badRequest().body(error);
            }

            System.out.println("Uploading " + actualFiles.size() + " files for product " + productId);

            List<ProductImageDTO> uploaded = productImageService.uploadMultipleImages(productId, actualFiles, isPrimary);

            // Add full URLs
            for (ProductImageDTO image : uploaded) {
                if (image.getImageUrl() != null) {
                    image.setFileUrl(baseUrl + "api/files/download/" + image.getImageUrl());
                }
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("type", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Upload multiple images with individual primary settings
    @PostMapping(value = "/upload-multiple-advanced", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadMultipleImagesAdvanced(
            @PathVariable Integer productId,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            @RequestParam(value = "file", required = false) List<MultipartFile> singleFileList,
            @RequestParam(value = "isPrimaryList", required = false) List<Boolean> isPrimaryList) {

        try {
            List<MultipartFile> actualFiles = (files != null && !files.isEmpty()) ? files : singleFileList;

            if (actualFiles == null || actualFiles.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "No files provided");
                return ResponseEntity.badRequest().body(error);
            }

            List<ProductImageDTO> uploaded = productImageService.uploadMultipleImages(productId, actualFiles, isPrimaryList);

            // Add full URLs
            for (ProductImageDTO image : uploaded) {
                if (image.getImageUrl() != null) {
                    image.setFileUrl(baseUrl + "api/files/download/" + image.getImageUrl());
                }
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Update image (sort order, primary status)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateImage(
            @PathVariable Integer productId,
            @PathVariable Integer id,
            @Valid @RequestBody ProductImageDTO dto) {

        try {
            // Verify image belongs to product
            ProductImageDTO existingImage = productImageService.getById(id);
            if (!existingImage.getProductId().equals(productId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Image does not belong to this product");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            ProductImageDTO updated = productImageService.update(id, dto);

            // Add full URL
            if (updated.getImageUrl() != null) {
                updated.setFileUrl(baseUrl + "api/files/download/" + updated.getImageUrl());
            }

            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Set image as primary
    @PatchMapping("/{id}/set-primary")
    public ResponseEntity<?> setPrimaryImage(
            @PathVariable Integer productId,
            @PathVariable Integer id) {

        try {
            ProductImageDTO updated = productImageService.setPrimaryImage(id, productId);

            // Add full URL
            if (updated.getImageUrl() != null) {
                updated.setFileUrl(baseUrl + "api/files/download/" + updated.getImageUrl());
            }

            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Delete single image
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteImage(@PathVariable Integer productId, @PathVariable Integer id) {
        try {
            // Verify image belongs to product
            ProductImageDTO image = productImageService.getById(id);
            if (!image.getProductId().equals(productId)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Image does not belong to this product");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            productImageService.delete(id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Image deleted successfully");
            response.put("imageId", String.valueOf(id));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // Delete multiple images
    @DeleteMapping("/delete-multiple")
    public ResponseEntity<Map<String, String>> deleteMultipleImages(
            @PathVariable Integer productId,
            @RequestBody List<Integer> ids) {
        try {
            // Verify all images belong to product
            for (Integer id : ids) {
                ProductImageDTO image = productImageService.getById(id);
                if (!image.getProductId().equals(productId)) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Image with id " + id + " does not belong to this product");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
                }
            }

            productImageService.deleteMultiple(ids);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Images deleted successfully");
            response.put("deletedCount", String.valueOf(ids.size()));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

//    // Delete all images of a product
//    @DeleteMapping("/delete-all")
//    public ResponseEntity<Map<String, String>> deleteAllProductImages(@PathVariable Integer productId) {
//        try {
//            productImageService.deleteByProductId(productId);
//
//            Map<String, String> response = new HashMap<>();
//            response.put("message", "All images deleted successfully");
//            response.put("productId", String.valueOf(productId));
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            Map<String, String> error = new HashMap<>();
//            error.put("error", e.getMessage());
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
//        }
//    }
}