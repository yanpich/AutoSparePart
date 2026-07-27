package com.real.autosparepart.controller;

import com.real.autosparepart.dto.ProductDetailsDTO;
import com.real.autosparepart.service.ProductDetailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/product-details")
@RequiredArgsConstructor
@Slf4j
public class ProductDetailsController {

    private final ProductDetailService productDetailService;
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ProductDetailsDTO> create(@Valid @RequestBody ProductDetailsDTO dto) {
        log.info("POST /api/product-details - Create product details");
        ProductDetailsDTO created = productDetailService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailsDTO> findById(@PathVariable Integer id) {
        log.info("GET /api/product-details/{} - Find by id", id);
        ProductDetailsDTO details = productDetailService.findById(id);
        return ResponseEntity.ok(details);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    @GetMapping
    public ResponseEntity<List<ProductDetailsDTO>> findAll() {
        log.info("GET /api/product-details - Find all");
        List<ProductDetailsDTO> details = productDetailService.findAll();
        return ResponseEntity.ok(details);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ProductDetailsDTO> update(
            @PathVariable Integer id,
            @Valid @RequestBody ProductDetailsDTO dto) {
        log.info("PUT /api/product-details/{} - Update product details", id);
        ProductDetailsDTO updated = productDetailService.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Integer id) {
        log.info("DELETE /api/product-details/{} - Delete product details", id);
        productDetailService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}