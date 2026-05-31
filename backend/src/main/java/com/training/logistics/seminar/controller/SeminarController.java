package com.training.logistics.seminar.controller;

import com.training.logistics.seminar.dto.request.AssignCoordinatorRequest;
import com.training.logistics.seminar.dto.request.SeminarCreateRequest;
import com.training.logistics.seminar.dto.request.UpdateSeminarStatusRequest;
import com.training.logistics.seminar.dto.response.SeminarResponse;
import com.training.logistics.seminar.model.SeminarStatus;
import com.training.logistics.seminar.service.SeminarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.training.logistics.seminar.dto.response.SeminarRequirementsPreviewResponse;

@RestController
@RequestMapping("/api/v1/seminars")
@RequiredArgsConstructor
public class SeminarController {
    private final SeminarService seminarService;

    @PostMapping
    @PreAuthorize("hasAnyRole('BOOKING_STAFF', 'ADMIN')")
    public ResponseEntity<SeminarResponse> create(@Valid @RequestBody SeminarCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(seminarService.create(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('BOOKING_STAFF', 'LOGISTICS_COORDINATOR', 'ADMIN')")
    public ResponseEntity<Page<SeminarResponse>> search(
            @RequestParam(required = false) SeminarStatus status,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Long coordinatorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(seminarService.search(
                status,
                city,
                coordinatorId,
                PageRequest.of(Math.max(page, 0), size < 1 ? 20 : size)
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SeminarResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(seminarService.getById(id));
    }

    @GetMapping("/{id}/requirements-preview")
    @PreAuthorize("hasAnyRole('LOGISTICS_COORDINATOR', 'ADMIN')")
    public ResponseEntity<SeminarRequirementsPreviewResponse> getRequirementsPreview(@PathVariable Long id) {
        return ResponseEntity.ok(seminarService.getRequirementsPreview(id));
    }

    @PutMapping("/{id}/assign-coordinator")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<SeminarResponse> assignCoordinator(
            @PathVariable Long id,
            @Valid @RequestBody AssignCoordinatorRequest request) {
        return ResponseEntity.ok(seminarService.assignCoordinator(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SeminarResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSeminarStatusRequest request) {
        return ResponseEntity.ok(seminarService.updateStatus(id, request));
    }
}
