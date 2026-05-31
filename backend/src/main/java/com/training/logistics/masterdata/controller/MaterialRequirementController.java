package com.training.logistics.masterdata.controller;

import com.training.logistics.masterdata.dto.request.MaterialRequirementRequest;
import com.training.logistics.masterdata.dto.response.MaterialRequirementResponse;
import com.training.logistics.masterdata.service.MaterialRequirementService;
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
@RequestMapping("/api/master-data/seminar-types/{seminarTypeId}/material-requirements")
public class MaterialRequirementController {

    private final MaterialRequirementService requirementService;

    public MaterialRequirementController(MaterialRequirementService requirementService) {
        this.requirementService = requirementService;
    }

    @GetMapping
    public List<MaterialRequirementResponse> getAll(@PathVariable Long seminarTypeId) {
        return requirementService.getAllBySeminarType(seminarTypeId);
    }

    @GetMapping("/{materialId}")
    public MaterialRequirementResponse getById(@PathVariable Long seminarTypeId, @PathVariable Long materialId) {
        return requirementService.getById(seminarTypeId, materialId);
    }

    @PostMapping
    public ResponseEntity<MaterialRequirementResponse> create(
            @PathVariable Long seminarTypeId,
            @Valid @RequestBody MaterialRequirementRequest request
    ) {
        MaterialRequirementResponse response = requirementService.create(seminarTypeId, request);
        return ResponseEntity
                .created(URI.create(
                        "/api/master-data/seminar-types/"
                                + seminarTypeId
                                + "/material-requirements/"
                                + response.materialId()
                ))
                .body(response);
    }

    @PutMapping("/{materialId}")
    public MaterialRequirementResponse update(
            @PathVariable Long seminarTypeId,
            @PathVariable Long materialId,
            @Valid @RequestBody MaterialRequirementRequest request
    ) {
        return requirementService.update(seminarTypeId, materialId, request);
    }

    @DeleteMapping("/{materialId}")
    public ResponseEntity<Void> delete(@PathVariable Long seminarTypeId, @PathVariable Long materialId) {
        requirementService.delete(seminarTypeId, materialId);
        return ResponseEntity.noContent().build();
    }
}
