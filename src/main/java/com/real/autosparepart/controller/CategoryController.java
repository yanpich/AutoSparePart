package com.real.autosparepart.controller;

import com.real.autosparepart.dto.CategoryDTO;
import com.real.autosparepart.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CategoryController {

    private final CategoryService categoryService;

    @Autowired
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }
    @PostMapping("/categories")
    public ResponseEntity<CategoryDTO> create(@Valid @RequestBody CategoryDTO dto) {
        CategoryDTO saved = categoryService.createCategory(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);

    }
}
