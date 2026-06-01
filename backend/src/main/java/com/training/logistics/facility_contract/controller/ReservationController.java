package com.training.logistics.facility_contract.controller;

import com.training.logistics.facility_contract.dto.AvEquipmentReservationResponse;
import com.training.logistics.facility_contract.dto.CreateRoomReservationRequest;
import com.training.logistics.facility_contract.dto.RoomReservationResponse;
import com.training.logistics.facility_contract.dto.SaveAvEquipmentReservationsRequest;
import com.training.logistics.facility_contract.dto.SeminarReservationResponse;
import com.training.logistics.facility_contract.dto.UpdateRoomReservationRequest;
import com.training.logistics.facility_contract.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {
    private final ReservationService reservationService;

    @PostMapping("/av-equipment")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<List<AvEquipmentReservationResponse>> saveAvEquipmentReservations(
            @Valid @RequestBody SaveAvEquipmentReservationsRequest request) {
        return ResponseEntity.ok(reservationService.saveAvEquipmentReservations(request));
    }

    @PostMapping("/rooms")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<RoomReservationResponse> createRoomReservation(
            @Valid @ModelAttribute CreateRoomReservationRequest request) {
        return ResponseEntity.ok(reservationService.createRoomReservation(request));
    }

    @PutMapping("/rooms/{roomReservationId}")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<RoomReservationResponse> updateRoomReservation(
            @PathVariable Long roomReservationId,
            @Valid @ModelAttribute UpdateRoomReservationRequest request) {
        return ResponseEntity.ok(reservationService.updateRoomReservation(roomReservationId, request));
    }

    @DeleteMapping("/rooms/{roomReservationId}")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<Void> deleteRoomReservation(@PathVariable Long roomReservationId) {
        reservationService.deleteRoomReservation(roomReservationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/contracts/{contractId}/rooms")
    @PreAuthorize("hasAnyRole('LOGISTICS_COORDINATOR', 'ADMIN', 'CONSULTANT')")
    public ResponseEntity<List<RoomReservationResponse>> getRoomReservationsByContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(reservationService.getRoomReservationsByContract(contractId));
    }

    @GetMapping("/seminar/{seminarId}")
    @PreAuthorize("hasAnyRole('LOGISTICS_COORDINATOR', 'ADMIN', 'CONSULTANT')")
    public ResponseEntity<SeminarReservationResponse> getReservationsBySeminar(@PathVariable Long seminarId) {
        return ResponseEntity.ok(reservationService.getReservationsBySeminar(seminarId));
    }
}
