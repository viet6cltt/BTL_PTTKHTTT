package com.training.logistics.materialrequest.controller;

import com.training.logistics.materialrequest.dto.request.ConfirmDeliveryRequest;
import com.training.logistics.materialrequest.dto.request.MaterialRequestCreateRequest;
import com.training.logistics.materialrequest.dto.request.UpdateShipmentStatusRequest;
import com.training.logistics.materialrequest.dto.response.MaterialRequestResponse;
import com.training.logistics.materialrequest.service.MaterialRequestService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class MaterialRequestController {

    private final MaterialRequestService materialRequestService;

    public MaterialRequestController(MaterialRequestService materialRequestService) {
        this.materialRequestService = materialRequestService;
    }

    @PostMapping("/seminars/{seminarId}/material-requests")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<MaterialRequestResponse> create(
            @PathVariable Long seminarId,
            @Valid @RequestBody MaterialRequestCreateRequest request
    ) {
        MaterialRequestResponse response = materialRequestService.create(seminarId, request);
        return ResponseEntity
                .created(URI.create("/api/v1/material-requests/" + response.id()))
                .body(response);
    }

    @GetMapping("/material-requests")
    @PreAuthorize("hasAnyRole('LOGISTICS_COORDINATOR', 'MATERIALS_STAFF')")
    public List<MaterialRequestResponse> getAll() {
        return materialRequestService.getAll();
    }

    @GetMapping("/material-requests/{id}")
    @PreAuthorize("hasAnyRole('LOGISTICS_COORDINATOR', 'MATERIALS_STAFF')")
    public MaterialRequestResponse getById(@PathVariable Long id) {
        return materialRequestService.getById(id);
    }

    @GetMapping("/seminars/{seminarId}/material-requests")
    @PreAuthorize("hasAnyRole('LOGISTICS_COORDINATOR', 'MATERIALS_STAFF')")
    public List<MaterialRequestResponse> getBySeminar(@PathVariable Long seminarId) {
        return materialRequestService.getBySeminar(seminarId);
    }

    @PatchMapping("/material-requests/{id}/shipment-status")
    @PreAuthorize("hasRole('MATERIALS_STAFF')")
    public MaterialRequestResponse updateShipmentStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateShipmentStatusRequest request
    ) {
        return materialRequestService.updateShipmentStatus(id, request);
    }

    @PatchMapping("/material-requests/{id}/confirm-delivered")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public MaterialRequestResponse confirmDelivered(
            @PathVariable Long id,
            @Valid @RequestBody ConfirmDeliveryRequest request
    ) {
        return materialRequestService.confirmDelivered(id, request);
    }
}
