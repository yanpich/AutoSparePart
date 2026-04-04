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

    private Integer vehicleId;  // This is your ID field

    private String model;

    private Integer yearFrom;

    private Integer yearTo;
}