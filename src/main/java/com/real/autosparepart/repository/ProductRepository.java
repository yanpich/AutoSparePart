package com.real.autosparepart.repository;

import com.real.autosparepart.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ProductRepository extends JpaRepository<Product,Integer> {


    boolean existsByProductNameIgnoreCase(String name);
}
