package com.real.autosparepart.controller;

import com.real.autosparepart.dto.VehicleDTO;
import com.real.autosparepart.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping
    public ResponseEntity<VehicleDTO> createVehicle(@Valid @RequestBody VehicleDTO dto) {
        VehicleDTO saved = vehicleService.createVehicle(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleDTO> getVehicleById(@PathVariable Integer id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));

    }

    // Retrieve all vehicles with optional filtering (vehicleId, model, year range)
    @GetMapping
    public ResponseEntity<List<VehicleDTO>> getAllVehicles(
            @RequestParam(required = false) Integer vehicleId,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) Integer yearFrom,
            @RequestParam(required = false) Integer yearTo) {

        // Build filter DTO if any parameters are provided
        VehicleDTO filter = null;
        if (vehicleId != null || model != null || yearFrom != null || yearTo != null) {
            filter = VehicleDTO.builder()
                    .vehicleId(vehicleId)
                    .model(model)
                    .yearFrom(yearFrom)
                    .yearTo(yearTo)
                    .build();
        }
        List<VehicleDTO> vehicles = vehicleService.getAllVehicles(filter);
        return ResponseEntity.status(HttpStatus.OK).body(vehicles);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleDTO> updateVehicle(
            @PathVariable Integer id,
            @Valid @RequestBody VehicleDTO dto) {

        // Optional: Ensure the ID in the path matches the ID in the body
        if (dto.getVehicleId() != null && !dto.getVehicleId().equals(id)) {
            throw new IllegalArgumentException("ID mismatch");
        }

        VehicleDTO updated = vehicleService.updateVehicle(id, dto);
        return ResponseEntity.status(HttpStatus.OK).body(updated);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<VehicleDTO> patchVehicle(
            @PathVariable Integer id,
            @RequestBody VehicleDTO dto) {
        VehicleDTO updated = vehicleService.updateVehicle(id, dto);
        return ResponseEntity.status(HttpStatus.OK).body(updated);
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Integer id) {
        vehicleService.deleteVehicleById(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}