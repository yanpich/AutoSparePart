package com.real.autosparepart.service;

import com.real.autosparepart.dto.VehicleDTO;
import com.real.autosparepart.model.Vehicle;
import com.real.autosparepart.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService implements IVehicle {

    private VehicleRepository vehicleRepository;

    @Autowired
    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    public VehicleDTO getVehicleById(Integer id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle with id '" + id + "' not found"));
        return mapToDTO(vehicle);
    }

    @Override
    public List<VehicleDTO> getAllVehicles(VehicleDTO dto) {
        List<Vehicle> vehicles;

        // Apply filters if dto is provided and has any non-null fields
        if (dto != null && hasFilters(dto)) {
            vehicles = vehicleRepository.findByFilters(
                    dto.getVehicleId(),
                    dto.getModel(),
                    dto.getYearFrom(),
                    dto.getYearTo()
            );
        } else {
            // No filters, get all vehicles
            vehicles = vehicleRepository.findAll();
        }

        // Convert to DTOs and return
        return vehicles.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Helper method to check if any filter is applied
    private boolean hasFilters(VehicleDTO dto) {
        return dto.getVehicleId() != null ||
                StringUtils.hasText(dto.getModel()) ||
                dto.getYearFrom() != null ||
                dto.getYearTo() != null;
    }

    @Override
    public VehicleDTO createVehicle(VehicleDTO dto) {
        //1. Validate
        if (dto == null || dto.getModel() == null) {
            throw new RuntimeException("Vehicle cannot be null and must have a model");
        }
        if (dto.getYearFrom() == null || dto.getYearFrom() < 0) {
            throw new RuntimeException("Vehicle cannot be null and must have a year from 0");
        }
        if (dto.getYearFrom() > 9999) {
            throw new RuntimeException("Vehicle cannot be null and must have a year from 9999");
        }

        //2. Normalize for fix spelling and trim
        String model = dto.getModel().trim();
        dto.setModel(model);

        //3. Duplicate check
        if (vehicleRepository.existsByModel(model)) {
            throw new RuntimeException("Vehicle with model '" + model + "' already exists");
        }

        //4. Mapping DTO -> Entity
        Vehicle vehicle = new Vehicle();
        vehicle.setModel(model);
        vehicle.setYearFrom(dto.getYearFrom());
        vehicle.setYearTo(dto.getYearTo());

        //5. Save
        Vehicle saved = vehicleRepository.save(vehicle);

        //6. Return DTO with ID
        return mapToDTO(saved);
    }

    @Override
    public VehicleDTO updateVehicle(Integer id, VehicleDTO vehicleDTO) {
        //1. Find existing vehicle
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle with id '" + id + "' not found"));

        //2. Validate
        if (vehicleDTO == null) {
            throw new RuntimeException("Vehicle data cannot be null");
        }

        //3. Update fields (only if provided)
        if (vehicleDTO.getModel() != null) {
            String model = vehicleDTO.getModel().trim();
            // Check duplicate for different vehicle
            if (!model.equals(existingVehicle.getModel()) &&
                    vehicleRepository.existsByModel(model)) {
                throw new RuntimeException("Vehicle with model '" + model + "' already exists");
            }
            existingVehicle.setModel(model);
        }

        if (vehicleDTO.getYearFrom() != null) {
            if (vehicleDTO.getYearFrom() < 0) {
                throw new RuntimeException("Year must be greater than or equal to 0");
            }
            existingVehicle.setYearFrom(vehicleDTO.getYearFrom());
        }

        if (vehicleDTO.getYearTo() != null) {
            existingVehicle.setYearTo(vehicleDTO.getYearTo());
        }

        //4. Save updated vehicle
        Vehicle updated = vehicleRepository.save(existingVehicle);

        //5. Return DTO
        return mapToDTO(updated);
    }

    @Override
    public void deleteVehicleById(Integer id) {
        // Check if vehicle exists
        if (!vehicleRepository.existsById(id)) {
            throw new RuntimeException("Vehicle with id '" + id + "' not found");
        }
        vehicleRepository.deleteById(id);
    }

    private VehicleDTO mapToDTO(Vehicle saved) {
        if (saved == null) {
            throw new RuntimeException("Vehicle cannot be null");
        }
        return VehicleDTO.builder()
                .vehicleId((Integer) saved.getId())  // FIXED: Removed unnecessary cast to Integer
                .model(saved.getModel())
                .yearFrom(saved.getYearFrom())
                .yearTo(saved.getYearTo())
                .build();
    }
}