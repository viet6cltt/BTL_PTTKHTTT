package com.training.logistics.masterdata.controller;

import com.training.logistics.masterdata.dto.request.SeminarTypeRequest;
import com.training.logistics.masterdata.dto.response.SeminarTypeResponse;
import com.training.logistics.masterdata.service.SeminarTypeService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/master-data/seminar-types")
public class SeminarTypeController {

    private final SeminarTypeService seminarTypeService;

    public SeminarTypeController(SeminarTypeService seminarTypeService) {
        this.seminarTypeService = seminarTypeService;
    }

    @GetMapping
    public List<SeminarTypeResponse> getAll() {
        return seminarTypeService.getAll();
    }

    @GetMapping("/{id}")
    public SeminarTypeResponse getById(@PathVariable Long id) {
        return seminarTypeService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SeminarTypeResponse> create(@Valid @RequestBody SeminarTypeRequest request) {
        SeminarTypeResponse response = seminarTypeService.create(request);
        return ResponseEntity
                .created(URI.create("/api/master-data/seminar-types/" + response.id()))
                .body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public SeminarTypeResponse update(@PathVariable Long id, @Valid @RequestBody SeminarTypeRequest request) {
        return seminarTypeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        seminarTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
