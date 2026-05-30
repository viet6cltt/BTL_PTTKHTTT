package com.training.logistics.facility_contract.service;

import com.training.logistics.facility_contract.dto.AvEquipmentRequirementRequest;
import com.training.logistics.facility_contract.dto.AvEquipmentRequirementResponse;
import com.training.logistics.facility_contract.exception.FacilityContractNotFoundException;
import com.training.logistics.facility_contract.exception.InvalidFacilityContractRequestException;
import com.training.logistics.facility_contract.mapper.FacilityContractMapper;
import com.training.logistics.facility_contract.model.AudioVisualEquipment;
import com.training.logistics.facility_contract.model.AvEquipmentRequirement;
import com.training.logistics.facility_contract.model.AvEquipmentRequirementId;
import com.training.logistics.facility_contract.repository.AvEquipmentRequirementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvEquipmentRequirementService {
    private final AvEquipmentRequirementRepository requirementRepository;
    private final AvEquipmentService equipmentService;

    @Transactional
    public AvEquipmentRequirementResponse createRequirement(AvEquipmentRequirementRequest request) {
        validateParticipantRule(request);
        AudioVisualEquipment equipment = equipmentService.findEquipment(request.getEquipmentId());
        AvEquipmentRequirement requirement = AvEquipmentRequirement.builder()
                .seminarTypeId(request.getSeminarTypeId())
                .equipment(equipment)
                .build();
        applyRequirementRequest(requirement, request);
        return FacilityContractMapper.toRequirementResponse(requirementRepository.save(requirement));
    }

    @Transactional
    public AvEquipmentRequirementResponse updateRequirement(Long seminarTypeId, Long equipmentId, AvEquipmentRequirementRequest request) {
        validateParticipantRule(request);
        AvEquipmentRequirement requirement = findRequirement(seminarTypeId, equipmentId);
        applyRequirementRequest(requirement, request);
        return FacilityContractMapper.toRequirementResponse(requirement);
    }

    @Transactional
    public void deleteRequirement(Long seminarTypeId, Long equipmentId) {
        requirementRepository.delete(findRequirement(seminarTypeId, equipmentId));
    }

    @Transactional(readOnly = true)
    public List<AvEquipmentRequirementResponse> getRequirementsBySeminarType(Long seminarTypeId) {
        return requirementRepository.findBySeminarTypeId(seminarTypeId).stream()
                .map(FacilityContractMapper::toRequirementResponse)
                .toList();
    }

    private AvEquipmentRequirement findRequirement(Long seminarTypeId, Long equipmentId) {
        return requirementRepository.findById(new AvEquipmentRequirementId(seminarTypeId, equipmentId))
                .orElseThrow(() -> new FacilityContractNotFoundException("AV equipment requirement not found"));
    }

    private void applyRequirementRequest(AvEquipmentRequirement requirement, AvEquipmentRequirementRequest request) {
        requirement.setQuantityRequired(request.getQuantityRequired());
        requirement.setIsDependOnNumParticipant(Boolean.TRUE.equals(request.getIsDependOnNumParticipant()));
        requirement.setParticipantPerQuantity(request.getParticipantPerQuantity());
    }

    private void validateParticipantRule(AvEquipmentRequirementRequest request) {
        if (Boolean.TRUE.equals(request.getIsDependOnNumParticipant()) && request.getParticipantPerQuantity() == null) {
            throw new InvalidFacilityContractRequestException("participantPerQuantity is required when requirement depends on participants");
        }
    }
}
