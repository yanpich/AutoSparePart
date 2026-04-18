package com.real.autosparepart.repository;

import com.real.autosparepart.model.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ProductImgRepository extends JpaRepository<ProductImage, Integer> {

    // Find all images by product ID
    List<ProductImage> findByProductId_ProductId(Integer productId);

    // Find primary image of a product
    ProductImage findByProductId_ProductIdAndIsPrimaryTrue(Integer productId);

    // Delete all images of a product
    @Modifying
    @Transactional
    @Query("DELETE FROM ProductImage pi WHERE pi.productId.productId = :productId")
    void deleteByProductId_ProductId(@Param("productId") Integer productId);

    // Count images by product
    long countByProductId_ProductId(Integer productId);
}