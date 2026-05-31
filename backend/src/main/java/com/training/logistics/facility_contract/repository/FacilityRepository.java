package com.training.logistics.facility_contract.repository;

import com.training.logistics.facility_contract.model.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface FacilityRepository extends JpaRepository<Facility, Long>, JpaSpecificationExecutor<Facility> {
    List<Facility> findByCityContainingIgnoreCase(String city);

    List<Facility> findByFacilityNameContainingIgnoreCase(String name);

    List<Facility> findByCityContainingIgnoreCaseAndFacilityNameContainingIgnoreCase(String city, String name);
}
