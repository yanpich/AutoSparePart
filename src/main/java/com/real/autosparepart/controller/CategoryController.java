package com.real.autosparepart.controller;

import com.real.autosparepart.dto.CategoryDTO;
import com.real.autosparepart.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @GetMapping("/categories/{id}")
    public ResponseEntity<CategoryDTO> findById(@PathVariable Integer id) {
        CategoryDTO category = categoryService.findById(id);
        return ResponseEntity.status(HttpStatus.OK).body(category);
    }
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> findAll() {
        List<CategoryDTO> list = categoryService.findAll();
        return ResponseEntity.status(HttpStatus.OK).body(list);
    }
    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryDTO> update(@PathVariable Integer id, @Valid @RequestBody CategoryDTO dto) {
        CategoryDTO updated = categoryService.updateCategory(id, dto);  // Pass both parameters
        return ResponseEntity.status(HttpStatus.OK).body(updated);
    }
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        categoryService.deleteById(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
