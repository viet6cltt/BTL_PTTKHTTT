package com.training.logistics.facility_contract.controller;

import com.training.logistics.facility_contract.dto.FacilityCreateRequest;
import com.training.logistics.facility_contract.dto.FacilityResponse;
import com.training.logistics.facility_contract.service.FacilityService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/facility-contract/facilities")
@RequiredArgsConstructor
public class FacilityController {
    private final FacilityService facilityService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FacilityResponse> createFacility(@Valid @RequestBody FacilityCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facilityService.createFacility(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<List<FacilityResponse>> getAllFacilities() {
        return ResponseEntity.ok(facilityService.getAllFacilities());
    }

    @GetMapping("/{facilityId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<FacilityResponse> getFacilityById(@PathVariable Long facilityId) {
        return ResponseEntity.ok(facilityService.getFacilityById(facilityId));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<List<FacilityResponse>> searchFacilities(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String name) {
        return ResponseEntity.ok(facilityService.searchFacilities(city, name));
    }

    @PutMapping("/{facilityId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FacilityResponse> updateFacility(
            @PathVariable Long facilityId,
            @Valid @RequestBody FacilityCreateRequest request) {
        return ResponseEntity.ok(facilityService.updateFacility(facilityId, request));
    }

    @DeleteMapping("/{facilityId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFacility(@PathVariable Long facilityId) {
        facilityService.deleteFacility(facilityId);
        return ResponseEntity.noContent().build();
    }
}
