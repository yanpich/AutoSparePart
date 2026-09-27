package com.real.autosparepart.category.entity;


import com.real.autosparepart.product.entity.Product;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Integer categoryId;

    @NotBlank(message = "Please provide category name!")
    @Column(name = "category_name", unique = true, nullable = false)
    private String categoryName;

    @NotBlank(message = "Please provide slug!")
    @Column(name = "slug", unique = true, nullable = false)
    private String slug;

    @Column(name = "description")
    private String description;

    @OneToMany(mappedBy = "category")
    private List<Product> products;


    // soft delete field
    @Column(name = "deleted")
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private String deletedBy;

    @Column(name = "restored_at")
    private LocalDateTime restoredAt;

    @Column(name = "restored_by")
    private String restoredBy;

    // status fields
    @Column(name = "is_active")
    private Boolean active = true;

    @Column(name = "status")
    private String status = "active";

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "create_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (createdAt == null) status = "active";
        if (active == null) active = true;
        deleted = false;
        if (displayOrder == null) displayOrder = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    public Object getId() {
        return categoryId;
    }

}