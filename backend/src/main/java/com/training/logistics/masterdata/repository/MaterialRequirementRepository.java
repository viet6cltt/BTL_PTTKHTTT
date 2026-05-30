package com.training.logistics.masterdata.repository;

import com.training.logistics.masterdata.model.MaterialRequirement;
import com.training.logistics.masterdata.model.MaterialRequirementId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRequirementRepository extends JpaRepository<MaterialRequirement, MaterialRequirementId> {

    List<MaterialRequirement> findBySeminarType_IdOrderByMaterial_MaterialNameAsc(Long seminarTypeId);

    boolean existsBySeminarType_Id(Long seminarTypeId);

    boolean existsByMaterial_Id(Long materialId);

    boolean existsBySeminarType_IdAndMaterial_Id(Long seminarTypeId, Long materialId);
}
