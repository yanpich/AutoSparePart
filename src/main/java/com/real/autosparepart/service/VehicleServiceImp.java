package com.real.autosparepart.service;

import com.real.autosparepart.dto.VehicleDTO;
import com.real.autosparepart.exception.BadRequestException;
import com.real.autosparepart.exception.DuplicateResourceException;
import com.real.autosparepart.exception.NotFoundException;
import com.real.autosparepart.model.Vehicle;
import com.real.autosparepart.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;
@Service
public class VehicleServiceImp implements VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleServiceImp(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    // ================= GET BY ID =================
    @Override
    public VehicleDTO getVehicleById(Integer id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + id));

        return mapToDTO(vehicle);
    }

    // ================= GET ALL =================
    @Override
    public List<VehicleDTO> getAllVehicles(VehicleDTO dto) {

        List<Vehicle> vehicles;

        if (dto != null && hasFilters(dto)) {
            vehicles = vehicleRepository.findByFilters(
                    dto.getVehicleId(),
                    dto.getModel(),
                    dto.getYearFrom(),
                    dto.getYearTo()
            );
        } else {
            vehicles = vehicleRepository.findAll();
        }

        return vehicles.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private boolean hasFilters(VehicleDTO dto) {
        return dto.getVehicleId() != null ||
                StringUtils.hasText(dto.getModel()) ||
                dto.getYearFrom() != null ||
                dto.getYearTo() != null;
    }

    // ================= CREATE =================
    @Override
    public VehicleDTO createVehicle(VehicleDTO dto) {

        if (dto == null) {
            throw new BadRequestException("Vehicle request cannot be null");
        }

        if (!StringUtils.hasText(dto.getModel())) {
            throw new BadRequestException("Model is required");
        }

        if (dto.getYearFrom() == null) {
            throw new BadRequestException("YearFrom is required");
        }

        if (dto.getYearFrom() < 0 || dto.getYearFrom() > 9999) {
            throw new BadRequestException("YearFrom must be between 0 and 9999");
        }

        if (dto.getYearTo() != null && dto.getYearTo() < dto.getYearFrom()) {
            throw new BadRequestException("YearTo must be >= YearFrom");
        }

        String model = dto.getModel().trim();

        if (vehicleRepository.existsByModel(model)) {
            throw new DuplicateResourceException("Vehicle already exists with model: " + model);
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setModel(model);
        vehicle.setYearFrom(dto.getYearFrom());
        vehicle.setYearTo(dto.getYearTo());

        Vehicle saved = vehicleRepository.save(vehicle);

        return mapToDTO(saved);
    }

    // ================= UPDATE =================
    @Override
    public VehicleDTO updateVehicle(Integer id, VehicleDTO dto) {

        Vehicle existing = vehicleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + id));

        if (dto == null) {
            throw new BadRequestException("Vehicle data cannot be null");
        }

        if (StringUtils.hasText(dto.getModel())) {
            String model = dto.getModel().trim();

            if (!model.equals(existing.getModel())
                    && vehicleRepository.existsByModel(model)) {
                throw new DuplicateResourceException("Vehicle already exists with model: " + model);
            }

            existing.setModel(model);
        }

        if (dto.getYearFrom() != null) {
            if (dto.getYearFrom() < 0 || dto.getYearFrom() > 9999) {
                throw new BadRequestException("YearFrom must be between 0 and 9999");
            }
            existing.setYearFrom(dto.getYearFrom());
        }

        if (dto.getYearTo() != null) {
            if (dto.getYearTo() < existing.getYearFrom()) {
                throw new BadRequestException("YearTo must be >= YearFrom");
            }
            existing.setYearTo(dto.getYearTo());
        }

        Vehicle updated = vehicleRepository.save(existing);

        return mapToDTO(updated);
    }

    @Override
    public VehicleDTO patchVehicle(Integer id, VehicleDTO dto) {
        Vehicle existing =  vehicleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id: " + id));
        if (dto == null) {
            throw new BadRequestException("Vehicle data cannot be null");
        }
        if (StringUtils.hasText(dto.getModel())) {
            String model = dto.getModel().trim();

            if (!model.equals(existing.getModel())
            && vehicleRepository.existsByModel(model)) {
                throw new DuplicateResourceException("Vehicle already exists with model: " + model);
            }
            existing.setModel(model);
        }
        if (dto.getYearFrom() != null) {
            if (dto.getYearFrom() < 0 || dto.getYearFrom() > 9999) {
                throw new BadRequestException("YearFrom must be between 0 and 9999");
            }
            existing.setYearFrom(dto.getYearFrom());
        }
        if (dto.getYearTo() != null) {
            if (dto.getYearTo() < existing.getYearFrom()) {
                throw new BadRequestException("YearTo must be >= YearFrom");
            }
            existing.setYearTo(dto.getYearTo());
        }
        Vehicle updated = vehicleRepository.save(existing);
        return mapToDTO(updated);
    }

    // ================= DELETE =================
    @Override
    public void deleteVehicleById(Integer id) {

        if (!vehicleRepository.existsById(id)) {
            throw new NotFoundException("Vehicle not found with id: " + id);
        }

        vehicleRepository.deleteById(id);
    }

    // ================= MAPPER =================
    private VehicleDTO mapToDTO(Vehicle v) {

        if (v == null) {
            throw new BadRequestException("Vehicle cannot be null");
        }

        return VehicleDTO.builder()
                .vehicleId((Integer) v.getId())
                .model(v.getModel())
                .yearFrom(v.getYearFrom())
                .yearTo(v.getYearTo())
                .build();
    }
}