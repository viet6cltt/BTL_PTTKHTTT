package com.training.logistics.facility_contract.repository;

import com.training.logistics.facility_contract.model.AvEquipmentRequirement;
import com.training.logistics.facility_contract.model.AvEquipmentRequirementId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvEquipmentRequirementRepository extends JpaRepository<AvEquipmentRequirement, AvEquipmentRequirementId> {
    List<AvEquipmentRequirement> findBySeminarTypeId(Long seminarTypeId);
}
