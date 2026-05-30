package com.training.logistics.facility_contract.service;

import com.training.logistics.facility_contract.dto.AudioVisualEquipmentRequest;
import com.training.logistics.facility_contract.dto.AudioVisualEquipmentResponse;
import com.training.logistics.facility_contract.exception.FacilityContractNotFoundException;
import com.training.logistics.facility_contract.mapper.FacilityContractMapper;
import com.training.logistics.facility_contract.model.AudioVisualEquipment;
import com.training.logistics.facility_contract.repository.AudioVisualEquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AvEquipmentService {
    private final AudioVisualEquipmentRepository equipmentRepository;

    @Transactional
    public AudioVisualEquipmentResponse createEquipment(AudioVisualEquipmentRequest request) {
        AudioVisualEquipment equipment = AudioVisualEquipment.builder().build();
        applyEquipmentRequest(equipment, request);
        return FacilityContractMapper.toEquipmentResponse(equipmentRepository.save(equipment));
    }

    @Transactional
    public AudioVisualEquipmentResponse updateEquipment(Long equipmentId, AudioVisualEquipmentRequest request) {
        AudioVisualEquipment equipment = findEquipment(equipmentId);
        applyEquipmentRequest(equipment, request);
        return FacilityContractMapper.toEquipmentResponse(equipment);
    }

    @Transactional
    public void deleteEquipment(Long equipmentId) {
        equipmentRepository.delete(findEquipment(equipmentId));
    }

    @Transactional(readOnly = true)
    public AudioVisualEquipmentResponse getEquipmentById(Long equipmentId) {
        return FacilityContractMapper.toEquipmentResponse(findEquipment(equipmentId));
    }

    @Transactional(readOnly = true)
    public List<AudioVisualEquipmentResponse> getAllEquipments() {
        return equipmentRepository.findAll().stream()
                .map(FacilityContractMapper::toEquipmentResponse)
                .toList();
    }

    public AudioVisualEquipment findEquipment(Long equipmentId) {
        return equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new FacilityContractNotFoundException("AV equipment not found"));
    }

    private void applyEquipmentRequest(AudioVisualEquipment equipment, AudioVisualEquipmentRequest request) {
        equipment.setEquipmentName(request.getEquipmentName().trim());
        equipment.setEquipmentType(trim(request.getEquipmentType()));
        equipment.setUnit(trim(request.getUnit()));
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
