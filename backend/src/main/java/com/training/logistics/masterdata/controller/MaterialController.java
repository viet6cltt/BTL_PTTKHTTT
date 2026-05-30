package com.training.logistics.masterdata.controller;

import com.training.logistics.masterdata.dto.request.MaterialRequest;
import com.training.logistics.masterdata.dto.response.MaterialResponse;
import com.training.logistics.masterdata.service.MaterialService;
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
@RequestMapping("/api/master-data/materials")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping
    public List<MaterialResponse> getAll() {
        return materialService.getAll();
    }

    @GetMapping("/{id}")
    public MaterialResponse getById(@PathVariable Long id) {
        return materialService.getById(id);
    }

    @PostMapping
    public ResponseEntity<MaterialResponse> create(@Valid @RequestBody MaterialRequest request) {
        MaterialResponse response = materialService.create(request);
        return ResponseEntity
                .created(URI.create("/api/master-data/materials/" + response.id()))
                .body(response);
    }

    @PutMapping("/{id}")
    public MaterialResponse update(@PathVariable Long id, @Valid @RequestBody MaterialRequest request) {
        return materialService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        materialService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
