package com.real.autosparepart.controller;

import com.real.autosparepart.dto.ProductDTO;
import com.real.autosparepart.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDTO dto) {

        ProductDTO saved = productService.create(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProduct(@PathVariable Integer id) {
        ProductDTO findById = productService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(findById);
    }

    @GetMapping
    public ResponseEntity<List<ProductDTO>> findAll() {
        List<ProductDTO> findAll = productService.findAll();
        return ResponseEntity.status(HttpStatus.OK).body(findAll);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable Integer id, @Valid @RequestBody ProductDTO dto) {
        ProductDTO findById = productService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(findById);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProductDTO> patchProduct(@PathVariable Integer id, @RequestBody ProductDTO dto) {
        ProductDTO updated = productService.update(id, dto);
        return ResponseEntity.status(HttpStatus.OK).body(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ProductDTO> deleteProduct(@PathVariable Integer id) {
        productService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}