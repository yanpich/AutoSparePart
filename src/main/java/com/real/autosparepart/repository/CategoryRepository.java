package com.real.autosparepart.repository;

import com.real.autosparepart.model.Category;  // Fix: Import your actual Category entity
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    boolean existsByName(String name);

    boolean existsBySlug(@NotBlank(message = "Category slug is required") String slug);
}