//package com.real.autosparepart.service;
//
//import com.real.autosparepart.dto.ProductDTO;
//import com.real.autosparepart.model.Brand;
//import com.real.autosparepart.model.Category;
//import com.real.autosparepart.model.Product;
//import com.real.autosparepart.model.Vehicle;
//import com.real.autosparepart.repository.BrandRepository;
//import com.real.autosparepart.repository.CategoryRepository;
//import com.real.autosparepart.repository.ProductRepository;
//import com.real.autosparepart.repository.VehicleRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.List;
//
//@Service
//public class ProductService implements IProduct {
//
//    private final ProductRepository productRepository;
//    private final CategoryRepository categoryRepository;
//    private final BrandRepository brandRepository;
//    private final VehicleRepository vehicleRepository;
//
//    @Autowired
//    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository, BrandRepository brandRepository, VehicleRepository vehicleRepository) {
//        this.productRepository = productRepository;
//        this.categoryRepository = categoryRepository;
//        this.brandRepository = brandRepository;
//        this.vehicleRepository = vehicleRepository;
//    }
//
////    @Override
////    public Optional<ProductDTO> findById(Integer id) {
////        return Optional.empty();
////    }
//
//    @Override
//    public ProductDTO create(ProductDTO dto) {
//
//        // 1. Validate
//        if (dto == null) {
//            throw new RuntimeException("Product cannot be null");
//        }
//
//        if (dto.getProductName() == null || dto.getProductName().trim().isEmpty()) {
//            throw new RuntimeException("Product name is required");
//        }
//
//        if (dto.getPrice() == null || dto.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
//            throw new IllegalArgumentException("Price must be greater than 0");
//        }
//
//        // 2. Normalize for fix spelling and trim
//        String name = dto.getProductName().trim();
//        dto.setProductName(name);
//
//        // 3. Duplicate check - FIXED: use productName, not name
//        if (productRepository.existsByProductNameIgnoreCase(name)) {
//            throw new RuntimeException("Product with name '" + name + "' already exists");
//        }
//
//        // 4. Slug generate
//        String slug = (dto.getSlug() == null || dto.getSlug().isEmpty())
//                ? name.toLowerCase().replace(" ", "_")
//                : dto.getSlug();
//
//        // 5. Mapping DTO -> Entity
//        Product product = new Product();
//        product.setProductName(name);  // FIXED: use setProductName (lowercase s)
//        product.setSlug(slug);
//        product.setPrice(dto.getPrice());  // FIXED: use setPrice (lowercase s)
//        product.setDescription(dto.getDescription());  // FIXED: use setDescription (correct spelling)
//
//        // FIXED: Status mapping
//        if (dto.getStatus() != null) {
//            product.setStatus(Product.Status.valueOf(dto.getStatus().name()));
//        } else {
//            product.setStatus(Product.Status.DRAFT); // default status
//        }
//
//        // FIXED: Category mapping
//        Category category = categoryRepository.findById(dto.getCategoryId())
//                .orElseThrow(() -> new RuntimeException(
//                        "Category not found with id: " + dto.getCategoryId()
//                ));
//        product.setCategory(category);
//
//        // FIXED: Brand mapping if provided
//        if (dto.getBrandId() != null) {
//            Brand brand = brandRepository.findById(dto.getBrandId())
//                    .orElseThrow(() -> new RuntimeException(
//                            "Brand not found with id: " + dto.getBrandId()
//                    ));
//            product.setBrand(brand);
//        }
//
//        // FIXED: Vehicle mapping if provided (for ManyToMany)
//        if (dto.getVehicleId() != null && vehicles != null) {
//            // This needs to handle the list properly
//            Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
//                    .orElseThrow(() -> new RuntimeException(
//                            "Vehicle not found with id: " + dto.getVehicleId()
//                    ));
//            product.setVehicles(List.of(vehicle));
//        }
//
//        // 6. Timestamps (these will be set by @PrePersist, but explicit is fine)
//        product.setCreatedAt(LocalDateTime.now());
//        product.setUpdatedAt(LocalDateTime.now());
//
//        // 7. Save
//        Product saved = productRepository.save(product);
//
//        // 8. Return DTO
//        return mapToDTO(saved);
//    }
//
//    private ProductDTO mapToDTO(Product saved) {
//        if (saved == null) {
//            throw new RuntimeException("Product cannot be null");
//        }
//
//        ProductDTO dto = new ProductDTO();
//        dto.setProductId(saved.getProductId());
//        dto.setProductName(saved.getProductName());
//        dto.setSlug(saved.getSlug());
//        dto.setPrice(saved.getPrice());
//        dto.setDescription(saved.getDescription());
//
//        // FIXED: enum mapping
//        if (saved.getStatus() != null) {
//            dto.setStatus(saved.getStatus());
//        }
//
//        // FIXED: relationship to ID mapping
//        if (saved.getCategory() != null) {
//            dto.setCategoryId(saved.getCategory().getId());
//        }
//
//        if (saved.getBrand() != null) {
//            dto.setBrandId(saved.getBrand().getBrandId()); // Assuming Brand has getBrandId()
//        }
//
//        // FIXED: Handle vehicles (ManyToMany returns List)
//        if (saved.getVehicles() != null && !saved.getVehicles().isEmpty()) {
//            dto.setVehicleId(saved.getVehicles().get(0).getVehicleId()); // Gets first vehicle
//            // Or if you need all vehicle IDs:
//            // List<Integer> vehicleIds = saved.getVehicles().stream()
//            //         .map(Vehicle::getVehicleId)
//            //         .collect(Collectors.toList());
//            // dto.setVehicleIds(vehicleIds);
//        }
//
//        dto.setCreatedAt(saved.getCreatedAt());
//        dto.setUpdatedAt(saved.getUpdatedAt());
//
//        return dto;
//    }
//    @Override
//    public ProductDTO update(Integer id, ProductDTO dto) {
//        return null;
//    }
//
//    @Override
//    public void delete(Integer id) {
//
//    }

//    @Override
//    public Optional<ProductDTO> findBySlug(String slug) {
//        // input validation
//        if (slug == null || slug.isEmpty()) {
//            return Optional.empty();
//        }
//        for (Product p : productRepository.findAll()) { // find product by slug vai Repository
//            if (slug.equals(p.getSlug())) {
//                return Optional.of(p);
//            }
//        }
//        return Optional.empty();
//    }
//
//    @Override
//    public boolean existsByName(String name) {
//        if (name == null || name.trim().isEmpty()) {
//            return false;
//        }
//        return productRepository.existsByName(name);
//    }
//
//    @Override
//    public Page<Product> findByStatus(Product.Status status, Pageable pageable) {
//        return null;
//    }
//}
