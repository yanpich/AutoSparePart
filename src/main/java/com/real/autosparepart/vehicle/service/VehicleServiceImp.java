package com.real.autosparepart.vehicle.service;

import com.real.autosparepart.user.entity.User;
import com.real.autosparepart.vehicle.dto.VehicleDTO;
import com.real.autosparepart.common.exception.BadRequestException;
import com.real.autosparepart.common.exception.DuplicateResourceException;
import com.real.autosparepart.common.exception.NotFoundException;
import com.real.autosparepart.vehicle.entity.Vehicle;
import com.real.autosparepart.vehicle.repository.VehicleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class VehicleServiceImp implements VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleServiceImp(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    private Integer getCurrentUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User) {
            return ((User) authentication.getPrincipal()).getUserId();
        }
        return null;
    }

    // ================= GET METHODS =================

    @Override
    public VehicleDTO getVehicleById(Integer id) {
        log.info("Fetching vehicle with ID: {}", id);
        Vehicle vehicle = vehicleRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + id));
        return mapToDTO(vehicle);
    }

    @Override
    public List<VehicleDTO> getAllVehicles(VehicleDTO dto) {
        log.info("Fetching all active vehicles with filters");
        List<Vehicle> vehicles;

        if (dto != null && hasFilters(dto)) {
            vehicles = vehicleRepository.findByFilters(
                    dto.getVehicleId(),
                    dto.getModel(),
                    dto.getYearFrom(),
                    dto.getYearTo()
            );
        } else {
            vehicles = vehicleRepository.findAllActive();
        }

        return vehicles.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleDTO> getAllActiveVehicles() {
        log.info("Fetching all active vehicles");
        return vehicleRepository.findAllActive().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleDTO> getAllDeletedVehicles() {
        log.info("Fetching all deleted vehicles");
        return vehicleRepository.findAllDeleted().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleDTO> searchVehicles(String keyword) {
        log.info("Searching vehicles with keyword: {}", keyword);
        return vehicleRepository.findAllActive().stream()
                .filter(v -> v.getModel().toLowerCase().contains(keyword.toLowerCase()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<VehicleDTO> getByYearRange(Integer yearFrom, Integer yearTo) {
        log.info("Fetching vehicles from year {} to {}", yearFrom, yearTo);
        return vehicleRepository.findAllActive().stream()
                .filter(v -> v.getYearFrom() != null && v.getYearFrom() >= yearFrom)
                .filter(v -> v.getYearTo() != null && v.getYearTo() <= yearTo)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getVehicleStats() {
        log.info("Getting vehicle statistics");
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", vehicleRepository.count());
        stats.put("active", vehicleRepository.findAllActive().size());
        stats.put("deleted", vehicleRepository.findAllDeleted().size());
        stats.put("withProducts", vehicleRepository.findAllActive().stream()
                .filter(v -> v.getProducts() != null && !v.getProducts().isEmpty())
                .count());
        return stats;
    }

    private boolean hasFilters(VehicleDTO dto) {
        return dto.getVehicleId() != null ||
                StringUtils.hasText(dto.getModel()) ||
                dto.getYearFrom() != null ||
                dto.getYearTo() != null;
    }

    // ================= CREATE =================

    @Override
    @Transactional
    public VehicleDTO createVehicle(VehicleDTO dto) {
        log.info("Creating new vehicle with model: {}", dto.getModel());

        if (dto == null) {
            throw new BadRequestException("Vehicle request cannot be null");
        }

        if (!StringUtils.hasText(dto.getModel())) {
            throw new BadRequestException("Model is required");
        }

        String model = dto.getModel().trim();

        // Check if model already exists (including deleted)
        if (vehicleRepository.existsByModel(model)) {
            throw new DuplicateResourceException("Vehicle already exists with model: " + model);
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setModel(model);
        vehicle.setYearFrom(dto.getYearFrom());
        vehicle.setYearTo(dto.getYearTo());
        vehicle.setDeleted(false);
        vehicle.setCreatedAt(LocalDateTime.now());

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Vehicle created successfully with ID: {}", saved.getVehicleId());

        return mapToDTO(saved);
    }

    // ================= UPDATE =================

    @Override
    @Transactional
    public VehicleDTO updateVehicle(Integer id, VehicleDTO dto) {
        log.info("Updating vehicle with ID: {}", id);

        Vehicle existing = vehicleRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + id));

        if (dto == null) {
            throw new BadRequestException("Vehicle data cannot be null");
        }

        if (StringUtils.hasText(dto.getModel())) {
            String model = dto.getModel().trim();

            if (!model.equals(existing.getModel()) && vehicleRepository.existsByModel(model)) {
                throw new DuplicateResourceException("Vehicle already exists with model: " + model);
            }
            existing.setModel(model);
        }

        if (dto.getYearFrom() != null) {
            existing.setYearFrom(dto.getYearFrom());
        }

        if (dto.getYearTo() != null) {
            existing.setYearTo(dto.getYearTo());
        }

        existing.setUpdatedAt(LocalDateTime.now());
        Vehicle updated = vehicleRepository.save(existing);
        log.info("Vehicle updated successfully: {}", updated.getVehicleId());

        return mapToDTO(updated);
    }

    @Override
    @Transactional
    public VehicleDTO patchVehicle(Integer id, VehicleDTO dto) {
        log.info("Patching vehicle with ID: {}", id);

        Vehicle existing = vehicleRepository.findByIdAndNotDeleted(id)
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + id));

        if (dto == null) {
            throw new BadRequestException("Vehicle data cannot be null");
        }

        if (StringUtils.hasText(dto.getModel())) {
            String model = dto.getModel().trim();
            if (!model.equals(existing.getModel()) && vehicleRepository.existsByModel(model)) {
                throw new DuplicateResourceException("Vehicle already exists with model: " + model);
            }
            existing.setModel(model);
        }

        if (dto.getYearFrom() != null) {
            existing.setYearFrom(dto.getYearFrom());
        }

        if (dto.getYearTo() != null) {
            existing.setYearTo(dto.getYearTo());
        }

        existing.setUpdatedAt(LocalDateTime.now());
        Vehicle updated = vehicleRepository.save(existing);
        log.info("Vehicle patched successfully: {}", updated.getVehicleId());

        return mapToDTO(updated);
    }

    // ================= SOFT DELETE METHODS =================

    @Override
    @Transactional
    public void softDeleteVehicle(Integer id) {
        log.info("Soft deleting vehicle with ID: {}", id);

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + id));

        // Check if vehicle has associated products
        if (vehicle.getProducts() != null && !vehicle.getProducts().isEmpty()) {
            throw new BadRequestException("Cannot delete vehicle with associated products. Please remove or reassign products first.");
        }

        Integer currentUserId = getCurrentUserId();
        int deleted = vehicleRepository.softDelete(id, currentUserId);

        if (deleted == 0) {
            throw new NotFoundException("Vehicle not found with id: " + id);
        }

        log.info("Vehicle soft deleted successfully: {}", id);
    }

    @Override
    @Transactional
    public void restoreVehicle(Integer id) {
        log.info("Restoring vehicle with ID: {}", id);

        int restored = vehicleRepository.restore(id);

        if (restored == 0) {
            throw new NotFoundException("Vehicle not found or already active");
        }

        log.info("Vehicle restored successfully: {}", id);
    }

    @Override
    @Transactional
    public void hardDeleteVehicle(Integer id) {
        log.warn("Permanently deleting vehicle with ID: {}", id);

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + id));

        // Check if vehicle has associated products
        if (vehicle.getProducts() != null && !vehicle.getProducts().isEmpty()) {
            throw new BadRequestException("Cannot permanently delete vehicle with associated products. Please remove or reassign products first.");
        }

        int deleted = vehicleRepository.hardDelete(id);

        if (deleted == 0) {
            throw new NotFoundException("Vehicle not found");
        }

        log.info("Vehicle permanently deleted: {}", id);
    }

    @Override
    public void deleteVehicleById(Integer id) {
        softDeleteVehicle(id);
    }

    // ================= MAPPER =================

    private VehicleDTO mapToDTO(Vehicle v) {
        if (v == null) {
            return null;
        }

        return VehicleDTO.builder()
                .vehicleId(v.getVehicleId())
                .model(v.getModel())
                .yearFrom(v.getYearFrom())
                .yearTo(v.getYearTo())
                .status(v.isDeleted() ? "deleted" : "active")
                .productCount(v.getProducts() != null ? v.getProducts().size() : 0)
                .createdAt(v.getCreatedAt() != null ? v.getCreatedAt().toString() : null)
                .updatedAt(v.getUpdatedAt() != null ? v.getUpdatedAt().toString() : null)
                .build();
    }
}