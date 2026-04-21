package com.real.autosparepart.service;

import com.real.autosparepart.dto.VehicleDTO;

import java.util.List;

public interface VehicleService {

    VehicleDTO getVehicleById(Integer id);

    List<VehicleDTO> getAllVehicles(VehicleDTO dto);

    VehicleDTO createVehicle(VehicleDTO dto);

    VehicleDTO updateVehicle(Integer id, VehicleDTO dto);

    VehicleDTO patchVehicle(Integer id, VehicleDTO dto);

    void deleteVehicleById(Integer id);
}