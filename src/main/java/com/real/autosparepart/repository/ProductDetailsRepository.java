package com.real.autosparepart.repository;

import com.real.autosparepart.model.Product;
import com.real.autosparepart.model.ProductDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductDetailsRepository extends JpaRepository<ProductDetails,Integer> {


}
