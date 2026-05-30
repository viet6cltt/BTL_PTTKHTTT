package com.training.logistics.facility_contract.service;

import com.training.logistics.facility_contract.dto.AvEquipmentReservationRequest;
import com.training.logistics.facility_contract.dto.AvEquipmentReservationResponse;
import com.training.logistics.facility_contract.exception.FacilityContractNotFoundException;
import com.training.logistics.facility_contract.mapper.FacilityContractMapper;
import com.training.logistics.facility_contract.model.AudioVisualEquipment;
import com.training.logistics.facility_contract.model.AvEquipmentReservation;
import com.training.logistics.facility_contract.model.AvEquipmentReservationId;
import com.training.logistics.facility_contract.model.SeminarFacilityContract;
import com.training.logistics.facility_contract.repository.AvEquipmentReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvEquipmentReservationService {
    private final AvEquipmentReservationRepository reservationRepository;
    private final ContractService contractService;
    private final AvEquipmentService equipmentService;

    @Transactional
    public AvEquipmentReservationResponse addAvReservation(Long contractId, AvEquipmentReservationRequest request) {
        SeminarFacilityContract contract = contractService.findContract(contractId);
        AudioVisualEquipment equipment = equipmentService.findEquipment(request.getEquipmentId());
        AvEquipmentReservation reservation = AvEquipmentReservation.builder()
                .contract(contract)
                .equipment(equipment)
                .build();
        applyReservationRequest(reservation, request);
        return FacilityContractMapper.toAvReservationResponse(reservationRepository.save(reservation));
    }

    @Transactional
    public AvEquipmentReservationResponse updateAvReservation(Long contractId, Long equipmentId, AvEquipmentReservationRequest request) {
        AvEquipmentReservation reservation = findReservation(contractId, equipmentId);
        applyReservationRequest(reservation, request);
        return FacilityContractMapper.toAvReservationResponse(reservation);
    }

    @Transactional
    public void deleteAvReservation(Long contractId, Long equipmentId) {
        reservationRepository.delete(findReservation(contractId, equipmentId));
    }

    @Transactional(readOnly = true)
    public List<AvEquipmentReservationResponse> getAvReservationsByContract(Long contractId) {
        contractService.findContract(contractId);
        return reservationRepository.findByContractContractId(contractId).stream()
                .map(FacilityContractMapper::toAvReservationResponse)
                .toList();
    }

    private AvEquipmentReservation findReservation(Long contractId, Long equipmentId) {
        return reservationRepository.findById(new AvEquipmentReservationId(contractId, equipmentId))
                .orElseThrow(() -> new FacilityContractNotFoundException("AV equipment reservation not found"));
    }

    private void applyReservationRequest(AvEquipmentReservation reservation, AvEquipmentReservationRequest request) {
        reservation.setQuantityReserved(request.getQuantityReserved());
        reservation.setCostForEachEquipment(request.getCostForEachEquipment());
    }
}
