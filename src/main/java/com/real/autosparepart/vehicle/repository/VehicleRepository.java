package com.real.autosparepart.vehicle.repository;

import com.real.autosparepart.vehicle.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {

    boolean existsByModel(String model);

    // Soft Delete queries
    @Query("SELECT v FROM Vehicle v WHERE v.deleted = false OR v.deleted IS NULL")
    List<Vehicle> findAllActive();

    @Query("SELECT v FROM Vehicle v WHERE v.deleted = true")
    List<Vehicle> findAllDeleted();

    @Query("SELECT v FROM Vehicle v WHERE v.vehicleId = :id AND (v.deleted = false OR v.deleted IS NULL)")
    Optional<Vehicle> findByIdAndNotDeleted(@Param("id") Integer id);

    @Query("SELECT v FROM Vehicle v WHERE v.model = :model AND (v.deleted = false OR v.deleted IS NULL)")
    Optional<Vehicle> findByModelAndNotDeleted(@Param("model") String model);

    @Query("SELECT v FROM Vehicle v WHERE " +
            "(:id IS NULL OR v.vehicleId = :id) AND " +
            "(:model IS NULL OR LOWER(v.model) LIKE LOWER(CONCAT('%', :model, '%'))) AND " +
            "(:yearFrom IS NULL OR v.yearFrom >= :yearFrom) AND " +
            "(:yearTo IS NULL OR v.yearTo <= :yearTo) AND " +
            "(v.deleted = false OR v.deleted IS NULL)")
    List<Vehicle> findByFilters(@Param("id") Integer id,
                                @Param("model") String model,
                                @Param("yearFrom") Integer yearFrom,
                                @Param("yearTo") Integer yearTo);

    // Soft Delete operations
    @Modifying
    @Transactional
    @Query("UPDATE Vehicle v SET v.deleted = true, v.deletedAt = CURRENT_TIMESTAMP, v.deletedBy = :deletedBy WHERE v.vehicleId = :id")
    int softDelete(@Param("id") Integer id, @Param("deletedBy") Integer deletedBy);

    @Modifying
    @Transactional
    @Query("UPDATE Vehicle v SET v.deleted = false, v.deletedAt = null, v.deletedBy = null WHERE v.vehicleId = :id")
    int restore(@Param("id") Integer id);

    @Modifying
    @Transactional
    @Query("DELETE FROM Vehicle v WHERE v.vehicleId = :id")
    int hardDelete(@Param("id") Integer id);
}