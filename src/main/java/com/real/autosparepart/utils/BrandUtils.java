package com.real.autosparepart.utils;

import com.real.autosparepart.dto.BrandDTO;
import com.real.autosparepart.model.Brand;

public class BrandUtils {
    /**
     * Clean brand name by removing quotes and trimming whitespace
     *
     * @param brandName the brand name to clean
     * @return cleaned brand name
     */
    public static String cleanBrandName(String brandName) {
        if (brandName == null) return null;
        return brandName.trim()
                .replaceAll("^\"+", "")      // Remove leading quotes
                .replaceAll("\"+$", "")      // Remove trailing quotes
                .replaceAll("\"", "");       // Remove any remaining quotes
    }
    /**
     * Convert Brand Entity to DTO with full image URL
     * @param brand the brand entity
     * @param baseUrl the base URL for image access
     * @return BrandDTO with full image URL
     */
    public static BrandDTO convertToDTOWithUrl(Brand brand, String baseUrl) {
        String imageUrl = baseUrl + "api/files/download/" + brand.getImage();
        return BrandDTO.builder()
                .brandId(brand.getBrandId())
                .brandName(brand.getBrandName())
                .image(imageUrl)  // Full URL to access the image
                .build();
    }
    /**
     * Convert Brand Entity to DTO without full URL (internal use)
     * @param brand the brand entity
     * @return BrandDTO with filename/path only
     */
    public static BrandDTO convertToDTO(Brand brand) {
        return BrandDTO.builder()
                .brandId(brand.getBrandId())
                .brandName(brand.getBrandName())
                .image(brand.getImage())  // Just the filename/path
                .build();
    }
    /**
     * Validate brand DTO for required fields
     * @param brandDTO the brand DTO to validate
     * @throws RuntimeException if validation fails
     */
    public static void validateBrandDTO(BrandDTO brandDTO) {
        if (brandDTO.getBrandName() == null || brandDTO.getBrandName().isEmpty()) {
            throw new RuntimeException("Brand name is required");
        }
    }
    /**
     * Check if image is a local file (not a URL)
     * @param imagePath the image path to check
     * @return true if local file, false if URL or null
     */
    public static boolean isLocalFile(String imagePath) {
        return imagePath != null && !imagePath.startsWith("http");
    }

}
