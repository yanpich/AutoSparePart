package com.real.autosparepart.dto;

import com.real.autosparepart.model.Brand;
import com.real.autosparepart.model.Category;
import com.real.autosparepart.model.Product;
import com.real.autosparepart.model.Vehicle;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {

    private Integer productId;

    @NotBlank(message = "product name is required")
    private String productName;

    private String slug;

    @NotBlank(message = "price is required")
    @DecimalMax(value = "0.1", message = "Price must be > 0")
    private BigDecimal price;

    private String description;

    private Product.Status status;

    private Vehicle vehicleId;

    private Category category_id;

    private Brand brandId;

    public void setCreatedAt(LocalDateTime now) {
    }

    public void setUpdatedAt(LocalDateTime now) {
    }

    public void setCategoryId(Object id) {
        return;
    }

    public Integer getCategoryId() {
        return null;
    }

    public void setBrandId(Integer brandId) {
        return;
    }

    public void setVehicleId(Integer vehicleId) {
        return;
    }
}
