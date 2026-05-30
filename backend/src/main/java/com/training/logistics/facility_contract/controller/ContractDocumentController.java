package com.training.logistics.facility_contract.controller;

import com.training.logistics.facility_contract.dto.ContractDocumentResponse;
import com.training.logistics.facility_contract.service.ContractDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/facility-contract/contracts/{contractId}/document")
@RequiredArgsConstructor
public class ContractDocumentController {
    private final ContractDocumentService contractDocumentService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<ContractDocumentResponse> uploadContractDocument(
            @PathVariable Long contractId,
            @RequestParam MultipartFile file,
            @RequestParam(required = false) String notes,
            @RequestParam(defaultValue = "false") boolean markAsSigned) {
        return ResponseEntity.ok(contractDocumentService.uploadContractDocument(contractId, file, notes, markAsSigned));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<ContractDocumentResponse> getContractDocument(@PathVariable Long contractId) {
        return ResponseEntity.ok(contractDocumentService.getContractDocument(contractId));
    }

    @GetMapping("/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'LOGISTICS_COORDINATOR')")
    public ResponseEntity<?> downloadContractDocument(@PathVariable Long contractId) {
        ContractDocumentService.DownloadedContractDocument document = contractDocumentService.downloadContractDocument(contractId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(document.fileName())
                        .build()
                        .toString())
                .body(document.resource());
    }

    @DeleteMapping
    @PreAuthorize("hasRole('LOGISTICS_COORDINATOR')")
    public ResponseEntity<Void> deleteContractDocument(@PathVariable Long contractId) {
        contractDocumentService.deleteContractDocument(contractId);
        return ResponseEntity.noContent().build();
    }
}
