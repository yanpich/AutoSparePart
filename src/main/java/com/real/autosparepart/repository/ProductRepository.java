package com.real.autosparepart.repository;

import aj.org.objectweb.asm.commons.Remapper;
import com.real.autosparepart.model.Product;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ProductRepository extends JpaRepository<Product,Integer> {


    boolean existsByProductNameIgnoreCase(String name);

    boolean existsBySlug(String slug);
}
