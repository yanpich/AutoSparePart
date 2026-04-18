package com.real.autosparepart.service;

import com.real.autosparepart.dto.ProductDTO;
import com.real.autosparepart.exception.*;
import com.real.autosparepart.mapper.ProductMapper;
import com.real.autosparepart.model.*;
import com.real.autosparepart.repository.*;
import com.real.autosparepart.util.SlugUtil;
import com.real.autosparepart.validator.ProductValidator;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductServiceImp implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final VehicleRepository vehicleRepository;

    // ================= CREATE =================
    @Transactional
    @Override
    public ProductDTO create(ProductDTO dto) {

        ProductValidator.validate(dto);

        String name = dto.getProductName().trim();

        if (productRepository.existsByProductNameIgnoreCase(name)) {
            throw new DuplicateResourceException("Product already exists");
        }

        String slug = (dto.getSlug() == null || dto.getSlug().isBlank())
                ? SlugUtil.generate(name)
                : dto.getSlug().trim();

        if (productRepository.existsBySlug(slug)) {
            throw new DuplicateResourceException("Slug already exists");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category not found"));

        Brand brand = null;
        if (dto.getBrandId() != null) {
            brand = brandRepository.findById(dto.getBrandId())
                    .orElseThrow(() -> new NotFoundException("Brand not found"));
        }

        List<Vehicle> vehicles = mapVehicles(dto);

        Product product = new Product();
        product.setProductName(name);
        product.setSlug(slug);
        product.setPrice(dto.getPrice());
        product.setDescription(dto.getDescription());
        product.setCategory(category);
        product.setBrand(brand);
        product.setVehicles(vehicles);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        return ProductMapper.toDTO(productRepository.save(product));
    }

    // ================= FIND BY ID =================
    @Override
    public ProductDTO findById(Integer id) {
        return productRepository.findById(id)
                .map(ProductMapper::toDTO)
                .orElseThrow(() -> new NotFoundException("Product not found"));
    }

    @Override
    public Optional<ProductDTO> findByIdOptional(Integer id) {
        return productRepository.findById(id)
                .map(ProductMapper::toDTO);
    }

    // ================= FIND ALL =================
    @Override
    public List<ProductDTO> findAll() {
        return productRepository.findAll()
                .stream()
                .map(ProductMapper::toDTO)
                .toList();
    }

    @Override
    public Page<ProductDTO> findAll(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(ProductMapper::toDTO);
    }

    // ================= EXISTS =================
    @Override
    public boolean existsByName(String name) {
        return name != null && !name.isBlank()
                && productRepository.existsByProductNameIgnoreCase(name.trim());
    }

    @Override
    public boolean existsBySlug(String slug) {
        return slug != null && !slug.isBlank()
                && productRepository.existsBySlug(slug.trim());
    }

    // ================= UPDATE =================
    @Transactional
    @Override
    public ProductDTO update(Integer id, ProductDTO dto) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        // Name
        if (dto.getProductName() != null && !dto.getProductName().isBlank()) {
            String name = dto.getProductName().trim();

            if (!name.equalsIgnoreCase(product.getProductName())
                    && productRepository.existsByProductNameIgnoreCase(name)) {
                throw new DuplicateResourceException("Product name already exists");
            }

            product.setProductName(name);
        }

        // Slug
        if (dto.getSlug() != null && !dto.getSlug().isBlank()) {
            String slug = dto.getSlug().trim();

            if (!slug.equalsIgnoreCase(product.getSlug())
                    && productRepository.existsBySlug(slug)) {
                throw new DuplicateResourceException("Slug already exists");
            }

            product.setSlug(slug);
        }

        // Price
        if (dto.getPrice() != null) {
            if (dto.getPrice().signum() <= 0) {
                throw new BadRequestException("Price must be > 0");
            }
            product.setPrice(dto.getPrice());
        }

        // Description
        if (dto.getDescription() != null) {
            product.setDescription(dto.getDescription());
        }

        // Category
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new NotFoundException("Category not found"));
            product.setCategory(category);
        }

        // Brand
        if (dto.getBrandId() != null) {
            Brand brand = brandRepository.findById(dto.getBrandId())
                    .orElseThrow(() -> new NotFoundException("Brand not found"));
            product.setBrand(brand);
        }

        // Vehicles (support both list + single)
        if (dto.getVehicleIds() != null || dto.getVehicleId() != null) {
            product.setVehicles(mapVehicles(dto));
        }

        product.setUpdatedAt(LocalDateTime.now());

        return ProductMapper.toDTO(productRepository.save(product));
    }

    // ================= DELETE =================
    @Transactional
    @Override
    public void delete(Integer id) {
        if (!productRepository.existsById(id)) {
            throw new NotFoundException("Product not found");
        }
        productRepository.deleteById(id);
    }

    // ================= HELPER =================
    private List<Vehicle> mapVehicles(ProductDTO dto) {

        if (dto.getVehicleIds() != null && !dto.getVehicleIds().isEmpty()) {
            List<Vehicle> vehicles = vehicleRepository.findAllById(dto.getVehicleIds());

            if (vehicles.size() != dto.getVehicleIds().size()) {
                throw new NotFoundException("Some vehicles not found");
            }
            return vehicles;
        }

        if (dto.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                    .orElseThrow(() -> new NotFoundException("Vehicle not found"));
            return List.of(vehicle);
        }

        return Collections.emptyList();
    }
}