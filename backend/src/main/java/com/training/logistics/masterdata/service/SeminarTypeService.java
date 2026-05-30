package com.training.logistics.masterdata.service;

import com.training.logistics.common.exception.ConflictException;
import com.training.logistics.common.exception.ResourceNotFoundException;
import com.training.logistics.masterdata.dto.request.SeminarTypeRequest;
import com.training.logistics.masterdata.dto.response.SeminarTypeResponse;
import com.training.logistics.masterdata.model.SeminarType;
import com.training.logistics.masterdata.repository.AvEquipmentRequirementRepository;
import com.training.logistics.masterdata.repository.MaterialRequirementRepository;
import com.training.logistics.masterdata.repository.SeminarTypeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SeminarTypeService {

    private final SeminarTypeRepository seminarTypeRepository;
    private final MaterialRequirementRepository materialRequirementRepository;
    private final AvEquipmentRequirementRepository avEquipmentRequirementRepository;

    public SeminarTypeService(
            SeminarTypeRepository seminarTypeRepository,
            MaterialRequirementRepository materialRequirementRepository,
            AvEquipmentRequirementRepository avEquipmentRequirementRepository
    ) {
        this.seminarTypeRepository = seminarTypeRepository;
        this.materialRequirementRepository = materialRequirementRepository;
        this.avEquipmentRequirementRepository = avEquipmentRequirementRepository;
    }

    @Transactional(readOnly = true)
    public List<SeminarTypeResponse> getAll() {
        return seminarTypeRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SeminarTypeResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    public SeminarTypeResponse create(SeminarTypeRequest request) {
        SeminarType seminarType = new SeminarType();
        applyRequest(seminarType, request);
        return toResponse(seminarTypeRepository.save(seminarType));
    }

    public SeminarTypeResponse update(Long id, SeminarTypeRequest request) {
        SeminarType seminarType = findEntity(id);
        applyRequest(seminarType, request);
        return toResponse(seminarTypeRepository.save(seminarType));
    }

    public void delete(Long id) {
        SeminarType seminarType = findEntity(id);
        if (materialRequirementRepository.existsBySeminarType_Id(id)
                || avEquipmentRequirementRepository.existsBySeminarType_Id(id)) {
            throw new ConflictException("Seminar type is still referenced by requirements");
        }
        seminarTypeRepository.delete(seminarType);
    }

    private SeminarType findEntity(Long id) {
        return seminarTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seminar type not found: " + id));
    }

    private void applyRequest(SeminarType seminarType, SeminarTypeRequest request) {
        seminarType.setTypeName(MasterDataValidation.requireNotBlank(request.typeName(), "typeName"));
        seminarType.setDescription(request.description());
        seminarType.setDurationHours(MasterDataValidation.requirePositive(request.durationHours(), "durationHours"));
        seminarType.setArrangementNotes(request.arrangementNotes());
    }

    private SeminarTypeResponse toResponse(SeminarType seminarType) {
        return new SeminarTypeResponse(
                seminarType.getId(),
                seminarType.getTypeName(),
                seminarType.getDescription(),
                seminarType.getDurationHours(),
                seminarType.getArrangementNotes()
        );
    }
}
