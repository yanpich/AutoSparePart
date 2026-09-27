package com.real.autosparepart.brand.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BrandStats {
    private long total;
    private long active;
    private long inactive;
    private long deleted;

    // You can also add percentage calculations
    public double getActivePercentage() {
        return total > 0 ? (active * 100.0 / total) : 0;
    }

    public double getDeletedPercentage() {
        return total > 0 ? (deleted * 100.0 / total) : 0;
    }

    public double getInactivePercentage() {
        return total > 0 ? (inactive * 100.0 / total) : 0;
    }
}