package com.training.logistics.facility_contract.controller;

import com.training.logistics.facility_contract.dto.AvEquipmentRequirementRequest;
import com.training.logistics.facility_contract.dto.AvEquipmentRequirementResponse;
import com.training.logistics.facility_contract.service.AvEquipmentRequirementService;
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
@RequestMapping("/api/facility-contract")
@RequiredArgsConstructor
public class AvEquipmentRequirementController {
    private final AvEquipmentRequirementService requirementService;

    @PostMapping("/av-requirements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AvEquipmentRequirementResponse> createRequirement(
            @Valid @RequestBody AvEquipmentRequirementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requirementService.createRequirement(request));
    }

    @GetMapping("/seminar-types/{seminarTypeId}/av-requirements")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<List<AvEquipmentRequirementResponse>> getRequirementsBySeminarType(@PathVariable Long seminarTypeId) {
        return ResponseEntity.ok(requirementService.getRequirementsBySeminarType(seminarTypeId));
    }

    @PutMapping("/av-requirements/{seminarTypeId}/{equipmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AvEquipmentRequirementResponse> updateRequirement(
            @PathVariable Long seminarTypeId,
            @PathVariable Long equipmentId,
            @Valid @RequestBody AvEquipmentRequirementRequest request) {
        return ResponseEntity.ok(requirementService.updateRequirement(seminarTypeId, equipmentId, request));
    }

    @DeleteMapping("/av-requirements/{seminarTypeId}/{equipmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRequirement(
            @PathVariable Long seminarTypeId,
            @PathVariable Long equipmentId) {
        requirementService.deleteRequirement(seminarTypeId, equipmentId);
        return ResponseEntity.noContent().build();
    }
}
