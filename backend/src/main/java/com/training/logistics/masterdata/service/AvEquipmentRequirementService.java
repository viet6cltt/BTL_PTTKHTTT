package com.training.logistics.masterdata.service;

import com.training.logistics.common.exception.BadRequestException;
import com.training.logistics.common.exception.ConflictException;
import com.training.logistics.common.exception.ResourceNotFoundException;
import com.training.logistics.masterdata.dto.request.AvEquipmentRequirementRequest;
import com.training.logistics.masterdata.dto.response.AvEquipmentRequirementResponse;
import com.training.logistics.masterdata.model.AudioVisualEquipment;
import com.training.logistics.masterdata.model.AvEquipmentRequirement;
import com.training.logistics.masterdata.model.AvEquipmentRequirementId;
import com.training.logistics.masterdata.model.SeminarType;
import com.training.logistics.masterdata.repository.AudioVisualEquipmentRepository;
import com.training.logistics.masterdata.repository.AvEquipmentRequirementRepository;
import com.training.logistics.masterdata.repository.SeminarTypeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AvEquipmentRequirementService {

    private final AvEquipmentRequirementRepository requirementRepository;
    private final SeminarTypeRepository seminarTypeRepository;
    private final AudioVisualEquipmentRepository equipmentRepository;

    public AvEquipmentRequirementService(
            AvEquipmentRequirementRepository requirementRepository,
            SeminarTypeRepository seminarTypeRepository,
            AudioVisualEquipmentRepository equipmentRepository
    ) {
        this.requirementRepository = requirementRepository;
        this.seminarTypeRepository = seminarTypeRepository;
        this.equipmentRepository = equipmentRepository;
    }

    @Transactional(readOnly = true)
    public List<AvEquipmentRequirementResponse> getAllBySeminarType(Long seminarTypeId) {
        requireSeminarType(seminarTypeId);
        return requirementRepository.findBySeminarType_IdOrderByAudioVisualEquipment_EquipmentNameAsc(seminarTypeId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AvEquipmentRequirementResponse getById(Long seminarTypeId, Long equipmentId) {
        requireSeminarType(seminarTypeId);
        return toResponse(findEntity(seminarTypeId, equipmentId));
    }

    public AvEquipmentRequirementResponse create(Long seminarTypeId, AvEquipmentRequirementRequest request) {
        validateRequest(request);
        SeminarType seminarType = requireSeminarType(seminarTypeId);
        AudioVisualEquipment equipment = requireEquipment(request.equipmentId());
        if (requirementRepository.existsBySeminarType_IdAndAudioVisualEquipment_Id(seminarTypeId, request.equipmentId())) {
            throw new ConflictException("AV equipment requirement already exists for this seminar type");
        }

        AvEquipmentRequirement requirement = new AvEquipmentRequirement();
        requirement.setSeminarType(seminarType);
        requirement.setAudioVisualEquipment(equipment);
        requirement.setId(new AvEquipmentRequirementId(equipment.getId(), seminarType.getId()));
        applyRequest(requirement, request);
        return toResponse(requirementRepository.save(requirement));
    }

    public AvEquipmentRequirementResponse update(
            Long seminarTypeId,
            Long equipmentId,
            AvEquipmentRequirementRequest request
    ) {
        if (!equipmentId.equals(request.equipmentId())) {
            throw new BadRequestException("equipmentId in path and request body must match");
        }
        validateRequest(request);
        requireSeminarType(seminarTypeId);
        requireEquipment(equipmentId);

        AvEquipmentRequirement requirement = findEntity(seminarTypeId, equipmentId);
        applyRequest(requirement, request);
        return toResponse(requirementRepository.save(requirement));
    }

    public void delete(Long seminarTypeId, Long equipmentId) {
        requireSeminarType(seminarTypeId);
        AvEquipmentRequirement requirement = findEntity(seminarTypeId, equipmentId);
        requirementRepository.delete(requirement);
    }

    private AvEquipmentRequirement findEntity(Long seminarTypeId, Long equipmentId) {
        return requirementRepository.findById(new AvEquipmentRequirementId(equipmentId, seminarTypeId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "AV equipment requirement not found for seminarTypeId "
                                + seminarTypeId + " and equipmentId " + equipmentId
                ));
    }

    private SeminarType requireSeminarType(Long seminarTypeId) {
        return seminarTypeRepository.findById(seminarTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Seminar type not found: " + seminarTypeId));
    }

    private AudioVisualEquipment requireEquipment(Long equipmentId) {
        if (equipmentId == null) {
            throw new BadRequestException("equipmentId must not be null");
        }
        return equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Audio-visual equipment not found: " + equipmentId));
    }

    private void validateRequest(AvEquipmentRequirementRequest request) {
        MasterDataValidation.requirePositive(request.quantityRequired(), "quantityRequired");
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

    private void applyRequest(AvEquipmentRequirement requirement, AvEquipmentRequirementRequest request) {
        requirement.setQuantityRequired(request.quantityRequired());
        requirement.setDependOnNumParticipant(request.dependOnNumParticipant());
        requirement.setParticipantPerQuantity(request.participantPerQuantity());
    }

    private AvEquipmentRequirementResponse toResponse(AvEquipmentRequirement requirement) {
        AudioVisualEquipment equipment = requirement.getAudioVisualEquipment();
        return new AvEquipmentRequirementResponse(
                requirement.getSeminarType().getId(),
                equipment.getId(),
                equipment.getEquipmentName(),
                equipment.getEquipmentType(),
                equipment.getUnit(),
                requirement.getQuantityRequired(),
                requirement.getDependOnNumParticipant(),
                requirement.getParticipantPerQuantity()
        );
    }
}
