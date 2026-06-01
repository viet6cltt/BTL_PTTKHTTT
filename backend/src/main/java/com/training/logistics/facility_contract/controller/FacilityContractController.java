package com.training.logistics.facility_contract.controller;

import com.training.logistics.facility_contract.dto.CreateFacilityContractRequest;
import com.training.logistics.facility_contract.dto.FacilityContractResponse;
import com.training.logistics.facility_contract.dto.RejectFacilityContractRequest;
import com.training.logistics.facility_contract.service.FacilityContractService;
import com.training.logistics.facility_contract.service.MinioStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1/facility-contracts")
@RequiredArgsConstructor
public class FacilityContractController {
    private final FacilityContractService facilityContractService;
    private final MinioStorageService minioStorageService;

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

    @GetMapping({"/view-file", "/view-doc"})
    public ResponseEntity<InputStreamResource> viewFile(@RequestParam String path) {
        String objectName = minioStorageService.extractObjectName(path);
        if (objectName == null) {
            objectName = path;
        }

        InputStream stream = minioStorageService.downloadFile(objectName);
        return ResponseEntity.ok()
                .contentType(mediaTypeFor(objectName))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filenameOf(objectName) + "\"")
                .body(new InputStreamResource(stream));
    }

    private MediaType mediaTypeFor(String objectName) {
        String lowerName = objectName.toLowerCase();
        if (lowerName.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        }
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG;
        }
        if (lowerName.endsWith(".gif")) {
            return MediaType.IMAGE_GIF;
        }
        if (lowerName.endsWith(".pdf")) {
            return MediaType.APPLICATION_PDF;
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }

    private String filenameOf(String objectName) {
        return Paths.get(objectName).getFileName().toString().replace("\"", "");
    }
}
