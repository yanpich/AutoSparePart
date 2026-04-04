package com.real.autosparepart.controller;

import com.real.autosparepart.dto.BrandDTO;
import com.real.autosparepart.service.IBrand;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    @Autowired
    private IBrand brandService;

    // ==================== CREATE ====================

    // CREATE with file upload (multipart/form-data)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createBrandWithFile(
            @RequestPart("brandName") String brandName,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            BrandDTO brandDTO = BrandDTO.builder()
                    .brandName(brandName)
                    .file(file)
                    .build();

            BrandDTO createdBrand = brandService.createBrand(brandDTO);
            return new ResponseEntity<>(createdBrand, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    // CREATE with JSON
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createBrandWithJson(@Valid @RequestBody BrandDTO brandDTO) {
        try {
            BrandDTO createdBrand = brandService.createBrand(brandDTO);
            return new ResponseEntity<>(createdBrand, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    // ==================== READ ====================

    // GET all brands
    @GetMapping
    public ResponseEntity<List<BrandDTO>> getAllBrands() {
        List<BrandDTO> brands = brandService.getAllBrands();
        return ResponseEntity.ok(brands);
    }

    // GET brand by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBrandById(@PathVariable Integer id) {
        try {
            BrandDTO brand = brandService.getBrandById(id);
            return ResponseEntity.ok(brand);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // GET brand by name
    @GetMapping("/name/{brandName}")
    public ResponseEntity<?> getBrandByName(@PathVariable String brandName) {
        try {
            BrandDTO brand = brandService.getBrandByName(brandName);
            return ResponseEntity.ok(brand);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // ==================== UPDATE ====================

    // UPDATE with file upload (multipart/form-data) - FIXED
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateBrandWithFile(
            @PathVariable Integer id,
            @RequestPart(value = "brandName", required = false) String brandName,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            BrandDTO brandDTO = BrandDTO.builder()
                    .brandName(brandName)
                    .file(file)
                    .build();

            BrandDTO updatedBrand = brandService.updateBrand(id, brandDTO);
            return ResponseEntity.ok(updatedBrand);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // UPDATE with JSON
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateBrandWithJson(
            @PathVariable Integer id,
            @Valid @RequestBody BrandDTO brandDTO) {
        try {
            BrandDTO updatedBrand = brandService.updateBrand(id, brandDTO);
            return ResponseEntity.ok(updatedBrand);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // UPDATE using form parameters (simpler alternative) - ADD THIS
    @PutMapping(value = "/{id}", params = {"brandName"})
    public ResponseEntity<?> updateBrandWithParams(
            @PathVariable Integer id,
            @RequestParam(value = "brandName", required = false) String brandName,
            @RequestParam(value = "image", required = false) String image,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            BrandDTO.BrandDTOBuilder builder = BrandDTO.builder();

            if (brandName != null && !brandName.trim().isEmpty()) {
                builder.brandName(brandName);
            }
            if (image != null && !image.trim().isEmpty()) {
                builder.image(image);
            }
            if (file != null && !file.isEmpty()) {
                builder.file(file);
            }

            BrandDTO brandDTO = builder.build();
            BrandDTO updatedBrand = brandService.updateBrand(id, brandDTO);
            return ResponseEntity.ok(updatedBrand);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // ==================== DELETE ====================

    // DELETE by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBrand(@PathVariable Integer id) {
        try {
            brandService.deleteBrand(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Brand deleted successfully with id: " + id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // DELETE by name
    @DeleteMapping("/name/{brandName}")
    public ResponseEntity<?> deleteBrandByName(@PathVariable String brandName) {
        try {
            brandService.deleteBrandByName(brandName);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Brand deleted successfully with name: " + brandName);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}