//package com.real.autosparepart.controller;
//
//import com.real.autosparepart.dto.ProductDTO;
//import com.real.autosparepart.service.IProduct;
//import jakarta.validation.Valid;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//@RestController
//@RequestMapping("/api")
//class ProductController {
//
//    private final IProduct productService;
//    @Autowired
//    public ProductController(IProduct productService) {
//        this.productService = productService;
//    }
//
//    @PostMapping("/products")
//    public ResponseEntity<ProductDTO> createProduct(
//            @Valid @RequestBody ProductDTO dto) {
//
//        ProductDTO saved = productService.create(dto);
//
//        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
//    }
//}