package com.training.logistics.seminar.service;

import com.training.logistics.auth.model.User;
import com.training.logistics.auth.repository.UserRepository;
import com.training.logistics.common.exception.ResourceNotFoundException;
import com.training.logistics.masterdata.model.AudioVisualEquipment;
import com.training.logistics.masterdata.model.AvEquipmentRequirement;
import com.training.logistics.masterdata.model.Material;
import com.training.logistics.masterdata.model.MaterialRequirement;
import com.training.logistics.masterdata.model.SeminarType;
import com.training.logistics.masterdata.repository.AvEquipmentRequirementRepository;
import com.training.logistics.masterdata.repository.MaterialRequirementRepository;
import com.training.logistics.masterdata.repository.SeminarTypeRepository;
import com.training.logistics.seminar.dto.request.SeminarCreateRequest;
import com.training.logistics.seminar.dto.request.SeminarUpdateRequest;
import com.training.logistics.seminar.dto.response.CalculatedAvEquipmentRequirementResponse;
import com.training.logistics.seminar.dto.response.CalculatedMaterialRequirementResponse;
import com.training.logistics.seminar.dto.response.SeminarRequirementsPreviewResponse;
import com.training.logistics.seminar.dto.response.SeminarResponse;
import com.training.logistics.seminar.model.Consultant;
import com.training.logistics.seminar.model.Seminar;
import com.training.logistics.seminar.repository.ConsultantRepository;
import com.training.logistics.seminar.repository.SeminarRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SeminarService {

    private final SeminarRepository seminarRepository;
    private final SeminarTypeRepository seminarTypeRepository;
    private final ConsultantRepository consultantRepository;
    private final UserRepository userRepository;
    private final MaterialRequirementRepository materialRequirementRepository;
    private final AvEquipmentRequirementRepository avEquipmentRequirementRepository;

    public SeminarService(
            SeminarRepository seminarRepository,
            SeminarTypeRepository seminarTypeRepository,
            ConsultantRepository consultantRepository,
            UserRepository userRepository,
            MaterialRequirementRepository materialRequirementRepository,
            AvEquipmentRequirementRepository avEquipmentRequirementRepository
    ) {
        this.seminarRepository = seminarRepository;
        this.seminarTypeRepository = seminarTypeRepository;
        this.consultantRepository = consultantRepository;
        this.userRepository = userRepository;
        this.materialRequirementRepository = materialRequirementRepository;
        this.avEquipmentRequirementRepository = avEquipmentRequirementRepository;
    }

    @Transactional(readOnly = true)
    public List<SeminarResponse> getAll() {
        return seminarRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SeminarResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    public SeminarResponse create(SeminarCreateRequest request) {
        LocalDate startDate = SeminarValidation.requireDate(request.startDate(), "startDate");
        LocalDate endDate = SeminarValidation.requireDate(request.endDate(), "endDate");
        SeminarValidation.requireEndDateOnOrAfterStartDate(startDate, endDate);

        Seminar seminar = new Seminar();
        seminar.setBookingDepartmentUser(requireUser(request.bookingDepartmentUserId(), "Booking department user"));
        seminar.setBookingCreatedDate(LocalDate.now());
        applyRequest(
                seminar,
                request.seminarTypeId(),
                request.consultantId(),
                request.employeeId(),
                request.seminarName(),
                startDate,
                endDate,
                request.city(),
                request.anticipatedRegistrants()
        );
        return toResponse(seminarRepository.save(seminar));
    }

    public SeminarResponse update(Long id, SeminarUpdateRequest request) {
        LocalDate startDate = SeminarValidation.requireDate(request.startDate(), "startDate");
        LocalDate endDate = SeminarValidation.requireDate(request.endDate(), "endDate");
        SeminarValidation.requireEndDateOnOrAfterStartDate(startDate, endDate);

        Seminar seminar = findEntity(id);
        applyRequest(
                seminar,
                request.seminarTypeId(),
                request.consultantId(),
                request.employeeId(),
                request.seminarName(),
                startDate,
                endDate,
                request.city(),
                request.anticipatedRegistrants()
        );
        return toResponse(seminarRepository.save(seminar));
    }

    public void delete(Long id) {
        Seminar seminar = findEntity(id);
        seminarRepository.delete(seminar);
    }

    @Transactional(readOnly = true)
    public SeminarRequirementsPreviewResponse getRequirementsPreview(Long id) {
        Seminar seminar = findEntity(id);
        Long seminarTypeId = seminar.getSeminarType().getId();
        Integer anticipatedRegistrants = seminar.getAnticipatedRegistrants();
        List<CalculatedMaterialRequirementResponse> materials = materialRequirementRepository
                .findBySeminarType_IdOrderByMaterial_MaterialNameAsc(seminarTypeId)
                .stream()
                .map(requirement -> toCalculatedMaterial(requirement, anticipatedRegistrants))
                .toList();
        List<CalculatedAvEquipmentRequirementResponse> avEquipment = avEquipmentRequirementRepository
                .findBySeminarType_IdOrderByAudioVisualEquipment_EquipmentNameAsc(seminarTypeId)
                .stream()
                .map(requirement -> toCalculatedAvEquipment(requirement, anticipatedRegistrants))
                .toList();

        return new SeminarRequirementsPreviewResponse(
                seminar.getId(),
                seminar.getSeminarName(),
                seminarTypeId,
                seminar.getSeminarType().getTypeName(),
                anticipatedRegistrants,
                materials,
                avEquipment
        );
    }

    private void applyRequest(
            Seminar seminar,
            Long seminarTypeId,
            Long consultantId,
            Long employeeId,
            String seminarName,
            LocalDate startDate,
            LocalDate endDate,
            String city,
            Integer anticipatedRegistrants
    ) {
        seminar.setSeminarType(requireSeminarType(seminarTypeId));
        seminar.setConsultant(requireConsultant(consultantId));
        seminar.setEmployee(requireUser(employeeId, "Employee"));
        seminar.setSeminarName(SeminarValidation.requireNotBlank(seminarName, "seminarName"));
        seminar.setStartDate(startDate);
        seminar.setEndDate(endDate);
        seminar.setCity(SeminarValidation.requireNotBlank(city, "city"));
        seminar.setAnticipatedRegistrants(
                SeminarValidation.requirePositive(anticipatedRegistrants, "anticipatedRegistrants")
        );
    }

    private Seminar findEntity(Long id) {
        return seminarRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seminar not found: " + id));
    }

    private SeminarType requireSeminarType(Long seminarTypeId) {
        return seminarTypeRepository.findById(seminarTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("Seminar type not found: " + seminarTypeId));
    }

    private Consultant requireConsultant(Long consultantId) {
        return consultantRepository.findById(consultantId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultant not found: " + consultantId));
    }

    private User requireUser(Long userId, String label) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(label + " not found: " + userId));
    }

    private SeminarResponse toResponse(Seminar seminar) {
        SeminarType seminarType = seminar.getSeminarType();
        Consultant consultant = seminar.getConsultant();
        User bookingDepartmentUser = seminar.getBookingDepartmentUser();
        User employee = seminar.getEmployee();
        return new SeminarResponse(
                seminar.getId(),
                seminarType.getId(),
                seminarType.getTypeName(),
                consultant.getId(),
                consultant.getFullName(),
                bookingDepartmentUser.getId(),
                bookingDepartmentUser.getFullName(),
                employee.getId(),
                employee.getFullName(),
                seminar.getSeminarName(),
                seminar.getStartDate(),
                seminar.getEndDate(),
                seminar.getCity(),
                seminar.getAnticipatedRegistrants(),
                seminar.getBookingCreatedDate()
        );
    }

    private CalculatedMaterialRequirementResponse toCalculatedMaterial(
            MaterialRequirement requirement,
            Integer anticipatedRegistrants
    ) {
        Material material = requirement.getMaterial();
        return new CalculatedMaterialRequirementResponse(
                material.getId(),
                material.getMaterialName(),
                material.getMaterialType(),
                material.getUnit(),
                calculatedQuantity(
                        requirement.getDependOnNumParticipant(),
                        anticipatedRegistrants,
                        requirement.getParticipantPerQuantity(),
                        requirement.getDefaultQuantity()
                ),
                requirement.getDependOnNumParticipant(),
                requirement.getParticipantPerQuantity(),
                requirement.getDefaultQuantity(),
                requirement.getNotes()
        );
    }

    private CalculatedAvEquipmentRequirementResponse toCalculatedAvEquipment(
            AvEquipmentRequirement requirement,
            Integer anticipatedRegistrants
    ) {
        AudioVisualEquipment equipment = requirement.getAudioVisualEquipment();
        return new CalculatedAvEquipmentRequirementResponse(
                equipment.getId(),
                equipment.getEquipmentName(),
                equipment.getEquipmentType(),
                equipment.getUnit(),
                calculatedQuantity(
                        requirement.getDependOnNumParticipant(),
                        anticipatedRegistrants,
                        requirement.getParticipantPerQuantity(),
                        requirement.getQuantityRequired()
                ),
                requirement.getDependOnNumParticipant(),
                requirement.getParticipantPerQuantity(),
                requirement.getQuantityRequired()
        );
    }

    private Integer calculatedQuantity(
            Boolean dependOnNumParticipant,
            Integer anticipatedRegistrants,
            Integer participantPerQuantity,
            Integer fixedQuantity
    ) {
        if (Boolean.TRUE.equals(dependOnNumParticipant)) {
            return (int) Math.ceil((double) anticipatedRegistrants / participantPerQuantity);
        }
        return fixedQuantity;
    }
}
