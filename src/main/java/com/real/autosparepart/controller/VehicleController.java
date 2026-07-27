package com.real.autosparepart.controller;

import com.real.autosparepart.dto.VehicleDTO;
import com.real.autosparepart.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/vehicles")
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    // ==================== SPECIFIC PATHS (MUST COME FIRST) ====================

    @GetMapping("/deleted")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDeletedVehicles() {
        try {
            List<VehicleDTO> vehicles = vehicleService.getAllDeletedVehicles();
            Map<String, Object> response = new HashMap<>();
            response.put("content", vehicles);
            response.put("total", vehicles.size());
            response.put("type", "deleted");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getStats() {
        try {
            Map<String, Object> stats = vehicleService.getVehicleStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> searchVehicles(@RequestParam("q") String keyword) {
        try {
            List<VehicleDTO> vehicles = vehicleService.searchVehicles(keyword);
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== CRUD ENDPOINTS ====================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getAllVehicles(
            @RequestParam(required = false) Integer vehicleId,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) Integer yearFrom,
            @RequestParam(required = false) Integer yearTo) {

        try {
            VehicleDTO filter = VehicleDTO.builder()
                    .vehicleId(vehicleId)
                    .model(model)
                    .yearFrom(yearFrom)
                    .yearTo(yearTo)
                    .build();

            List<VehicleDTO> vehicles = vehicleService.getAllVehicles(filter);
            Map<String, Object> response = new HashMap<>();
            response.put("content", vehicles);
            response.put("total", vehicles.size());
            response.put("type", "active");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<?> getVehicleById(@PathVariable Integer id) {
        try {
            VehicleDTO vehicle = vehicleService.getVehicleById(id);
            return ResponseEntity.ok(vehicle);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createVehicle(@Valid @RequestBody VehicleDTO dto) {
        try {
            VehicleDTO created = vehicleService.createVehicle(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateVehicle(@PathVariable Integer id, @Valid @RequestBody VehicleDTO dto) {
        try {
            VehicleDTO updated = vehicleService.updateVehicle(id, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> patchVehicle(@PathVariable Integer id, @RequestBody VehicleDTO dto) {
        try {
            VehicleDTO patched = vehicleService.patchVehicle(id, dto);
            return ResponseEntity.ok(patched);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> softDeleteVehicle(@PathVariable Integer id) {
        try {
            vehicleService.softDeleteVehicle(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Vehicle deleted successfully",
                    "vehicleId", id,
                    "status", "deleted"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> restoreVehicle(@PathVariable Integer id) {
        try {
            vehicleService.restoreVehicle(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Vehicle restored successfully",
                    "vehicleId", id,
                    "status", "active"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/permanent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> hardDeleteVehicle(@PathVariable Integer id) {
        try {
            vehicleService.hardDeleteVehicle(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Vehicle permanently deleted",
                    "vehicleId", id
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}