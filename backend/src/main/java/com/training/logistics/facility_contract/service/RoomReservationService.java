package com.training.logistics.facility_contract.service;

import com.training.logistics.facility_contract.dto.RoomReservationRequest;
import com.training.logistics.facility_contract.dto.RoomReservationResponse;
import com.training.logistics.facility_contract.exception.FacilityContractNotFoundException;
import com.training.logistics.facility_contract.exception.InvalidFacilityContractRequestException;
import com.training.logistics.facility_contract.mapper.FacilityContractMapper;
import com.training.logistics.facility_contract.model.FacilityRoomReservation;
import com.training.logistics.facility_contract.model.SeminarFacilityContract;
import com.training.logistics.facility_contract.repository.FacilityRoomReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomReservationService {
    private final FacilityRoomReservationRepository roomRepository;
    private final ContractService contractService;

    @Transactional
    public RoomReservationResponse addRoomReservation(Long contractId, RoomReservationRequest request) {
        validateTimeRange(request);
        SeminarFacilityContract contract = contractService.findContract(contractId);
        FacilityRoomReservation room = FacilityRoomReservation.builder()
                .contract(contract)
                .build();
        applyRoomRequest(room, request);
        return FacilityContractMapper.toRoomResponse(roomRepository.save(room));
    }

    @Transactional
    public RoomReservationResponse updateRoomReservation(Long roomId, RoomReservationRequest request) {
        validateTimeRange(request);
        FacilityRoomReservation room = findRoom(roomId);
        applyRoomRequest(room, request);
        return FacilityContractMapper.toRoomResponse(room);
    }

    @Transactional
    public void deleteRoomReservation(Long roomId) {
        roomRepository.delete(findRoom(roomId));
    }

    @Transactional(readOnly = true)
    public List<RoomReservationResponse> getRoomsByContract(Long contractId) {
        contractService.findContract(contractId);
        return roomRepository.findByContractContractId(contractId).stream()
                .map(FacilityContractMapper::toRoomResponse)
                .toList();
    }

    private FacilityRoomReservation findRoom(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new FacilityContractNotFoundException("Room reservation not found"));
    }

    private void applyRoomRequest(FacilityRoomReservation room, RoomReservationRequest request) {
        room.setNumSeats(request.getNumSeats());
        room.setStartTime(request.getStartTime());
        room.setEndTime(request.getEndTime());
        room.setRoomWidth(request.getRoomWidth());
        room.setRoomLength(request.getRoomLength());
        room.setSeatArrangementNotes(request.getSeatArrangementNotes());
        room.setRoomCost(request.getRoomCost());
    }

    private void validateTimeRange(RoomReservationRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new InvalidFacilityContractRequestException("endTime must be after startTime");
        }
    }
}
