package com.real.autosparepart.repository;

import com.real.autosparepart.model.ProductDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductDetailsRepository extends JpaRepository<ProductDetails, Integer> {

    boolean existsByProduct_ProductId(Integer productId);

    Optional<ProductDetails> findByProduct_ProductId(Integer productId);

    @Query("SELECT pd FROM ProductDetails pd LEFT JOIN FETCH pd.product WHERE pd.id = :id")
    Optional<ProductDetails> findByIdWithProduct(@Param("id") Integer id);

    @Query("SELECT pd FROM ProductDetails pd LEFT JOIN FETCH pd.product")
    List<ProductDetails> findAllWithProduct();
}