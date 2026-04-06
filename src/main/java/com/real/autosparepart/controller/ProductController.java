package com.real.autosparepart.controller;

import com.real.autosparepart.dto.ProductDTO;
import com.real.autosparepart.service.IProduct;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
class ProductController {

    private final IProduct productService;
    @Autowired
    public ProductController(IProduct productService) {
        this.productService = productService;
    }

    @PostMapping("/products")
    public ResponseEntity<ProductDTO> createProduct(
            @Valid @RequestBody ProductDTO dto) {

        ProductDTO saved = productService.create(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable Integer id) {
        ProductDTO findById = productService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(findById);
    }
    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> findAll() {
        List<ProductDTO> findAll = productService.findAll();
        return ResponseEntity.status(HttpStatus.OK).body(findAll);
    }
    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Integer id,
            @Valid @RequestBody ProductDTO dto) {
        ProductDTO findById = productService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(findById);
    }
    @PatchMapping("/products/{id}")
    public ResponseEntity<ProductDTO> patchProduct(
            @PathVariable Integer id,
            @RequestBody ProductDTO dto) {
        ProductDTO updated = productService.update(id, dto);
        return ResponseEntity.status(HttpStatus.OK).body(updated);
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ProductDTO> deleteProduct(@PathVariable Integer id) {
        productService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}