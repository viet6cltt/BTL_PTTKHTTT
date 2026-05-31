package com.training.logistics.seminar.controller;

import com.training.logistics.seminar.dto.request.SeminarCreateRequest;
import com.training.logistics.seminar.dto.request.SeminarUpdateRequest;
import com.training.logistics.seminar.dto.response.SeminarRequirementsPreviewResponse;
import com.training.logistics.seminar.dto.response.SeminarResponse;
import com.training.logistics.seminar.service.SeminarService;
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
@RequestMapping("/api/seminars")
public class SeminarController {

    private final SeminarService seminarService;

    public SeminarController(SeminarService seminarService) {
        this.seminarService = seminarService;
    }

    @GetMapping
    public List<SeminarResponse> getAll() {
        return seminarService.getAll();
    }

    @GetMapping("/{id}")
    public SeminarResponse getById(@PathVariable Long id) {
        return seminarService.getById(id);
    }

    @PostMapping
    public ResponseEntity<SeminarResponse> create(@Valid @RequestBody SeminarCreateRequest request) {
        SeminarResponse response = seminarService.create(request);
        return ResponseEntity
                .created(URI.create("/api/seminars/" + response.id()))
                .body(response);
    }

    @PutMapping("/{id}")
    public SeminarResponse update(@PathVariable Long id, @Valid @RequestBody SeminarUpdateRequest request) {
        return seminarService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        seminarService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/requirements-preview")
    public SeminarRequirementsPreviewResponse getRequirementsPreview(@PathVariable Long id) {
        return seminarService.getRequirementsPreview(id);
    }
}
