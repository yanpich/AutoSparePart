package com.real.autosparepart.service;

import com.real.autosparepart.dto.VehicleDTO;

import java.util.List;

public interface IVehicle {
    // READ - Get vehicle by ID
    VehicleDTO getVehicleById(Integer id);

    // READ all
    List<VehicleDTO> getAllVehicles(VehicleDTO dto);


    // CREATE
    VehicleDTO createVehicle(VehicleDTO dto);

    // UPDATE
    VehicleDTO updateVehicle(Integer id, VehicleDTO dto);

    // DELETE
    void deleteVehicleById(Integer id);
}
