package com.real.autosparepart.controller;

import com.real.autosparepart.dto.BrandDTO;
import com.real.autosparepart.service.BrandService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    private final BrandService brandService;

    public BrandController(BrandService brandService) {
        this.brandService = brandService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BrandDTO> create(@RequestPart("brandName") String brandName, @RequestPart(value = "file", required = false) MultipartFile file) {

        BrandDTO dto = BrandDTO.builder().brandName(brandName).file(file).build();

        return ResponseEntity.status(HttpStatus.CREATED).body(brandService.createBrand(dto));
    }

    @GetMapping
    public ResponseEntity<List<BrandDTO>> getAll() {
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(brandService.getBrandById(id));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BrandDTO> update(@PathVariable Integer id, @RequestPart(required = false) String brandName, @RequestPart(required = false) MultipartFile file) {

        BrandDTO dto = BrandDTO.builder().brandName(brandName).file(file).build();

        return ResponseEntity.ok(brandService.updateBrand(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        brandService.deleteBrand(id);
        return ResponseEntity.noContent().build();
    }
}