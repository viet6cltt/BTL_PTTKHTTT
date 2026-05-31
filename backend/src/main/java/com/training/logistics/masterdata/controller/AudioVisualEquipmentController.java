package com.training.logistics.masterdata.controller;

import com.training.logistics.masterdata.dto.request.AudioVisualEquipmentRequest;
import com.training.logistics.masterdata.dto.response.AudioVisualEquipmentResponse;
import com.training.logistics.masterdata.service.AudioVisualEquipmentService;
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
@RequestMapping("/api/master-data/audio-visual-equipments")
public class AudioVisualEquipmentController {

    private final AudioVisualEquipmentService equipmentService;

    public AudioVisualEquipmentController(AudioVisualEquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @GetMapping
    public List<AudioVisualEquipmentResponse> getAll() {
        return equipmentService.getAll();
    }

    @GetMapping("/{id}")
    public AudioVisualEquipmentResponse getById(@PathVariable Long id) {
        return equipmentService.getById(id);
    }

    @PostMapping
    public ResponseEntity<AudioVisualEquipmentResponse> create(
            @Valid @RequestBody AudioVisualEquipmentRequest request
    ) {
        AudioVisualEquipmentResponse response = equipmentService.create(request);
        return ResponseEntity
                .created(URI.create("/api/master-data/audio-visual-equipments/" + response.id()))
                .body(response);
    }

    @PutMapping("/{id}")
    public AudioVisualEquipmentResponse update(
            @PathVariable Long id,
            @Valid @RequestBody AudioVisualEquipmentRequest request
    ) {
        return equipmentService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        equipmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
