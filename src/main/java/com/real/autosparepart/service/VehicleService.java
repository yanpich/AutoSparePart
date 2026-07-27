package com.real.autosparepart.service;

import com.real.autosparepart.dto.VehicleDTO;

import java.util.List;
import java.util.Map;

public interface VehicleService {

    // GET methods
    VehicleDTO getVehicleById(Integer id);
    List<VehicleDTO> getAllVehicles(VehicleDTO dto);
    List<VehicleDTO> getAllActiveVehicles();
    List<VehicleDTO> getAllDeletedVehicles();
    List<VehicleDTO> searchVehicles(String keyword);
    List<VehicleDTO> getByYearRange(Integer yearFrom, Integer yearTo);
    Map<String, Object> getVehicleStats();

    // CREATE, UPDATE, DELETE
    VehicleDTO createVehicle(VehicleDTO dto);
    VehicleDTO updateVehicle(Integer id, VehicleDTO dto);
    VehicleDTO patchVehicle(Integer id, VehicleDTO dto);

    // Soft Delete operations
    void softDeleteVehicle(Integer id);
    void restoreVehicle(Integer id);
    void hardDeleteVehicle(Integer id);
    void deleteVehicleById(Integer id);
}