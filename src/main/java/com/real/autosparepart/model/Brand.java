package com.real.autosparepart.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

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

    @NotBlank(message = "Please provide brand-admin-panel's name!")
    @Column(name = "brand_name", unique = true, nullable = false)
    private String brandName;

    @NotBlank(message = "Please provide brand-admin-panel's image!")
    @Column(nullable = false)
    private String image; // URL or path to the brand-admin-panel's image

    @Transient // This field is not stored in database
    private MultipartFile file; // Temporary file upload

    @OneToMany(mappedBy = "brand")
    private List<Product> products;

}

