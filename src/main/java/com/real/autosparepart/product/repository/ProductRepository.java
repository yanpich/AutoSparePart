package com.real.autosparepart.product.repository;

import com.real.autosparepart.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ProductRepository extends JpaRepository<Product,Integer> {


    boolean existsByProductNameIgnoreCase(String name);

    boolean existsBySlug(String slug);

}
