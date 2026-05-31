package com.training.logistics.facility_contract.service;

import com.training.logistics.facility_contract.dto.AvEquipmentReservationItemRequest;
import com.training.logistics.facility_contract.dto.AvEquipmentReservationResponse;
import com.training.logistics.facility_contract.dto.CreateRoomReservationRequest;
import com.training.logistics.facility_contract.dto.RoomReservationResponse;
import com.training.logistics.facility_contract.dto.SaveAvEquipmentReservationsRequest;
import com.training.logistics.facility_contract.dto.SeminarReservationResponse;
import com.training.logistics.facility_contract.dto.UpdateRoomReservationRequest;
import com.training.logistics.facility_contract.exception.InvalidFacilityContractRequestException;
import com.training.logistics.facility_contract.external.MasterDataClient;
import com.training.logistics.facility_contract.external.SeminarClient;
import com.training.logistics.facility_contract.mapper.FacilityContractMapper;
import com.training.logistics.facility_contract.model.AvEquipmentReservation;
import com.training.logistics.facility_contract.model.ContractStatus;
import com.training.logistics.facility_contract.model.FacilityRoomReservation;
import com.training.logistics.facility_contract.model.SeminarFacilityContract;
import com.training.logistics.facility_contract.repository.AvEquipmentReservationRepository;
import com.training.logistics.facility_contract.repository.FacilityRoomReservationRepository;
import com.training.logistics.facility_contract.repository.SeminarFacilityContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private final AvEquipmentReservationRepository reservationRepository;
    private final FacilityRoomReservationRepository roomReservationRepository;
    private final SeminarFacilityContractRepository contractRepository;
    private final FacilityContractService contractService;
    private final MasterDataClient masterDataClient;
    private final MinioStorageService minioStorageService;
    private final SeminarClient seminarClient;

    @Transactional
    public List<AvEquipmentReservationResponse> saveAvEquipmentReservations(SaveAvEquipmentReservationsRequest request) {
        SeminarFacilityContract contract = getEditableContract(request.getContractId(), "Only PENDING_NEGOTIATE contracts can store AV reservations");
        seminarClient.verifyCoordinator(contract.getSeminarId());

        for (AvEquipmentReservationItemRequest item : request.getEquipments()) {
            if (!masterDataClient.existsEquipmentById(item.getEquipmentId())) {
                throw new InvalidFacilityContractRequestException("Equipment does not exist: " + item.getEquipmentId());
            }
        }

        reservationRepository.deleteByContractContractId(contract.getContractId());

        List<AvEquipmentReservation> reservations = request.getEquipments().stream()
                .map(item -> AvEquipmentReservation.builder()
                        .contract(contract)
                        .equipmentId(item.getEquipmentId())
                        .quantityReserved(item.getQuantityReserved())
                        .costForEachEquipment(item.getCostForEachEquipment())
                        .build())
                .toList();

        return reservationRepository.saveAll(reservations).stream()
                .map(FacilityContractMapper::toAvReservationResponse)
                .toList();
    }

    @Transactional
    public RoomReservationResponse createRoomReservation(CreateRoomReservationRequest request) {
        SeminarFacilityContract contract = getEditableContract(request.getContractId(), "Only PENDING_NEGOTIATE contracts can store room reservations");
        seminarClient.verifyCoordinator(contract.getSeminarId());

        FacilityRoomReservation reservation = FacilityRoomReservation.builder()
                .contract(contract)
                .roomNameSpec(request.getRoomNameSpec().trim())
                .seatingArrangement(normalizeBlank(request.getSeatingArrangement()))
                .numSeats(request.getNumSeats())
                .roomImageUrl(uploadRoomImage(contract.getContractId(), request.getRoomImage(), request.getRoomNameSpec()))
                .build();

        return FacilityContractMapper.toRoomReservationResponse(roomReservationRepository.save(reservation));
    }

    @Transactional
    public RoomReservationResponse updateRoomReservation(Long roomReservationId, UpdateRoomReservationRequest request) {
        FacilityRoomReservation reservation = findRoomReservation(roomReservationId);
        SeminarFacilityContract contract = getEditableContract(
                reservation.getContract().getContractId(),
                "Approved contracts cannot be changed"
        );
        seminarClient.verifyCoordinator(contract.getSeminarId());

        reservation.setRoomNameSpec(request.getRoomNameSpec().trim());
        reservation.setSeatingArrangement(normalizeBlank(request.getSeatingArrangement()));
        reservation.setNumSeats(request.getNumSeats());

        if (request.getRoomImage() != null && !request.getRoomImage().isEmpty()) {
            deleteExistingRoomImage(reservation.getRoomImageUrl());
            reservation.setRoomImageUrl(uploadRoomImage(contract.getContractId(), request.getRoomImage(), request.getRoomNameSpec()));
        }

        return FacilityContractMapper.toRoomReservationResponse(reservation);
    }

    @Transactional
    public void deleteRoomReservation(Long roomReservationId) {
        FacilityRoomReservation reservation = findRoomReservation(roomReservationId);
        SeminarFacilityContract contract = getEditableContract(reservation.getContract().getContractId(), "Approved contracts cannot be changed");
        seminarClient.verifyCoordinator(contract.getSeminarId());
        deleteExistingRoomImage(reservation.getRoomImageUrl());
        roomReservationRepository.delete(reservation);
    }

    @Transactional(readOnly = true)
    public List<RoomReservationResponse> getRoomReservationsByContract(Long contractId) {
        contractService.findContract(contractId);
        return roomReservationRepository.findByContractContractId(contractId).stream()
                .map(FacilityContractMapper::toRoomReservationResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SeminarReservationResponse getReservationsBySeminar(Long seminarId) {
        SeminarFacilityContract contract = contractRepository.findBySeminarId(seminarId)
                .orElseThrow(() -> new InvalidFacilityContractRequestException("No facility contract found for seminar"));
        return FacilityContractMapper.toSeminarReservationResponse(contract);
    }

    private SeminarFacilityContract getEditableContract(Long contractId, String message) {
        SeminarFacilityContract contract = contractService.findContract(contractId);
        if (contract.getStatus() != ContractStatus.PENDING_NEGOTIATE) {
            throw new InvalidFacilityContractRequestException(message);
        }
        return contract;
    }

    private FacilityRoomReservation findRoomReservation(Long roomReservationId) {
        return roomReservationRepository.findById(roomReservationId)
                .orElseThrow(() -> new InvalidFacilityContractRequestException("Room reservation not found"));
    }

    private String uploadRoomImage(Long contractId, MultipartFile roomImage, String roomNameSpec) {
        if (roomImage == null || roomImage.isEmpty()) {
            return null;
        }

        String objectName = "rooms/" + contractId + "/" + System.currentTimeMillis() + "_" + safeFilename(roomNameSpec, roomImage.getOriginalFilename());
        return minioStorageService.uploadFile(objectName, roomImage);
    }

    private void deleteExistingRoomImage(String roomImageUrl) {
        String objectName = minioStorageService.extractObjectName(roomImageUrl);
        if (objectName != null) {
            minioStorageService.deleteFile(objectName);
        }
    }

    private String normalizeBlank(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String safeFilename(String roomNameSpec, String originalFilename) {
        String baseName = roomNameSpec == null || roomNameSpec.isBlank() ? "room" : roomNameSpec.trim();
        String fileName = originalFilename == null || originalFilename.isBlank() ? "image" : originalFilename;
        return (baseName + "_" + fileName).replaceAll("[^A-Za-z0-9._-]", "_");
    }
}
