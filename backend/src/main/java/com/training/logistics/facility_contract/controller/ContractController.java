package com.training.logistics.facility_contract.controller;

import com.training.logistics.facility_contract.dto.ContractResponse;
import com.training.logistics.facility_contract.dto.CreateContractRequest;
import com.training.logistics.facility_contract.dto.FinalContractSummaryResponse;
import com.training.logistics.facility_contract.dto.SignContractRequest;
import com.training.logistics.facility_contract.dto.UpdateContractRequest;
import com.training.logistics.facility_contract.service.ContractService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/facility-contract/contracts")
@RequiredArgsConstructor
public class ContractController {
    private final ContractService contractService;

    @PostMapping
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<ContractResponse> createContract(@Valid @RequestBody CreateContractRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contractService.createContract(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<List<ContractResponse>> getAllContracts() {
        return ResponseEntity.ok(contractService.getAllContracts());
    }

    @GetMapping("/{contractId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<ContractResponse> getContractById(@PathVariable Long contractId) {
        return ResponseEntity.ok(contractService.getContractById(contractId));
    }

    @GetMapping("/by-seminar/{seminarId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<ContractResponse> getContractBySeminarId(@PathVariable Long seminarId) {
        return ResponseEntity.ok(contractService.getContractBySeminarId(seminarId));
    }

    @PutMapping("/{contractId}")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<ContractResponse> updateContract(
            @PathVariable Long contractId,
            @Valid @RequestBody UpdateContractRequest request) {
        return ResponseEntity.ok(contractService.updateContract(contractId, request));
    }

    @PatchMapping("/{contractId}/sign")
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<ContractResponse> signContract(
            @PathVariable Long contractId,
            @Valid @RequestBody SignContractRequest request) {
        return ResponseEntity.ok(contractService.signContract(contractId, request.getTotalCost()));
    }

    @DeleteMapping("/{contractId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteContract(@PathVariable Long contractId) {
        contractService.deleteContract(contractId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{contractId}/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<FinalContractSummaryResponse> getFinalContractSummary(@PathVariable Long contractId) {
        return ResponseEntity.ok(contractService.getFinalContractSummary(contractId));
    }
}
