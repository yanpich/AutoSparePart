package com.real.autosparepart.mapper;

import com.real.autosparepart.dto.ProductDetailsDTO;
import com.real.autosparepart.model.ProductDetails;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProductDetailsMapper {

    @Mapping(source = "product.productId", target = "productId")
    ProductDetailsDTO toDTO(ProductDetails entity);

    @Mapping(target = "product", ignore = true)
    @Mapping(target = "id", ignore = true)
    ProductDetails toEntity(ProductDetailsDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "product", ignore = true)
    void updateEntityFromDTO(ProductDetailsDTO dto, @MappingTarget ProductDetails entity);
}