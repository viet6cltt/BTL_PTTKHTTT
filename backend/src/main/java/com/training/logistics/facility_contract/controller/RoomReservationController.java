package com.training.logistics.facility_contract.controller;

import com.training.logistics.facility_contract.dto.RoomReservationRequest;
import com.training.logistics.facility_contract.dto.RoomReservationResponse;
import com.training.logistics.facility_contract.service.RoomReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/facility-contract")
@RequiredArgsConstructor
public class RoomReservationController {
    private final RoomReservationService roomReservationService;

    @PostMapping("/contracts/{contractId}/rooms")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<RoomReservationResponse> addRoomReservation(
            @PathVariable Long contractId,
            @Valid @RequestBody RoomReservationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomReservationService.addRoomReservation(contractId, request));
    }

    @GetMapping("/contracts/{contractId}/rooms")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<List<RoomReservationResponse>> getRoomsByContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(roomReservationService.getRoomsByContract(contractId));
    }

    @PutMapping("/rooms/{roomId}")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<RoomReservationResponse> updateRoomReservation(
            @PathVariable Long roomId,
            @Valid @RequestBody RoomReservationRequest request) {
        return ResponseEntity.ok(roomReservationService.updateRoomReservation(roomId, request));
    }

    @DeleteMapping("/rooms/{roomId}")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<Void> deleteRoomReservation(@PathVariable Long roomId) {
        roomReservationService.deleteRoomReservation(roomId);
        return ResponseEntity.noContent().build();
    }
}
