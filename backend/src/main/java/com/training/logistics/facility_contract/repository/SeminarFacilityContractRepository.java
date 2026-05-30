package com.training.logistics.facility_contract.repository;

import com.training.logistics.facility_contract.model.SeminarFacilityContract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SeminarFacilityContractRepository extends JpaRepository<SeminarFacilityContract, Long> {
    Optional<SeminarFacilityContract> findBySeminarId(Long seminarId);

    boolean existsBySeminarId(Long seminarId);
}
