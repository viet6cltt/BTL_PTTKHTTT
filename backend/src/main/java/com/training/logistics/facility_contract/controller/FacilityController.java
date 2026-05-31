package com.training.logistics.facility_contract.controller;

import com.training.logistics.facility_contract.dto.FacilityCreateRequest;
import com.training.logistics.facility_contract.dto.FacilityResponse;
import com.training.logistics.facility_contract.dto.FacilitySearchRequest;
import com.training.logistics.facility_contract.service.FacilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/facilities")
@RequiredArgsConstructor
public class FacilityController {
    private final FacilityService facilityService;

    @GetMapping
    @PreAuthorize("hasAnyRole('LOGISTICS_COORDINATOR', 'ADMIN')")
    public ResponseEntity<Page<FacilityResponse>> searchFacilities(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer capacity,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) String timeSlot,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        FacilitySearchRequest request = new FacilitySearchRequest();
        request.setCity(city);
        request.setCapacity(capacity);
        request.setDate(date);
        request.setTimeSlot(timeSlot);
        request.setPage(page);
        request.setSize(size);
        return ResponseEntity.ok(facilityService.searchFacilities(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('LOGISTICS_COORDINATOR', 'ADMIN')")
    public ResponseEntity<FacilityResponse> getFacilityById(@PathVariable Long id) {
        return ResponseEntity.ok(facilityService.getFacilityById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<FacilityResponse> createFacility(@Valid @RequestBody FacilityCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facilityService.createFacility(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<FacilityResponse> updateFacility(
            @PathVariable Long id,
            @Valid @RequestBody FacilityCreateRequest request) {
        return ResponseEntity.ok(facilityService.updateFacility(id, request));
    }
}
