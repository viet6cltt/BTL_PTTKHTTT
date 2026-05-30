package com.training.logistics.facility_contract.controller;

import com.training.logistics.facility_contract.dto.AudioVisualEquipmentRequest;
import com.training.logistics.facility_contract.dto.AudioVisualEquipmentResponse;
import com.training.logistics.facility_contract.service.AvEquipmentService;
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
@RequestMapping("/api/facility-contract/av-equipments")
@RequiredArgsConstructor
public class AudioVisualEquipmentController {
    private final AvEquipmentService avEquipmentService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AudioVisualEquipmentResponse> createEquipment(@Valid @RequestBody AudioVisualEquipmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(avEquipmentService.createEquipment(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<List<AudioVisualEquipmentResponse>> getAllEquipments() {
        return ResponseEntity.ok(avEquipmentService.getAllEquipments());
    }

    @GetMapping("/{equipmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<AudioVisualEquipmentResponse> getEquipmentById(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(avEquipmentService.getEquipmentById(equipmentId));
    }

    @PutMapping("/{equipmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AudioVisualEquipmentResponse> updateEquipment(
            @PathVariable Long equipmentId,
            @Valid @RequestBody AudioVisualEquipmentRequest request) {
        return ResponseEntity.ok(avEquipmentService.updateEquipment(equipmentId, request));
    }

    @DeleteMapping("/{equipmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long equipmentId) {
        avEquipmentService.deleteEquipment(equipmentId);
        return ResponseEntity.noContent().build();
    }
}
