package com.training.logistics.masterdata.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.training.logistics.common.exception.BadRequestException;
import com.training.logistics.common.exception.ConflictException;
import com.training.logistics.common.exception.ResourceNotFoundException;
import com.training.logistics.masterdata.dto.request.AudioVisualEquipmentRequest;
import com.training.logistics.masterdata.dto.request.AvEquipmentRequirementRequest;
import com.training.logistics.masterdata.dto.request.MaterialRequest;
import com.training.logistics.masterdata.dto.request.MaterialRequirementRequest;
import com.training.logistics.masterdata.dto.request.SeminarTypeRequest;
import com.training.logistics.masterdata.dto.response.AudioVisualEquipmentResponse;
import com.training.logistics.masterdata.dto.response.MaterialResponse;
import com.training.logistics.masterdata.dto.response.SeminarTypeResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MasterDataServiceIntegrationTest {

    @Autowired
    private SeminarTypeService seminarTypeService;

    @Autowired
    private MaterialService materialService;

    @Autowired
    private AudioVisualEquipmentService equipmentService;

    @Autowired
    private MaterialRequirementService materialRequirementService;

    @Autowired
    private AvEquipmentRequirementService avRequirementService;

    @Test
    void supportsCreateUpdateAndDeleteForMasterResources() {
        SeminarTypeResponse seminarType = seminarTypeService.create(
                new SeminarTypeRequest(" Workshop ", "Initial", 3, "Rows")
        );
        assertThat(seminarType.typeName()).isEqualTo("Workshop");

        SeminarTypeResponse updatedSeminarType = seminarTypeService.update(
                seminarType.id(),
                new SeminarTypeRequest("Seminar", "Updated", 4, "U-shape")
        );
        assertThat(updatedSeminarType.durationHours()).isEqualTo(4);
        seminarTypeService.delete(seminarType.id());
        assertThatThrownBy(() -> seminarTypeService.getById(seminarType.id()))
                .isInstanceOf(ResourceNotFoundException.class);

        MaterialResponse material = materialService.create(
                new MaterialRequest("Workbook", "Printed", "Participant handout", "book")
        );
        assertThat(materialService.update(
                material.id(),
                new MaterialRequest("Workbook v2", "Printed", "Revised", "book")
        ).materialName()).isEqualTo("Workbook v2");
        materialService.delete(material.id());

        AudioVisualEquipmentResponse equipment = equipmentService.create(
                new AudioVisualEquipmentRequest("Projector", "Display", "unit")
        );
        assertThat(equipmentService.update(
                equipment.id(),
                new AudioVisualEquipmentRequest("Laser Projector", "Display", "unit")
        ).equipmentName()).isEqualTo("Laser Projector");
        equipmentService.delete(equipment.id());
    }

    @Test
    void supportsRequirementCreateUpdateAndDeletePaths() {
        SeminarTypeResponse seminarType = createSeminarType();
        MaterialResponse material = createMaterial();
        AudioVisualEquipmentResponse equipment = createEquipment();

        var materialRequirement = materialRequirementService.create(
                seminarType.id(),
                new MaterialRequirementRequest(material.id(), 1, false, null, "Before class")
        );
        assertThat(materialRequirement.materialName()).isEqualTo("Workbook");
        assertThat(materialRequirement.notes()).isEqualTo("Before class");

        var updatedMaterialRequirement = materialRequirementService.update(
                seminarType.id(),
                material.id(),
                new MaterialRequirementRequest(material.id(), 2, true, 10, "One per ten")
        );
        assertThat(updatedMaterialRequirement.participantPerQuantity()).isEqualTo(10);
        materialRequirementService.delete(seminarType.id(), material.id());
        assertThatThrownBy(() -> materialRequirementService.getById(seminarType.id(), material.id()))
                .isInstanceOf(ResourceNotFoundException.class);

        var avRequirement = avRequirementService.create(
                seminarType.id(),
                new AvEquipmentRequirementRequest(equipment.id(), 1, false, null)
        );
        assertThat(avRequirement.equipmentName()).isEqualTo("Projector");

        var updatedAvRequirement = avRequirementService.update(
                seminarType.id(),
                equipment.id(),
                new AvEquipmentRequirementRequest(equipment.id(), 2, true, 25)
        );
        assertThat(updatedAvRequirement.quantityRequired()).isEqualTo(2);
        avRequirementService.delete(seminarType.id(), equipment.id());
    }

    @Test
    void rejectsMissingReferencesAndDuplicateRequirements() {
        SeminarTypeResponse seminarType = createSeminarType();
        MaterialResponse material = createMaterial();

        assertThatThrownBy(() -> materialRequirementService.create(
                999L,
                new MaterialRequirementRequest(material.id(), 1, false, null, null)
        )).isInstanceOf(ResourceNotFoundException.class);

        assertThatThrownBy(() -> materialRequirementService.create(
                seminarType.id(),
                new MaterialRequirementRequest(999L, 1, false, null, null)
        )).isInstanceOf(ResourceNotFoundException.class);

        materialRequirementService.create(
                seminarType.id(),
                new MaterialRequirementRequest(material.id(), 1, false, null, null)
        );
        assertThatThrownBy(() -> materialRequirementService.create(
                seminarType.id(),
                new MaterialRequirementRequest(material.id(), 2, false, null, null)
        )).isInstanceOf(ConflictException.class);
    }

    @Test
    void rejectsInvalidParticipantDependencyCombinations() {
        SeminarTypeResponse seminarType = createSeminarType();
        MaterialResponse material = createMaterial();
        AudioVisualEquipmentResponse equipment = createEquipment();

        assertThatThrownBy(() -> materialRequirementService.create(
                seminarType.id(),
                new MaterialRequirementRequest(material.id(), 1, true, null, null)
        )).isInstanceOf(BadRequestException.class);

        assertThatThrownBy(() -> materialRequirementService.create(
                seminarType.id(),
                new MaterialRequirementRequest(material.id(), 1, false, 5, null)
        )).isInstanceOf(BadRequestException.class);

        assertThatThrownBy(() -> avRequirementService.create(
                seminarType.id(),
                new AvEquipmentRequirementRequest(equipment.id(), 1, true, 0)
        )).isInstanceOf(BadRequestException.class);
    }

    @Test
    void blocksDeletingMasterRowsThatAreStillReferencedByRequirements() {
        SeminarTypeResponse seminarType = createSeminarType();
        MaterialResponse material = createMaterial();
        AudioVisualEquipmentResponse equipment = createEquipment();

        materialRequirementService.create(
                seminarType.id(),
                new MaterialRequirementRequest(material.id(), 1, false, null, null)
        );
        avRequirementService.create(
                seminarType.id(),
                new AvEquipmentRequirementRequest(equipment.id(), 1, false, null)
        );

        assertThatThrownBy(() -> seminarTypeService.delete(seminarType.id()))
                .isInstanceOf(ConflictException.class);
        assertThatThrownBy(() -> materialService.delete(material.id()))
                .isInstanceOf(ConflictException.class);
        assertThatThrownBy(() -> equipmentService.delete(equipment.id()))
                .isInstanceOf(ConflictException.class);
    }

    private SeminarTypeResponse createSeminarType() {
        return seminarTypeService.create(new SeminarTypeRequest("Course", "Core training", 8, "Classroom"));
    }

    private MaterialResponse createMaterial() {
        return materialService.create(new MaterialRequest("Workbook", "Printed", "Exercises", "book"));
    }

    private AudioVisualEquipmentResponse createEquipment() {
        return equipmentService.create(new AudioVisualEquipmentRequest("Projector", "Display", "unit"));
    }
}
