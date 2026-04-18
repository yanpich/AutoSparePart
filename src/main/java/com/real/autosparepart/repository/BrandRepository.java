package com.real.autosparepart.repository;

import com.real.autosparepart.model.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BrandRepository extends JpaRepository<Brand, Integer> {

    boolean existsByBrandName(String brandName);

    Optional<Brand> findByBrandName(String brandName);

    void deleteByBrandName(String brandName);
}
