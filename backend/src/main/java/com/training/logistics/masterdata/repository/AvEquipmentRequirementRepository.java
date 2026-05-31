package com.training.logistics.masterdata.repository;

import com.training.logistics.masterdata.model.AvEquipmentRequirement;
import com.training.logistics.masterdata.model.AvEquipmentRequirementId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvEquipmentRequirementRepository
        extends JpaRepository<AvEquipmentRequirement, AvEquipmentRequirementId> {

    List<AvEquipmentRequirement> findBySeminarType_IdOrderByAudioVisualEquipment_EquipmentNameAsc(Long seminarTypeId);

    boolean existsBySeminarType_Id(Long seminarTypeId);

    boolean existsByAudioVisualEquipment_Id(Long equipmentId);

    boolean existsBySeminarType_IdAndAudioVisualEquipment_Id(Long seminarTypeId, Long equipmentId);
}
