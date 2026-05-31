package com.training.logistics.materialrequest.service;

import com.training.logistics.common.exception.BadRequestException;
import com.training.logistics.common.exception.ConflictException;
import com.training.logistics.common.exception.ResourceNotFoundException;
import com.training.logistics.masterdata.model.Material;
import com.training.logistics.masterdata.model.MaterialRequirement;
import com.training.logistics.masterdata.repository.MaterialRepository;
import com.training.logistics.masterdata.repository.MaterialRequirementRepository;
import com.training.logistics.materialrequest.dto.request.ConfirmDeliveryRequest;
import com.training.logistics.materialrequest.dto.request.MaterialRequestCreateRequest;
import com.training.logistics.materialrequest.dto.request.MaterialRequestItemRequest;
import com.training.logistics.materialrequest.dto.request.UpdateShipmentStatusRequest;
import com.training.logistics.materialrequest.dto.response.MaterialRequestItemResponse;
import com.training.logistics.materialrequest.dto.response.MaterialRequestResponse;
import com.training.logistics.materialrequest.model.MaterialRequest;
import com.training.logistics.materialrequest.model.MaterialRequestItem;
import com.training.logistics.materialrequest.model.ShipmentStatus;
import com.training.logistics.materialrequest.repository.MaterialRequestRepository;
import com.training.logistics.seminar.model.Seminar;
import com.training.logistics.seminar.repository.SeminarRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MaterialRequestService {

    private final MaterialRequestRepository materialRequestRepository;
    private final SeminarRepository seminarRepository;
    private final MaterialRepository materialRepository;
    private final MaterialRequirementRepository materialRequirementRepository;

    public MaterialRequestService(
            MaterialRequestRepository materialRequestRepository,
            SeminarRepository seminarRepository,
            MaterialRepository materialRepository,
            MaterialRequirementRepository materialRequirementRepository
    ) {
        this.materialRequestRepository = materialRequestRepository;
        this.seminarRepository = seminarRepository;
        this.materialRepository = materialRepository;
        this.materialRequirementRepository = materialRequirementRepository;
    }

    @Transactional(readOnly = true)
    public List<MaterialRequestResponse> getAll() {
        return materialRequestRepository.findAllByOrderByCreatedAtDescIdDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MaterialRequestResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Transactional(readOnly = true)
    public List<MaterialRequestResponse> getBySeminar(Long seminarId) {
        requireSeminar(seminarId);
        return materialRequestRepository.findBySeminar_IdOrderByCreatedAtDescIdDesc(seminarId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public MaterialRequestResponse create(Long seminarId, MaterialRequestCreateRequest request) {
        Seminar seminar = requireSeminar(seminarId);
        ensureCurrentCoordinatorOwnsSeminar(seminar);
        LocalDate requestDate = LocalDate.now();
        LocalDate neededByDate = MaterialRequestValidation.requireDate(request.neededByDate(), "neededByDate");
        if (neededByDate.isBefore(requestDate)) {
            throw new BadRequestException("neededByDate must be on or after requestDate");
        }

        MaterialRequest materialRequest = new MaterialRequest();
        materialRequest.setSeminar(seminar);
        materialRequest.setRequestDate(requestDate);
        materialRequest.setNeededByDate(neededByDate);
        materialRequest.setNotes(request.notes());
        materialRequest.setShipmentStatus(ShipmentStatus.REQUESTED);

        List<MaterialRequestItem> items = request.items() == null
                ? buildItemsFromRequirements(seminar)
                : buildItemsFromCoordinatorOverrides(request.items());
        if (items.isEmpty()) {
            throw new BadRequestException("material request must contain at least one item");
        }
        items.forEach(materialRequest::addItem);

        return toResponse(materialRequestRepository.save(materialRequest));
    }

    public MaterialRequestResponse updateShipmentStatus(Long id, UpdateShipmentStatusRequest request) {
        MaterialRequest materialRequest = findEntity(id);
        ShipmentStatus newStatus = request.shipmentStatus();
        if (newStatus == ShipmentStatus.DELIVERED) {
            throw new BadRequestException("Use confirm-delivered endpoint to mark a request as DELIVERED");
        }
        if (ShipmentStatus.DELIVERED.equals(materialRequest.getShipmentStatus())) {
            throw new ConflictException("Delivered material request cannot change shipment status");
        }

        materialRequest.setShipmentStatus(newStatus);
        return toResponse(materialRequestRepository.saveAndFlush(materialRequest));
    }

    public MaterialRequestResponse confirmDelivered(Long id, ConfirmDeliveryRequest request) {
        MaterialRequest materialRequest = findEntity(id);
        ensureCurrentCoordinatorOwnsSeminar(materialRequest.getSeminar());
        if (ShipmentStatus.DELIVERED.equals(materialRequest.getShipmentStatus())) {
            throw new ConflictException("Material request has already been delivered");
        }

        materialRequest.setShipmentStatus(ShipmentStatus.DELIVERED);
        materialRequest.setDeliveredConfirmedAt(LocalDateTime.now());
        materialRequest.setDeliveryConfirmationNote(request.note());

        return toResponse(materialRequestRepository.saveAndFlush(materialRequest));
    }

    private List<MaterialRequestItem> buildItemsFromRequirements(Seminar seminar) {
        return materialRequirementRepository
                .findBySeminarType_IdOrderByMaterial_MaterialNameAsc(seminar.getSeminarType().getId())
                .stream()
                .map(requirement -> toItem(
                        requirement.getMaterial(),
                        calculatedQuantity(
                                requirement.getDependOnNumParticipant(),
                                seminar.getAnticipatedRegistrants(),
                                requirement.getParticipantPerQuantity(),
                                requirement.getDefaultQuantity()
                        ),
                        requirement.getNotes()
                ))
                .toList();
    }

    private List<MaterialRequestItem> buildItemsFromCoordinatorOverrides(
            List<MaterialRequestItemRequest> itemRequests
    ) {
        if (itemRequests.isEmpty()) {
            throw new BadRequestException("items must not be empty when provided");
        }

        Set<Long> materialIds = new HashSet<>();
        return itemRequests.stream()
                .map(itemRequest -> {
                    if (!materialIds.add(itemRequest.materialId())) {
                        throw new BadRequestException("duplicate materialId in request items: " + itemRequest.materialId());
                    }
                    Material material = requireMaterial(itemRequest.materialId());
                    Integer quantity = MaterialRequestValidation.requirePositive(
                            itemRequest.requestedQuantity(),
                            "requestedQuantity"
                    );
                    return toItem(material, quantity, itemRequest.notes());
                })
                .toList();
    }

    private MaterialRequestItem toItem(Material material, Integer quantity, String notes) {
        MaterialRequestItem item = new MaterialRequestItem();
        item.setMaterial(material);
        item.setRequestedQuantity(quantity);
        item.setNotes(notes);
        return item;
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

    private MaterialRequest findEntity(Long id) {
        return materialRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material request not found: " + id));
    }

    private Seminar requireSeminar(Long seminarId) {
        if (seminarId == null) {
            throw new BadRequestException("seminarId must not be null");
        }
        return seminarRepository.findById(seminarId)
                .orElseThrow(() -> new ResourceNotFoundException("Seminar not found: " + seminarId));
    }

    private void ensureCurrentCoordinatorOwnsSeminar(Seminar seminar) {
        if (seminar.getCoordinator() == null) {
            throw new ConflictException("Seminar has not been assigned to a logistics coordinator");
        }
        Long currentUserId = getCurrentUserId();
        if (!seminar.getCoordinator().getUserId().equals(currentUserId)) {
            throw new ConflictException("Only the assigned logistics coordinator can perform this action");
        }
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BadRequestException("Authentication is required");
        }

        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new BadRequestException("Current user id is invalid");
        }
    }

    private Material requireMaterial(Long materialId) {
        if (materialId == null) {
            throw new BadRequestException("materialId must not be null");
        }
        return materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found: " + materialId));
    }

    private MaterialRequestResponse toResponse(MaterialRequest materialRequest) {
        Seminar seminar = materialRequest.getSeminar();
        return new MaterialRequestResponse(
                materialRequest.getId(),
                seminar.getId(),
                seminar.getSeminarName(),
                materialRequest.getContractId(),
                materialRequest.getRequestDate(),
                materialRequest.getNeededByDate(),
                materialRequest.getShipmentStatus(),
                materialRequest.getDeliveredConfirmedAt(),
                materialRequest.getDeliveryConfirmationNote(),
                materialRequest.getNotes(),
                materialRequest.getCreatedAt(),
                materialRequest.getUpdatedAt(),
                materialRequest.getItems()
                        .stream()
                        .map(this::toItemResponse)
                        .toList()
        );
    }

    private MaterialRequestItemResponse toItemResponse(MaterialRequestItem item) {
        Material material = item.getMaterial();
        return new MaterialRequestItemResponse(
                material.getId(),
                item.getRequestedQuantity(),
                material.getMaterialName(),
                material.getMaterialType(),
                material.getUnit(),
                item.getNotes()
        );
    }
}
