package com.real.autosparepart.service;

import com.real.autosparepart.dto.ProductDetailsDTO;
import com.real.autosparepart.exception.BadRequestException;
import com.real.autosparepart.exception.NotFoundException;
import com.real.autosparepart.mapper.ProductDetailsMapper;
import com.real.autosparepart.model.Product;
import com.real.autosparepart.model.ProductDetails;
import com.real.autosparepart.repository.ProductDetailsRepository;
import com.real.autosparepart.repository.ProductRepository;
import com.real.autosparepart.validator.ProductDetailsValidator;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductDetailServiceImp implements ProductDetailService {

    private final ProductDetailsRepository productDetailsRepository;
    private final ProductRepository productRepository;
    private final ProductDetailsMapper mapper;
    private final ProductDetailsValidator validator;

    @Override
    public ProductDetailsDTO findById(Integer id) {
        log.debug("Finding product details by id: {}", id);

        ProductDetails entity = productDetailsRepository.findByIdWithProduct(id)
                .orElseThrow(() -> new NotFoundException("Product details not found with id: " + id));

        return convertToDTO(entity);
    }

    @Override
    public List<ProductDetailsDTO> findAll() {
        log.debug("Finding all product details");

        List<ProductDetails> entities = productDetailsRepository.findAllWithProduct();

        return entities.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public ProductDetailsDTO create(@Valid ProductDetailsDTO dto) {
        log.info("Creating Product details for productId: {}", dto.getProductId());

        validator.validateCreate(dto);

        // Check if product exists
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new NotFoundException("Product not found with id: " + dto.getProductId()));

        // Check if product details already exist for this product
        if (productDetailsRepository.existsByProduct_ProductId(dto.getProductId())) {
            throw new BadRequestException("Product details already exist for product id: " + dto.getProductId());
        }

        // Create new User
        ProductDetails entity = ProductDetails.builder()
                .product(product)
                .oldPrice(dto.getOldPrice())
                .reviewsCount(dto.getReviewsCount() != null ? dto.getReviewsCount() : 0)
                .features(dto.getFeatures())
                .specifications(dto.getSpecifications())
                .weight(dto.getWeight())
                .dimension(dto.getDimension())
                .material(dto.getMaterial())
                .build();

        ProductDetails saved = productDetailsRepository.save(entity);
        log.info("Product details created successfully with id: {}, productId: {}",
                saved.getId(), saved.getProduct().getProductId());

        return convertToDTO(saved);
    }

    @Transactional
    @Override
    public ProductDetailsDTO update(Integer id, @Valid ProductDetailsDTO dto) {
        log.info("Updating product details with id: {}", id);

        validator.validateUpdate(dto);

        ProductDetails entity = productDetailsRepository.findByIdWithProduct(id)
                .orElseThrow(() -> new NotFoundException("Product details not found with id: " + id));

        // Update fields
        if (dto.getOldPrice() != null) {
            entity.setOldPrice(dto.getOldPrice());
        }
        if (dto.getReviewsCount() != null) {
            entity.setReviewsCount(dto.getReviewsCount());
        }
        if (dto.getFeatures() != null) {
            entity.setFeatures(dto.getFeatures());
        }
        if (dto.getSpecifications() != null) {
            entity.setSpecifications(dto.getSpecifications());
        }
        if (dto.getWeight() != null) {
            entity.setWeight(dto.getWeight());
        }
        if (dto.getDimension() != null) {
            entity.setDimension(dto.getDimension());
        }
        if (dto.getMaterial() != null) {
            entity.setMaterial(dto.getMaterial());
        }

        // If productId is being changed
        if (dto.getProductId() != null && !dto.getProductId().equals(entity.getProduct().getProductId())) {
            Product newProduct = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new NotFoundException("Product not found with id: " + dto.getProductId()));

            if (productDetailsRepository.existsByProduct_ProductId(dto.getProductId())) {
                throw new BadRequestException("Product details already exist for product id: " + dto.getProductId());
            }
            entity.setProduct(newProduct);
        }
        ProductDetails updated = productDetailsRepository.save(entity);
        log.info("Product details updated successfully with id: {}, productId: {}",
                updated.getId(), updated.getProduct().getProductId());

        return convertToDTO(updated);
    }

    @Transactional
    @Override
    public void deleteById(Integer id) {
        log.info("Deleting product details with id: {}", id);

        if (!productDetailsRepository.existsById(id)) {
            throw new NotFoundException("Product details not found with id: " + id);
        }

        productDetailsRepository.deleteById(id);
        log.info("Product details deleted successfully with id: {}", id);
    }

    // Helper method to convert Entity to DTO with proper productId
    private ProductDetailsDTO convertToDTO(ProductDetails entity) {
        if (entity == null) {
            return null;
        }

        Integer productId = null;
        if (entity.getProduct() != null) {
            productId = entity.getProduct().getProductId();
            log.debug("Product ID from User: {}", productId);
        }

        return ProductDetailsDTO.builder()
                .id(entity.getId())
                .productId(productId)
                .oldPrice(entity.getOldPrice())
                .reviewsCount(entity.getReviewsCount())
                .features(entity.getFeatures())
                .specifications(entity.getSpecifications())
                .weight(entity.getWeight())
                .dimension(entity.getDimension())
                .material(entity.getMaterial())
                .build();
    }
}