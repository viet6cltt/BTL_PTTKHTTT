package com.training.logistics.facility_contract.repository;

import com.training.logistics.facility_contract.model.SeminarFacilityContract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface SeminarFacilityContractRepository extends JpaRepository<SeminarFacilityContract, Long> {
    Optional<SeminarFacilityContract> findBySeminarId(Long seminarId);

    boolean existsBySeminarId(Long seminarId);

    boolean existsBySeminarIdAndStatusIn(Long seminarId, Collection<com.training.logistics.facility_contract.model.ContractStatus> statuses);

    List<SeminarFacilityContract> findByFacilityFacilityIdAndStatusIn(Long facilityId, Collection<com.training.logistics.facility_contract.model.ContractStatus> statuses);
}
