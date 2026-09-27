package com.real.autosparepart.brand.entity;

import com.real.autosparepart.product.entity.Product;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "brands")
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "brand_id")
    private Integer brandId;

    @NotBlank(message = "Please provide brand's name!")
    @Column(name = "brand_name", unique = true, nullable = false)
    private String brandName;

    @NotBlank(message = "Please provide brand's image!")
    @Column(nullable = false)
    private String image;

    @Transient
    private MultipartFile file;

    @OneToMany(mappedBy = "brand")
    private List<Product> products;

    // Soft delete fields
    @Column(name = "deleted")
    @ColumnDefault("false")  
    private Boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    private Integer deletedBy;

    @Column(name = "restored_at")
    private LocalDateTime restoredAt;

    @Column(name = "restored_by")
    private Integer restoredBy;

    // ✅ FIX: Use Boolean wrapper instead of primitive boolean
    @Column(name = "is_active")
    private Boolean active = true;

    @Column(name = "status")
    private String status = "active";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "active";
        if (active == null) active = true;
        deleted = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isDeleted() {
        return deleted;
    }
}