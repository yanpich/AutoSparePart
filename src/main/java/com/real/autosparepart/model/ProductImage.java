package com.real.autosparepart.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "product_images")
public class ProductImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "img_id")
    private Integer id;

    @NotNull(message = "Product is required!")
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product productId;

    @NotBlank(message = "Image URL is required!")
    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_primary")
    private Boolean isPrimary;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (sortOrder == null) {
            sortOrder = 0;
        }
        if (isPrimary == null) {
            isPrimary = false;
        }
    }
}
