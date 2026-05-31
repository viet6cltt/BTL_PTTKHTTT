package com.training.logistics.facility_contract.controller;

import com.training.logistics.facility_contract.dto.CreateFacilityContractRequest;
import com.training.logistics.facility_contract.dto.FacilityContractResponse;
import com.training.logistics.facility_contract.dto.RejectFacilityContractRequest;
import com.training.logistics.facility_contract.service.FacilityContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/facility-contracts")
@RequiredArgsConstructor
public class FacilityContractController {
    private final FacilityContractService facilityContractService;

    @PostMapping
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<FacilityContractResponse> createContract(@Valid @RequestBody CreateFacilityContractRequest request) {
        return ResponseEntity.ok(facilityContractService.createContract(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('LOGISTICS_COORDINATOR', 'ADMIN')")
    public ResponseEntity<FacilityContractResponse> getContractById(@PathVariable Long id) {
        return ResponseEntity.ok(facilityContractService.getContractById(id));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<FacilityContractResponse> approveContract(
            @PathVariable Long id,
            @RequestParam MultipartFile file,
            @RequestParam BigDecimal totalCost,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(facilityContractService.approveContract(id, file, totalCost, notes));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<FacilityContractResponse> rejectContract(
            @PathVariable Long id,
            @Valid @RequestBody RejectFacilityContractRequest request) {
        return ResponseEntity.ok(facilityContractService.rejectContract(id, request));
    }
}
