package com.real.autosparepart.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name = "product_details")
public class ProductDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "old_price", precision = 10, scale = 2)
    private BigDecimal oldPrice;

    @Column(name = "reviews_count")
    private Integer reviewsCount = 0;

    @Column(name = "features", columnDefinition = "LONGTEXT")
    private String features;

    @Column(name = "specifications", columnDefinition = "LONGTEXT")
    private String specifications;

    @Positive(message = "Weight must be positive!")
    @Column(name = "weight", precision = 10, scale = 2)
    private BigDecimal weight;

    @Column(name = "dimension")
    private String dimension;

    @Column(name = "material")
    private String material;

}