package com.training.logistics.seminar.service;

import com.training.logistics.auth.model.User;
import com.training.logistics.auth.model.UserRole;
import com.training.logistics.auth.repository.UserRepository;
import com.training.logistics.common.exception.BadRequestException;
import com.training.logistics.common.exception.ConflictException;
import com.training.logistics.common.exception.ResourceNotFoundException;
import com.training.logistics.facility_contract.model.ContractStatus;
import com.training.logistics.facility_contract.model.SeminarFacilityContract;
import com.training.logistics.facility_contract.repository.SeminarFacilityContractRepository;
import com.training.logistics.masterdata.model.AudioVisualEquipment;
import com.training.logistics.masterdata.model.AvEquipmentRequirement;
import com.training.logistics.masterdata.model.Material;
import com.training.logistics.masterdata.model.MaterialRequirement;
import com.training.logistics.masterdata.model.SeminarType;
import com.training.logistics.masterdata.repository.AvEquipmentRequirementRepository;
import com.training.logistics.masterdata.repository.MaterialRequirementRepository;
import com.training.logistics.masterdata.repository.SeminarTypeRepository;
import com.training.logistics.materialrequest.model.MaterialRequest;
import com.training.logistics.materialrequest.model.ShipmentStatus;
import com.training.logistics.materialrequest.repository.MaterialRequestRepository;
import com.training.logistics.seminar.dto.request.AssignCoordinatorRequest;
import com.training.logistics.seminar.dto.request.SeminarCreateRequest;
import com.training.logistics.seminar.dto.request.SeminarUpdateRequest;
import com.training.logistics.seminar.dto.request.UpdateSeminarStatusRequest;
import com.training.logistics.seminar.dto.response.CalculatedAvEquipmentRequirementResponse;
import com.training.logistics.seminar.dto.response.CalculatedMaterialRequirementResponse;
import com.training.logistics.seminar.dto.response.SeminarPreparationChecklistResponse;
import com.training.logistics.seminar.dto.response.SeminarRequirementsPreviewResponse;
import com.training.logistics.seminar.dto.response.SeminarResponse;
import com.training.logistics.seminar.model.Seminar;
import com.training.logistics.seminar.model.SeminarStatus;
import com.training.logistics.seminar.repository.SeminarRepository;
import com.training.logistics.travel.model.Consultant;
import com.training.logistics.travel.model.TravelArrangement;
import com.training.logistics.travel.model.TravelArrangementStatus;
import com.training.logistics.travel.repository.ConsultantRepository;
import com.training.logistics.travel.repository.TravelArrangementRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SeminarService {
    private static final List<SeminarStatus> VISIBLE_SEMINAR_STATUSES = List.of(
            SeminarStatus.PENDING_LOGISTICS,
            SeminarStatus.FACILITY_SECURED,
            SeminarStatus.IN_PROGRESS,
            SeminarStatus.READY_FOR_SEMINAR,
            SeminarStatus.CANCELLED
    );
    private static final List<SeminarStatus> CLOSED_SEMINAR_STATUSES = List.of(
            SeminarStatus.READY_FOR_SEMINAR,
            SeminarStatus.CANCELLED
    );

    private final SeminarRepository seminarRepository;
    private final SeminarFacilityContractRepository seminarFacilityContractRepository;
    private final SeminarTypeRepository seminarTypeRepository;
    private final ConsultantRepository consultantRepository;
    private final UserRepository userRepository;
    private final MaterialRequirementRepository materialRequirementRepository;
    private final AvEquipmentRequirementRepository avEquipmentRequirementRepository;
    private final TravelArrangementRepository travelArrangementRepository;
    private final MaterialRequestRepository materialRequestRepository;

    public Page<SeminarResponse> search(SeminarStatus status, String city, Long coordinatorId, Pageable pageable) {
        UserRole currentRole = requireCurrentUser().getRole();
        return seminarRepository.findAll(buildSpecification(status, city, coordinatorId, currentRole), pageable)
                .map(seminar -> {
                    reevaluatePreparationStatus(seminar);
                    return toResponse(seminar);
                });
    }

    public SeminarResponse getById(Long id) {
        Seminar seminar = findEntity(id);
        reevaluatePreparationStatus(seminar);
        ensureVisibleForCurrentUser(seminar);
        return toResponse(seminar);
    }

    public SeminarResponse create(SeminarCreateRequest request) {
        LocalDate startDate = SeminarValidation.requireDate(request.startDate(), "startDate");
        LocalDate endDate = SeminarValidation.requireDate(request.endDate(), "endDate");
        SeminarValidation.requireFutureStartDate(startDate);
        SeminarValidation.requireEndDateOnOrAfterStartDate(startDate, endDate);
        ensureConsultantAvailable(request.consultantId(), startDate, endDate);

        SeminarType seminarType = requireSeminarType(request.seminarTypeId());
        Consultant consultant = requireConsultant(request.consultantId());
        User bookingStaff = requireCurrentUser();

        Seminar seminar = new Seminar();
        seminar.setSeminarType(seminarType);
        seminar.setConsultant(consultant);
        seminar.setBookingDepartmentUser(bookingStaff);
        seminar.setSeminarName(buildSeminarName(seminarType, request.city(), startDate));
        seminar.setExpectedTimeSlot(request.expectedTimeSlot());
        seminar.setStartDate(startDate);
        seminar.setEndDate(endDate);
        seminar.setCity(SeminarValidation.requireNotBlank(request.city(), "city"));
        seminar.setAnticipatedRegistrants(
                SeminarValidation.requirePositive(request.anticipatedRegistrants(), "anticipatedRegistrants")
        );
        seminar.setStatus(SeminarStatus.PENDING_LOGISTICS);

        return toResponse(seminarRepository.save(seminar));
    }

    public SeminarResponse update(Long id, SeminarUpdateRequest request) {
        LocalDate startDate = SeminarValidation.requireDate(request.startDate(), "startDate");
        LocalDate endDate = SeminarValidation.requireDate(request.endDate(), "endDate");
        SeminarValidation.requireEndDateOnOrAfterStartDate(startDate, endDate);

        Seminar seminar = findEntity(id);
        seminar.setSeminarType(requireSeminarType(request.seminarTypeId()));
        seminar.setConsultant(requireConsultant(request.consultantId()));
        seminar.setSeminarName(SeminarValidation.requireNotBlank(request.seminarName(), "seminarName"));
        seminar.setExpectedTimeSlot(request.expectedTimeSlot());
        seminar.setStartDate(startDate);
        seminar.setEndDate(endDate);
        seminar.setCity(SeminarValidation.requireNotBlank(request.city(), "city"));
        seminar.setAnticipatedRegistrants(
                SeminarValidation.requirePositive(request.anticipatedRegistrants(), "anticipatedRegistrants")
        );
        seminar.setNote(SeminarValidation.trimToNull(request.note()));
        return toResponse(seminar);
    }

    public SeminarResponse assignCoordinator(Long id, AssignCoordinatorRequest request) {
        Seminar seminar = findEntity(id);
        ensureOpenForCoordinatorWork(seminar);
        User currentUser = requireCurrentUser();
        if (currentUser.getRole() != UserRole.LOGISTICS_COORDINATOR) {
            throw new BadRequestException("Only a LOGISTICS_COORDINATOR can claim a seminar");
        }
        if (!currentUser.getUserId().equals(request.logisticsCoordinatorId())) {
            throw new BadRequestException("Coordinators can only claim seminars for themselves");
        }
        User assignedCoordinator = seminar.getCoordinator();
        if (assignedCoordinator != null && !assignedCoordinator.getUserId().equals(currentUser.getUserId())) {
            throw new ConflictException("Seminar has already been claimed by another coordinator");
        }
        User coordinator = requireUser(request.logisticsCoordinatorId(), "Logistics coordinator");
        seminar.setCoordinator(coordinator);
        return toResponse(seminar);
    }

    public SeminarResponse updateStatus(Long id, UpdateSeminarStatusRequest request) {
        if (request.status() == SeminarStatus.READY_FOR_SEMINAR) {
            throw new BadRequestException("READY_FOR_SEMINAR is computed automatically from preparation checklist");
        }
        Seminar seminar = findEntity(id);
        seminar.setStatus(request.status());
        return toResponse(seminar);
    }

    public void markFacilitySecured(Long id) {
        Seminar seminar = findEntity(id);
        if (seminar.getStatus() != SeminarStatus.CANCELLED) {
            seminar.setStatus(SeminarStatus.FACILITY_SECURED);
            reevaluatePreparationStatus(seminar);
        }
    }

    @Transactional(readOnly = true)
    public boolean existsById(Long id) {
        return seminarRepository.existsById(id);
    }

    @Transactional(readOnly = true)
    public Seminar findEntity(Long id) {
        return seminarRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seminar not found: " + id));
    }

    public void ensureOpenForCoordinatorWork(Seminar seminar) {
        if (isPastUnclosed(seminar)) {
            throw new BadRequestException("Seminar is overdue and no longer editable by coordinator");
        }
    }

    private boolean isPastUnclosed(Seminar seminar) {
        return seminar.getStartDate().isBefore(LocalDate.now())
                && !CLOSED_SEMINAR_STATUSES.contains(seminar.getStatus());
    }

    public void reevaluatePreparationStatus(Long seminarId) {
        reevaluatePreparationStatus(findEntity(seminarId));
    }

    public void reevaluatePreparationStatus(Seminar seminar) {
        if (seminar.getStatus() == SeminarStatus.CANCELLED) {
            return;
        }

        PreparationSnapshot snapshot = buildPreparationSnapshot(seminar.getId());
        if (snapshot.readyForSeminar()) {
            seminar.setStatus(SeminarStatus.READY_FOR_SEMINAR);
            return;
        }

        if (seminar.getStatus() == SeminarStatus.READY_FOR_SEMINAR && !snapshot.readyForSeminar()) {
            seminar.setStatus(snapshot.facilitySecured() ? SeminarStatus.IN_PROGRESS : SeminarStatus.PENDING_LOGISTICS);
            return;
        }

        if (!snapshot.facilitySecured()) {
            seminar.setStatus(SeminarStatus.PENDING_LOGISTICS);
            return;
        }

        if (snapshot.travelArrangementStatus() != null || snapshot.materialShipmentStatus() != null) {
            seminar.setStatus(SeminarStatus.IN_PROGRESS);
            return;
        }

        seminar.setStatus(SeminarStatus.FACILITY_SECURED);
    }

    private PreparationSnapshot buildPreparationSnapshot(Long seminarId) {
        ContractStatus facilityContractStatus = seminarFacilityContractRepository.findBySeminarId(seminarId)
                .map(SeminarFacilityContract::getStatus)
                .orElse(null);
        TravelArrangementStatus travelArrangementStatus = aggregateTravelStatus(
                travelArrangementRepository.findBySeminarId(seminarId)
        );
        ShipmentStatus materialShipmentStatus = aggregateMaterialStatus(
                materialRequestRepository.findBySeminar_IdOrderByCreatedAtDescIdDesc(seminarId)
        );
        boolean facilitySecured = facilityContractStatus == ContractStatus.APPROVED;
        boolean travelConfirmed = travelArrangementStatus == TravelArrangementStatus.CONFIRMED;
        boolean materialsDelivered = materialShipmentStatus == ShipmentStatus.DELIVERED;
        return new PreparationSnapshot(
                facilityContractStatus,
                travelArrangementStatus,
                materialShipmentStatus,
                facilitySecured,
                travelConfirmed,
                materialsDelivered,
                facilitySecured && travelConfirmed && materialsDelivered
        );
    }

    private TravelArrangementStatus aggregateTravelStatus(List<TravelArrangement> arrangements) {
        if (arrangements.isEmpty()) {
            return null;
        }
        List<TravelArrangement> activeArrangements = arrangements.stream()
                .filter(arrangement -> arrangement.getTravelArrangementStatus() != TravelArrangementStatus.CANCELLED)
                .toList();
        if (activeArrangements.isEmpty()) {
            return TravelArrangementStatus.CANCELLED;
        }
        if (activeArrangements.stream()
                .allMatch(arrangement -> arrangement.getTravelArrangementStatus() == TravelArrangementStatus.CONFIRMED)) {
            return TravelArrangementStatus.CONFIRMED;
        }
        return TravelArrangementStatus.BOOKED;
    }

    private ShipmentStatus aggregateMaterialStatus(List<MaterialRequest> requests) {
        if (requests.isEmpty()) {
            return null;
        }
        if (requests.stream().allMatch(request -> request.getShipmentStatus() == ShipmentStatus.DELIVERED)) {
            return ShipmentStatus.DELIVERED;
        }
        if (requests.stream().anyMatch(request -> request.getShipmentStatus() == ShipmentStatus.SHIPPED)) {
            return ShipmentStatus.SHIPPED;
        }
        if (requests.stream().anyMatch(request -> request.getShipmentStatus() == ShipmentStatus.PACKED)) {
            return ShipmentStatus.PACKED;
        }
        return ShipmentStatus.REQUESTED;
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

    private Specification<Seminar> buildSpecification(
            SeminarStatus status,
            String city,
            Long coordinatorId,
            UserRole currentRole
    ) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (currentRole != UserRole.ADMIN) {
                predicates.add(root.get("status").in(VISIBLE_SEMINAR_STATUSES));
            }
            if (status != null) {
                predicates.add(builder.equal(root.get("status"), status));
            }
            if (city != null && !city.isBlank()) {
                predicates.add(builder.like(builder.lower(root.get("city")), "%" + city.trim().toLowerCase() + "%"));
            }
            if (coordinatorId != null) {
                predicates.add(builder.equal(root.get("coordinator").get("userId"), coordinatorId));
            }
            return builder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void ensureVisibleForCurrentUser(Seminar seminar) {
        if (requireCurrentUser().getRole() == UserRole.ADMIN) {
            return;
        }
        if (!VISIBLE_SEMINAR_STATUSES.contains(seminar.getStatus())) {
            throw new ResourceNotFoundException("Seminar not found: " + seminar.getId());
        }
    }

    private void ensureConsultantAvailable(Long consultantId, LocalDate startDate, LocalDate endDate) {
        boolean overlapping = seminarRepository.existsByConsultantConsultantIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                consultantId,
                endDate,
                startDate
        );
        if (overlapping) {
            throw new BadRequestException("Consultant already has a seminar in this date range");
        }
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

    private User requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BadRequestException("Authentication is required");
        }
        try {
            return requireUser(Long.parseLong(authentication.getName()), "Current user");
        } catch (NumberFormatException ex) {
            throw new BadRequestException("Current user id is invalid");
        }
    }

    private String buildSeminarName(SeminarType seminarType, String city, LocalDate startDate) {
        return seminarType.getTypeName() + " - " + city.trim() + " - " + startDate;
    }

    private SeminarResponse toResponse(Seminar seminar) {
        SeminarType seminarType = seminar.getSeminarType();
        Consultant consultant = seminar.getConsultant();
        User consultantUser = consultant.getUser();
        User bookingDepartmentUser = seminar.getBookingDepartmentUser();
        User coordinator = seminar.getCoordinator();
        return new SeminarResponse(
                seminar.getId(),
                seminarType.getId(),
                seminarType.getTypeName(),
                consultant.getConsultantId(),
                consultantUser == null ? null : consultantUser.getFullName(),
                bookingDepartmentUser.getUserId(),
                bookingDepartmentUser.getFullName(),
                coordinator == null ? null : coordinator.getUserId(),
                coordinator == null ? null : coordinator.getFullName(),
                seminar.getSeminarName(),
                seminar.getStartDate(),
                seminar.getEndDate(),
                seminar.getExpectedTimeSlot(),
                seminar.getCity(),
                seminar.getAnticipatedRegistrants(),
                seminar.getStatus(),
                toChecklistResponse(buildPreparationSnapshot(seminar.getId())),
                seminar.getNote(),
                seminar.getBookingCreatedDateTime()
        );
    }

    private SeminarPreparationChecklistResponse toChecklistResponse(PreparationSnapshot snapshot) {
        return new SeminarPreparationChecklistResponse(
                snapshot.facilityContractStatus(),
                snapshot.travelArrangementStatus(),
                snapshot.materialShipmentStatus(),
                snapshot.facilitySecured(),
                snapshot.travelConfirmed(),
                snapshot.materialsDelivered(),
                snapshot.readyForSeminar()
        );
    }

    private record PreparationSnapshot(
            ContractStatus facilityContractStatus,
            TravelArrangementStatus travelArrangementStatus,
            ShipmentStatus materialShipmentStatus,
            boolean facilitySecured,
            boolean travelConfirmed,
            boolean materialsDelivered,
            boolean readyForSeminar
    ) {
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
