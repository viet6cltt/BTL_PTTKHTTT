package com.training.logistics.travel.controller;

import com.training.logistics.travel.dto.ConsultantResponse;
import com.training.logistics.travel.dto.UpdateConsultantProfileRequest;
import com.training.logistics.travel.dto.UpdateMyConsultantProfileRequest;
import com.training.logistics.travel.service.ConsultantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/consultants")
@RequiredArgsConstructor
public class ConsultantController {
    private final ConsultantService consultantService;

    @GetMapping
    @PreAuthorize("hasAnyRole('BOOKING_STAFF', 'LOGISTICS_COORDINATOR', 'ADMIN')")
    public ResponseEntity<Page<ConsultantResponse>> searchConsultants(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(consultantService.searchConsultants(
                specialty,
                city,
                PageRequest.of(Math.max(page, 0), size < 1 ? 20 : size)
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('LOGISTICS_COORDINATOR', 'ADMIN', 'CONSULTANT')")
    public ResponseEntity<ConsultantResponse> getConsultantById(@PathVariable Long id) {
        return ResponseEntity.ok(consultantService.getConsultantById(id));
    }

    @GetMapping("/by-user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConsultantResponse> getConsultantByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(consultantService.getConsultantByUserId(userId));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CONSULTANT')")
    public ResponseEntity<ConsultantResponse> updateMyProfile(
            @Valid @RequestBody UpdateMyConsultantProfileRequest request) {
        return ResponseEntity.ok(consultantService.updateMyProfile(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConsultantResponse> updateConsultant(
            @PathVariable Long id,
            @Valid @RequestBody UpdateConsultantProfileRequest request) {
        return ResponseEntity.ok(consultantService.updateConsultant(id, request));
    }

    @PutMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConsultantResponse> updateConsultantAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(consultantService.updateConsultantAvatar(id, file));
    }
}
