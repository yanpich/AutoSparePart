package com.real.autosparepart.repository;

import com.real.autosparepart.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle,Integer> {
    boolean existsByModel(String model);

    @Query("SELECT v FROM Vehicle v WHERE " +
            "(:id IS NULL OR v.id = :id) AND " +
            "(:model IS NULL OR LOWER(v.model) LIKE LOWER(CONCAT('%', :model, '%'))) AND " +
            "(:yearFrom IS NULL OR v.yearFrom >= :yearFrom) AND " +
            "(:yearTo IS NULL OR v.yearTo <= :yearTo)")
    List<Vehicle> findByFilters(@Param("id") Integer id,
                                @Param("model") String model,
                                @Param("yearFrom") Integer yearFrom,
                                @Param("yearTo") Integer yearTo);
}
