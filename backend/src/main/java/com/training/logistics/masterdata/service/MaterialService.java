package com.training.logistics.masterdata.service;

import com.training.logistics.common.exception.ConflictException;
import com.training.logistics.common.exception.ResourceNotFoundException;
import com.training.logistics.masterdata.dto.request.MaterialRequest;
import com.training.logistics.masterdata.dto.response.MaterialResponse;
import com.training.logistics.masterdata.model.Material;
import com.training.logistics.masterdata.repository.MaterialRepository;
import com.training.logistics.masterdata.repository.MaterialRequirementRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final MaterialRequirementRepository requirementRepository;

    public MaterialService(MaterialRepository materialRepository, MaterialRequirementRepository requirementRepository) {
        this.materialRepository = materialRepository;
        this.requirementRepository = requirementRepository;
    }

    @Transactional(readOnly = true)
    public List<MaterialResponse> getAll() {
        return materialRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MaterialResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    public MaterialResponse create(MaterialRequest request) {
        Material material = new Material();
        applyRequest(material, request);
        return toResponse(materialRepository.save(material));
    }

    public MaterialResponse update(Long id, MaterialRequest request) {
        Material material = findEntity(id);
        applyRequest(material, request);
        return toResponse(materialRepository.save(material));
    }

    public void delete(Long id) {
        Material material = findEntity(id);
        if (requirementRepository.existsByMaterial_Id(id)) {
            throw new ConflictException("Material is still referenced by requirements");
        }
        materialRepository.delete(material);
    }

    private Material findEntity(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material not found: " + id));
    }

    private void applyRequest(Material material, MaterialRequest request) {
        material.setMaterialName(MasterDataValidation.requireNotBlank(request.materialName(), "materialName"));
        material.setMaterialType(MasterDataValidation.requireNotBlank(request.materialType(), "materialType"));
        material.setDescription(request.description());
        material.setUnit(MasterDataValidation.requireNotBlank(request.unit(), "unit"));
    }

    private MaterialResponse toResponse(Material material) {
        return new MaterialResponse(
                material.getId(),
                material.getMaterialName(),
                material.getMaterialType(),
                material.getDescription(),
                material.getUnit()
        );
    }
}
