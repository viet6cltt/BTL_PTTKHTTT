package com.training.logistics.masterdata.service;

import com.training.logistics.common.exception.ConflictException;
import com.training.logistics.common.exception.ResourceNotFoundException;
import com.training.logistics.masterdata.dto.request.AudioVisualEquipmentRequest;
import com.training.logistics.masterdata.dto.response.AudioVisualEquipmentResponse;
import com.training.logistics.masterdata.model.AudioVisualEquipment;
import com.training.logistics.masterdata.repository.AudioVisualEquipmentRepository;
import com.training.logistics.masterdata.repository.AvEquipmentRequirementRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AudioVisualEquipmentService {

    private final AudioVisualEquipmentRepository equipmentRepository;
    private final AvEquipmentRequirementRepository requirementRepository;

    public AudioVisualEquipmentService(
            AudioVisualEquipmentRepository equipmentRepository,
            AvEquipmentRequirementRepository requirementRepository
    ) {
        this.equipmentRepository = equipmentRepository;
        this.requirementRepository = requirementRepository;
    }

    @Transactional(readOnly = true)
    public List<AudioVisualEquipmentResponse> getAll() {
        return equipmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AudioVisualEquipmentResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    public AudioVisualEquipmentResponse create(AudioVisualEquipmentRequest request) {
        AudioVisualEquipment equipment = new AudioVisualEquipment();
        applyRequest(equipment, request);
        return toResponse(equipmentRepository.save(equipment));
    }

    public AudioVisualEquipmentResponse update(Long id, AudioVisualEquipmentRequest request) {
        AudioVisualEquipment equipment = findEntity(id);
        applyRequest(equipment, request);
        return toResponse(equipmentRepository.save(equipment));
    }

    public void delete(Long id) {
        AudioVisualEquipment equipment = findEntity(id);
        if (requirementRepository.existsByAudioVisualEquipment_Id(id)) {
            throw new ConflictException("Audio-visual equipment is still referenced by requirements");
        }
        equipmentRepository.delete(equipment);
    }

    private AudioVisualEquipment findEntity(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Audio-visual equipment not found: " + id));
    }

    private void applyRequest(AudioVisualEquipment equipment, AudioVisualEquipmentRequest request) {
        equipment.setEquipmentName(MasterDataValidation.requireNotBlank(request.equipmentName(), "equipmentName"));
        equipment.setEquipmentType(MasterDataValidation.requireNotBlank(request.equipmentType(), "equipmentType"));
        equipment.setUnit(MasterDataValidation.requireNotBlank(request.unit(), "unit"));
    }

    private AudioVisualEquipmentResponse toResponse(AudioVisualEquipment equipment) {
        return new AudioVisualEquipmentResponse(
                equipment.getId(),
                equipment.getEquipmentName(),
                equipment.getEquipmentType(),
                equipment.getUnit()
        );
    }
}
