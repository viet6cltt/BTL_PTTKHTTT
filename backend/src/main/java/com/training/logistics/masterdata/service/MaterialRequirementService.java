package com.training.logistics.masterdata.service;

import com.training.logistics.common.exception.BadRequestException;
import com.training.logistics.common.exception.ConflictException;
import com.training.logistics.common.exception.ResourceNotFoundException;
import com.training.logistics.masterdata.dto.request.MaterialRequirementRequest;
import com.training.logistics.masterdata.dto.response.MaterialRequirementResponse;
import com.training.logistics.masterdata.model.Material;
import com.training.logistics.masterdata.model.MaterialRequirement;
import com.training.logistics.masterdata.model.MaterialRequirementId;
import com.training.logistics.masterdata.model.SeminarType;
import com.training.logistics.masterdata.repository.MaterialRepository;
import com.training.logistics.masterdata.repository.MaterialRequirementRepository;
import com.training.logistics.masterdata.repository.SeminarTypeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MaterialRequirementService {

    private final MaterialRequirementRepository requirementRepository;
    private final SeminarTypeRepository seminarTypeRepository;
    private final MaterialRepository materialRepository;

    public MaterialRequirementService(
            MaterialRequirementRepository requirementRepository,
            SeminarTypeRepository seminarTypeRepository,
            MaterialRepository materialRepository
    ) {
        this.requirementRepository = requirementRepository;
        this.seminarTypeRepository = seminarTypeRepository;
        this.materialRepository = materialRepository;
    }

    @Transactional(readOnly = true)
    public List<MaterialRequirementResponse> getAllBySeminarType(Long seminarTypeId) {
        requireSeminarType(seminarTypeId);
        return requirementRepository.findBySeminarType_IdOrderByMaterial_MaterialNameAsc(seminarTypeId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MaterialRequirementResponse getById(Long seminarTypeId, Long materialId) {
        requireSeminarType(seminarTypeId);
        return toResponse(findEntity(seminarTypeId, materialId));
    }

    public MaterialRequirementResponse create(Long seminarTypeId, MaterialRequirementRequest request) {
        validateRequest(request);
        SeminarType seminarType = requireSeminarType(seminarTypeId);
        Material material = requireMaterial(request.materialId());
        if (requirementRepository.existsBySeminarType_IdAndMaterial_Id(seminarTypeId, request.materialId())) {
            throw new ConflictException("Material requirement already exists for this seminar type");
        }

        MaterialRequirement requirement = new MaterialRequirement();
        requirement.setSeminarType(seminarType);
        requirement.setMaterial(material);
        requirement.setId(new MaterialRequirementId(seminarType.getId(), material.getId()));
        applyRequest(requirement, request);
        return toResponse(requirementRepository.save(requirement));
    }

    public MaterialRequirementResponse update(Long seminarTypeId, Long materialId, MaterialRequirementRequest request) {
        if (!materialId.equals(request.materialId())) {
            throw new BadRequestException("materialId in path and request body must match");
        }
        validateRequest(request);
        requireSeminarType(seminarTypeId);
        requireMaterial(materialId);

        MaterialRequirement requirement = findEntity(seminarTypeId, materialId);
        applyRequest(requirement, request);
        return toResponse(requirementRepository.save(requirement));
    }

    public void delete(Long seminarTypeId, Long materialId) {
        requireSeminarType(seminarTypeId);
        MaterialRequirement requirement = findEntity(seminarTypeId, materialId);
        requirementRepository.delete(requirement);
    }

    private MaterialRequirement findEntity(Long seminarTypeId, Long materialId) {
        return requirementRepository.findById(new MaterialRequirementId(seminarTypeId, materialId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Material requirement not found for seminarTypeId "
                                + seminarTypeId + " and materialId " + materialId
                ));
    }

    private SeminarType requireSeminarType(Long seminarTypeId) {
        return seminarTypeRepository.findById(seminarTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Seminar type not found: " + seminarTypeId));
    }

    private Material requireMaterial(Long materialId) {
        if (materialId == null) {
            throw new BadRequestException("materialId must not be null");
        }
        return materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found: " + materialId));
    }

    private void validateRequest(MaterialRequirementRequest request) {
        MasterDataValidation.requirePositive(request.defaultQuantity(), "defaultQuantity");
        validateParticipantRule(
                MasterDataValidation.requireBoolean(request.dependOnNumParticipant(), "dependOnNumParticipant"),
                request.participantPerQuantity()
        );
    }

    private void validateParticipantRule(Boolean dependOnNumParticipant, Integer participantPerQuantity) {
        if (Boolean.TRUE.equals(dependOnNumParticipant)
                && (participantPerQuantity == null || participantPerQuantity <= 0)) {
            throw new BadRequestException("participantPerQuantity must be positive when dependOnNumParticipant is true");
        }
        if (Boolean.FALSE.equals(dependOnNumParticipant) && participantPerQuantity != null) {
            throw new BadRequestException("participantPerQuantity must be null when dependOnNumParticipant is false");
        }
    }

    private void applyRequest(MaterialRequirement requirement, MaterialRequirementRequest request) {
        requirement.setDefaultQuantity(request.defaultQuantity());
        requirement.setDependOnNumParticipant(request.dependOnNumParticipant());
        requirement.setParticipantPerQuantity(request.participantPerQuantity());
        requirement.setNotes(request.notes());
    }

    private MaterialRequirementResponse toResponse(MaterialRequirement requirement) {
        Material material = requirement.getMaterial();
        return new MaterialRequirementResponse(
                requirement.getSeminarType().getId(),
                material.getId(),
                material.getMaterialName(),
                material.getMaterialType(),
                material.getUnit(),
                requirement.getDefaultQuantity(),
                requirement.getDependOnNumParticipant(),
                requirement.getParticipantPerQuantity(),
                requirement.getNotes()
        );
    }
}
