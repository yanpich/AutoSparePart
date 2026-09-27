package com.real.autosparepart.brand.controller;

import com.real.autosparepart.brand.dto.BrandDTO;
import com.real.autosparepart.brand.dto.BrandStats;
import com.real.autosparepart.brand.service.BrandService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/brands")
public class BrandController {

    private final BrandService brandService;

    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    // Get current user ID from authentication
    private Integer getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof org.springframework.security.core.userdetails.User) {
            // Assuming user details contain ID
            return 1; // Placeholder - implement proper user ID extraction
        }
        return null;
    }

    // CREATE
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BrandDTO> create(
            @RequestPart("brandName") String brandName,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        BrandDTO dto = BrandDTO.builder()
                .brandName(brandName)
                .file(file)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(brandService.createBrand(dto));
    }

    // READ - Get all active brands
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping
    public ResponseEntity<List<BrandDTO>> getAll() {
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    // READ - Get all active brands with pagination
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/paginated")
    public ResponseEntity<Page<BrandDTO>> getAllPaginated(Pageable pageable) {
        return ResponseEntity.ok(brandService.getAllBrands(pageable));
    }

    // READ - Get brand by ID
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/{id}")
    public ResponseEntity<BrandDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(brandService.getBrandById(id));
    }

    // READ - Get brand by name
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/name/{brandName}")
    public ResponseEntity<BrandDTO> getByName(@PathVariable String brandName) {
        return ResponseEntity.ok(brandService.getBrandByName(brandName));
    }

    // READ - Get all deleted brands
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/deleted")
    public ResponseEntity<List<BrandDTO>> getDeleted() {
        return ResponseEntity.ok(brandService.getAllDeletedBrands());
    }

    // READ - Get brands by status
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<BrandDTO>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(brandService.getBrandsByStatus(status));
    }

    // READ - Search brands
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/search")
    public ResponseEntity<List<BrandDTO>> search(@RequestParam String term) {
        return ResponseEntity.ok(brandService.searchBrands(term));
    }

    // READ - Get brand stats
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<BrandStats> getStats() {
        return ResponseEntity.ok(brandService.getBrandStats());
    }

    // UPDATE
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BrandDTO> update(
            @PathVariable Integer id,
            @RequestPart(required = false) String brandName,
            @RequestPart(required = false) MultipartFile file) {

        BrandDTO dto = BrandDTO.builder()
                .brandName(brandName)
                .file(file)
                .build();

        return ResponseEntity.ok(brandService.updateBrand(id, dto));
    }

    // SOFT DELETE by ID
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> softDelete(@PathVariable Integer id) {
        Integer userId = getCurrentUserId();
        brandService.softDeleteBrand(id, userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Brand soft deleted successfully");
        response.put("id", id.toString());
        return ResponseEntity.ok(response);
    }

    // SOFT DELETE by Name
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/name/{brandName}")
    public ResponseEntity<Map<String, String>> softDeleteByName(@PathVariable String brandName) {
        Integer userId = getCurrentUserId();
        brandService.softDeleteBrandByName(brandName, userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Brand soft deleted successfully");
        response.put("brandName", brandName);
        return ResponseEntity.ok(response);
    }

    // RESTORE by ID
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/restore")
    public ResponseEntity<Map<String, String>> restore(@PathVariable Integer id) {
        Integer userId = getCurrentUserId();
        brandService.restoreBrand(id, userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Brand restored successfully");
        response.put("id", id.toString());
        return ResponseEntity.ok(response);
    }

    // RESTORE by Name
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/name/{brandName}/restore")
    public ResponseEntity<Map<String, String>> restoreByName(@PathVariable String brandName) {
        Integer userId = getCurrentUserId();
        brandService.restoreBrandByName(brandName, userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Brand restored successfully");
        response.put("brandName", brandName);
        return ResponseEntity.ok(response);
    }

    // HARD DELETE by ID
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Map<String, String>> hardDelete(@PathVariable Integer id) {
        brandService.hardDeleteBrand(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Brand permanently deleted");
        response.put("id", id.toString());
        return ResponseEntity.ok(response);
    }

    // HARD DELETE by Name
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/name/{brandName}/permanent")
    public ResponseEntity<Map<String, String>> hardDeleteByName(@PathVariable String brandName) {
        brandService.hardDeleteBrandByName(brandName);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Brand permanently deleted");
        response.put("brandName", brandName);
        return ResponseEntity.ok(response);
    }

    // BULK SOFT DELETE
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/bulk")
    public ResponseEntity<Map<String, String>> bulkSoftDelete(@RequestBody List<Integer> ids) {
        Integer userId = getCurrentUserId();
        brandService.bulkSoftDelete(ids, userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", ids.size() + " brands soft deleted successfully");
        return ResponseEntity.ok(response);
    }

    // BULK RESTORE
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/bulk/restore")
    public ResponseEntity<Map<String, String>> bulkRestore(@RequestBody List<Integer> ids) {
        Integer userId = getCurrentUserId();
        brandService.bulkRestore(ids, userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", ids.size() + " brands restored successfully");
        return ResponseEntity.ok(response);
    }

    // BULK HARD DELETE
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/bulk/permanent")
    public ResponseEntity<Map<String, String>> bulkHardDelete(@RequestBody List<Integer> ids) {
        brandService.bulkHardDelete(ids);

        Map<String, String> response = new HashMap<>();
        response.put("message", ids.size() + " brands permanently deleted");
        return ResponseEntity.ok(response);
    }

    // CLEANUP OLD DELETED BRANDS
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/cleanup")
    public ResponseEntity<Map<String, String>> cleanupOldDeleted(@RequestParam(defaultValue = "30") int daysOld) {
        int deletedCount = brandService.permanentlyDeleteOldBrands(daysOld);

        Map<String, String> response = new HashMap<>();
        response.put("message", deletedCount + " brands older than " + daysOld + " days permanently deleted");
        response.put("deletedCount", String.valueOf(deletedCount));
        return ResponseEntity.ok(response);
    }
}