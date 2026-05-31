package com.training.logistics.masterdata.controller;

import com.training.logistics.masterdata.dto.request.AvEquipmentRequirementRequest;
import com.training.logistics.masterdata.dto.response.AvEquipmentRequirementResponse;
import com.training.logistics.masterdata.service.AvEquipmentRequirementService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/master-data/seminar-types/{seminarTypeId}/av-equipment-requirements")
public class AvEquipmentRequirementController {

    private final AvEquipmentRequirementService requirementService;

    public AvEquipmentRequirementController(AvEquipmentRequirementService requirementService) {
        this.requirementService = requirementService;
    }

    @GetMapping
    public List<AvEquipmentRequirementResponse> getAll(@PathVariable Long seminarTypeId) {
        return requirementService.getAllBySeminarType(seminarTypeId);
    }

    @GetMapping("/{equipmentId}")
    public AvEquipmentRequirementResponse getById(
            @PathVariable Long seminarTypeId,
            @PathVariable Long equipmentId
    ) {
        return requirementService.getById(seminarTypeId, equipmentId);
    }

    @PostMapping
    public ResponseEntity<AvEquipmentRequirementResponse> create(
            @PathVariable Long seminarTypeId,
            @Valid @RequestBody AvEquipmentRequirementRequest request
    ) {
        AvEquipmentRequirementResponse response = requirementService.create(seminarTypeId, request);
        return ResponseEntity
                .created(URI.create(
                        "/api/master-data/seminar-types/"
                                + seminarTypeId
                                + "/av-equipment-requirements/"
                                + response.equipmentId()
                ))
                .body(response);
    }

    @PutMapping("/{equipmentId}")
    public AvEquipmentRequirementResponse update(
            @PathVariable Long seminarTypeId,
            @PathVariable Long equipmentId,
            @Valid @RequestBody AvEquipmentRequirementRequest request
    ) {
        return requirementService.update(seminarTypeId, equipmentId, request);
    }

    @DeleteMapping("/{equipmentId}")
    public ResponseEntity<Void> delete(@PathVariable Long seminarTypeId, @PathVariable Long equipmentId) {
        requirementService.delete(seminarTypeId, equipmentId);
        return ResponseEntity.noContent().build();
    }
}
