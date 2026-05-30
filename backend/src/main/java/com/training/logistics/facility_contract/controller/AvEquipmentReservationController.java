package com.training.logistics.facility_contract.controller;

import com.training.logistics.facility_contract.dto.AvEquipmentReservationRequest;
import com.training.logistics.facility_contract.dto.AvEquipmentReservationResponse;
import com.training.logistics.facility_contract.service.AvEquipmentReservationService;
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
@RequestMapping("/api/facility-contract/contracts/{contractId}/av-reservations")
@RequiredArgsConstructor
public class AvEquipmentReservationController {
    private final AvEquipmentReservationService reservationService;

    @PostMapping
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<AvEquipmentReservationResponse> addAvReservation(
            @PathVariable Long contractId,
            @Valid @RequestBody AvEquipmentReservationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationService.addAvReservation(contractId, request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<List<AvEquipmentReservationResponse>> getAvReservationsByContract(@PathVariable Long contractId) {
        return ResponseEntity.ok(reservationService.getAvReservationsByContract(contractId));
    }

    @PutMapping("/{equipmentId}")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<AvEquipmentReservationResponse> updateAvReservation(
            @PathVariable Long contractId,
            @PathVariable Long equipmentId,
            @Valid @RequestBody AvEquipmentReservationRequest request) {
        return ResponseEntity.ok(reservationService.updateAvReservation(contractId, equipmentId, request));
    }

    @DeleteMapping("/{equipmentId}")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<Void> deleteAvReservation(
            @PathVariable Long contractId,
            @PathVariable Long equipmentId) {
        reservationService.deleteAvReservation(contractId, equipmentId);
        return ResponseEntity.noContent().build();
    }
}
