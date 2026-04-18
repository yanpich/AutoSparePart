package com.real.autosparepart.service;

import com.real.autosparepart.dto.ProductDTO;
import com.real.autosparepart.model.Brand;
import com.real.autosparepart.model.Category;
import com.real.autosparepart.model.Product;
import com.real.autosparepart.model.Vehicle;
import com.real.autosparepart.repository.BrandRepository;
import com.real.autosparepart.repository.CategoryRepository;
import com.real.autosparepart.repository.ProductRepository;
import com.real.autosparepart.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService implements IProduct {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final VehicleRepository vehicleRepository;

    @Autowired
    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          BrandRepository brandRepository,
                          VehicleRepository vehicleRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.vehicleRepository = vehicleRepository;
    }
    @Override
    public ProductDTO create(ProductDTO dto) {
        // 1. Validate
        if (dto == null) {
            throw new RuntimeException("Product cannot be null");
        }
        if (dto.getProductName() == null || dto.getProductName().trim().isEmpty()) {
            throw new RuntimeException("Product name is required");
        }

        if (dto.getPrice() == null || dto.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than 0");
        }

        // 2. Normalize for fix spelling and trim
        String name = dto.getProductName().trim();
        dto.setProductName(name);

        // 3. Duplicate check
        if (productRepository.existsByProductNameIgnoreCase(name)) {
            throw new RuntimeException("Product with name '" + name + "' already exists");
        }

        // 4. Slug generate or validate
        String slug = (dto.getSlug() == null || dto.getSlug().isEmpty())
                ? name.toLowerCase().replace(" ", "_")
                : dto.getSlug().trim();

        if (productRepository.existsBySlug(slug)) {
            throw new RuntimeException("Product with slug '" + slug + "' already exists");
        }

        // 5. Mapping DTO -> Entity
        Product product = new Product();
        product.setProductName(name);
        product.setSlug(slug);
        product.setPrice(dto.getPrice());
        product.setDescription(dto.getDescription());

        // Status mapping
        if (dto.getStatus() != null) {
            product.setStatus(dto.getStatus());
        } else {
            product.setStatus(Product.Status.draft);
        }

        // Category mapping (required)
        if (dto.getCategoryId() == null) {
            throw new RuntimeException("Category ID is required");
        }
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException(
                        "Category not found with id: " + dto.getCategoryId()
                ));
        product.setCategory(category);

        // Brand mapping (optional)
        if (dto.getBrandId() != null) {
            Brand brand = brandRepository.findById(dto.getBrandId())
                    .orElseThrow(() -> new RuntimeException(
                            "Brand not found with id: " + dto.getBrandId()
                    ));
            product.setBrand(brand);
        }

        // Vehicle mapping (optional - for ManyToMany)
        if (dto.getVehicleIds() != null && !dto.getVehicleIds().isEmpty()) {
            List<Vehicle> vehicles = vehicleRepository.findAllById(dto.getVehicleIds());
            if (vehicles.size() != dto.getVehicleIds().size()) {
                throw new RuntimeException("Some vehicles not found");
            }
            product.setVehicles(vehicles);
        } else if (dto.getVehicleId() != null) {
            // Support single vehicle ID for backward compatibility
            Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                    .orElseThrow(() -> new RuntimeException(
                            "Vehicle not found with id: " + dto.getVehicleId()
                    ));
            product.setVehicles(List.of(vehicle));
        } else {
            product.setVehicles(Collections.emptyList());
        }

        // Timestamps
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        // Save
        Product saved = productRepository.save(product);

        // Return DTO
        return mapToDTO(saved);
    }

//    @Override
//    public Optional<Object> findBySlug(String slug) {
//        if (slug == null || slug.trim().isEmpty()) {
//            return Optional.empty();
//        }
//        return productRepository.findBySlug(slug.trim())
//                .map(this::mapToDTO);
//    }

//    @Override
//    public Page<ProductDTO> findByStatus(Product.Status status, Pageable pageable) {
//        return productRepository.findByStatus(status, pageable)
//                .map(this::mapToDTO);
//    }

    @Override
    public boolean existsByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return false;
        }
        return productRepository.existsByProductNameIgnoreCase(name.trim());
    }

    @Override
    public boolean existsBySlug(String slug) {
        if (slug == null || slug.trim().isEmpty()) {
            return false;
        }
        return productRepository.existsBySlug(slug.trim());
    }

    @Override
    public Optional<ProductDTO> findByIdOptional(Integer id) {
        return productRepository.findById(id)
                .map(this::mapToDTO);
    }

    @Override
    public ProductDTO findById(Integer id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product with id '" + id + "' not found"));
        return mapToDTO(product);
    }

    @Override
    public List<ProductDTO> findAll() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ProductDTO> findAll(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    @Override
    public ProductDTO update(Integer id, ProductDTO dto) {
        // Find existing product
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product with id '" + id + "' not found"));

        // Update product name
        if (dto.getProductName() != null && !dto.getProductName().trim().isEmpty()) {
            String newName = dto.getProductName().trim();
            if (!newName.equals(existingProduct.getProductName()) &&
                    productRepository.existsByProductNameIgnoreCase(newName)) {
                throw new RuntimeException("Product with name '" + newName + "' already exists");
            }
            existingProduct.setProductName(newName);
        }

        // Update slug
        if (dto.getSlug() != null && !dto.getSlug().trim().isEmpty()) {
            String newSlug = dto.getSlug().trim();
            if (!newSlug.equals(existingProduct.getSlug()) &&
                    productRepository.existsBySlug(newSlug)) {
                throw new RuntimeException("Product with slug '" + newSlug + "' already exists");
            }
            existingProduct.setSlug(newSlug);
        }

        // Update price
        if (dto.getPrice() != null) {
            if (dto.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Price must be greater than 0");
            }
            existingProduct.setPrice(dto.getPrice());
        }

        // Update description
        if (dto.getDescription() != null) {
            existingProduct.setDescription(dto.getDescription());
        }

        // Update status
        if (dto.getStatus() != null) {
            existingProduct.setStatus(dto.getStatus());
        }

        // Update category
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException(
                            "Category not found with id: " + dto.getCategoryId()
                    ));
            existingProduct.setCategory(category);
        }

        // Update brand-admin-panel
        if (dto.getBrandId() != null) {
            Brand brand = brandRepository.findById(dto.getBrandId())
                    .orElseThrow(() -> new RuntimeException(
                            "Brand not found with id: " + dto.getBrandId()
                    ));
            existingProduct.setBrand(brand);
        }

        // Update vehicles
        if (dto.getVehicleIds() != null) {
            List<Vehicle> vehicles = vehicleRepository.findAllById(dto.getVehicleIds());
            if (vehicles.size() != dto.getVehicleIds().size()) {
                throw new RuntimeException("Some vehicles not found");
            }
            existingProduct.setVehicles(vehicles);
        } else if (dto.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                    .orElseThrow(() -> new RuntimeException(
                            "Vehicle not found with id: " + dto.getVehicleId()
                    ));
            existingProduct.setVehicles(List.of(vehicle));
        }

        // Update timestamp
        existingProduct.setUpdatedAt(LocalDateTime.now());

        // Save
        Product updated = productRepository.save(existingProduct);
        return mapToDTO(updated);
    }
    @Override
    public void delete(Integer id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product with id '" + id + "' not found");
        }
        productRepository.deleteById(id);
    }

    private ProductDTO mapToDTO(Product product) {
        if (product == null) {
            throw new RuntimeException("Product cannot be null");
        }

        ProductDTO dto = ProductDTO.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .slug(product.getSlug())
                .price(product.getPrice())
                .description(product.getDescription())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();

        // Map relationships to IDs
        if (product.getCategory() != null) {
            dto.setCategoryId((Integer) product.getCategory().getId());
        }

        if (product.getBrand() != null) {
            dto.setBrandId(product.getBrand().getBrandId());
        }

        // Map vehicles (ManyToMany)
        if (product.getVehicles() != null && !product.getVehicles().isEmpty()) {
            List<Integer> vehicleIds = product.getVehicles().stream()
                    .map(Vehicle::getVehicleId)
                    .collect(Collectors.toList());
            dto.setVehicleIds(vehicleIds);

            // For backward compatibility, set first vehicle ID
            dto.setVehicleId(vehicleIds.get(0));
        }

        return dto;
    }
}