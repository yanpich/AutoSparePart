package com.real.autosparepart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VehicleDTO {

    private Integer vehicleId;
    private String model;
    private Integer yearFrom;
    private Integer yearTo;
    private String status;
    private Integer productCount;
    private String createdAt;
    private String updatedAt;
}