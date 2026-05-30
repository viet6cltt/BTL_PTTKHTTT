package com.training.logistics.materialrequest.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.groups.Tuple.tuple;

import com.training.logistics.auth.model.User;
import com.training.logistics.auth.repository.UserRepository;
import com.training.logistics.common.exception.BadRequestException;
import com.training.logistics.common.exception.ConflictException;
import com.training.logistics.common.exception.ResourceNotFoundException;
import com.training.logistics.masterdata.dto.request.MaterialRequirementRequest;
import com.training.logistics.masterdata.dto.request.MaterialRequest;
import com.training.logistics.masterdata.dto.request.SeminarTypeRequest;
import com.training.logistics.masterdata.dto.response.MaterialResponse;
import com.training.logistics.masterdata.dto.response.SeminarTypeResponse;
import com.training.logistics.masterdata.service.MaterialRequirementService;
import com.training.logistics.masterdata.service.MaterialService;
import com.training.logistics.masterdata.service.SeminarTypeService;
import com.training.logistics.materialrequest.dto.request.ConfirmDeliveryRequest;
import com.training.logistics.materialrequest.dto.request.MaterialRequestCreateRequest;
import com.training.logistics.materialrequest.dto.request.MaterialRequestItemRequest;
import com.training.logistics.materialrequest.dto.response.MaterialRequestResponse;
import com.training.logistics.materialrequest.model.ShipmentStatus;
import com.training.logistics.seminar.dto.request.ConsultantRequest;
import com.training.logistics.seminar.dto.request.SeminarCreateRequest;
import com.training.logistics.seminar.dto.response.ConsultantResponse;
import com.training.logistics.seminar.dto.response.SeminarResponse;
import com.training.logistics.seminar.service.ConsultantService;
import com.training.logistics.seminar.service.SeminarService;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MaterialRequestServiceIntegrationTest {

    @Autowired
    private MaterialRequestService materialRequestService;

    @Autowired
    private SeminarService seminarService;

    @Autowired
    private ConsultantService consultantService;

    @Autowired
    private SeminarTypeService seminarTypeService;

    @Autowired
    private MaterialService materialService;

    @Autowired
    private MaterialRequirementService materialRequirementService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void autoGeneratesItemsFromMaterialRequirementsUsingCeilingAndFixedQuantities() {
        ReferenceData refs = createReferenceData(26);
        MaterialResponse workbook = createMaterial("Participant Workbook");
        MaterialResponse flipchart = createMaterial("Flipchart Pad");
        materialRequirementService.create(
                refs.seminarType.id(),
                new MaterialRequirementRequest(workbook.id(), 1, true, 10, "One per ten participants")
        );
        materialRequirementService.create(
                refs.seminarType.id(),
                new MaterialRequirementRequest(flipchart.id(), 2, false, null, "Room setup")
        );

        MaterialRequestResponse response = materialRequestService.create(
                refs.seminar.id(),
                createRequest(null)
        );

        assertThat(response.shipmentStatus()).isEqualTo(ShipmentStatus.REQUESTED);
        assertThat(response.requestDate()).isEqualTo(LocalDate.now());
        assertThat(response.items())
                .extracting("materialName", "requestedQuantity", "unit", "notes")
                .containsExactly(
                        tuple("Flipchart Pad", 2, "unit", "Room setup"),
                        tuple("Participant Workbook", 3, "unit", "One per ten participants")
                );
    }

    @Test
    void usesExplicitCoordinatorItemOverrides() {
        ReferenceData refs = createReferenceData(12);
        MaterialResponse workbook = createMaterial("Override Workbook");
        MaterialResponse badge = createMaterial("Override Badge");

        MaterialRequestResponse response = materialRequestService.create(
                refs.seminar.id(),
                createRequest(List.of(
                        new MaterialRequestItemRequest(workbook.id(), 7, "Extra copies"),
                        new MaterialRequestItemRequest(badge.id(), 12, "One per learner")
                ))
        );

        assertThat(response.items())
                .extracting("materialId", "materialName", "requestedQuantity", "notes")
                .containsExactly(
                        tuple(workbook.id(), "Override Workbook", 7, "Extra copies"),
                        tuple(badge.id(), "Override Badge", 12, "One per learner")
                );
    }

    @Test
    void rejectsInvalidSeminarMaterialDatesAndQuantities() {
        ReferenceData refs = createReferenceData(12);
        MaterialResponse workbook = createMaterial("Validation Workbook");

        assertThatThrownBy(() -> materialRequestService.create(999999L, createRequest(null)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Seminar not found");
        assertThatThrownBy(() -> materialRequestService.create(
                refs.seminar.id(),
                createRequest(List.of(new MaterialRequestItemRequest(999999L, 1, null)))
        )).isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Material not found");
        assertThatThrownBy(() -> materialRequestService.create(
                refs.seminar.id(),
                createRequest(List.of(new MaterialRequestItemRequest(workbook.id(), 0, null)))
        )).isInstanceOf(BadRequestException.class)
                .hasMessageContaining("requestedQuantity");
        assertThatThrownBy(() -> materialRequestService.create(
                refs.seminar.id(),
                new MaterialRequestCreateRequest(
                        LocalDate.now().minusDays(1),
                        null,
                        List.of(new MaterialRequestItemRequest(workbook.id(), 1, null))
                )
        )).isInstanceOf(BadRequestException.class)
                .hasMessageContaining("neededByDate");
    }

    @Test
    void confirmsDeliveryAndRejectsReconfirmation() {
        ReferenceData refs = createReferenceData(12);
        MaterialResponse workbook = createMaterial("Delivery Workbook");
        MaterialRequestResponse created = materialRequestService.create(
                refs.seminar.id(),
                createRequest(List.of(new MaterialRequestItemRequest(workbook.id(), 1, null)))
        );

        MaterialRequestResponse delivered = materialRequestService.confirmDelivered(
                created.id(),
                new ConfirmDeliveryRequest("Materials received by facility")
        );

        assertThat(delivered.shipmentStatus()).isEqualTo(ShipmentStatus.DELIVERED);
        assertThat(delivered.deliveredConfirmedAt()).isNotNull();
        assertThat(delivered.updatedAt()).isAfter(created.updatedAt());
        assertThat(delivered.deliveryConfirmationNote()).isEqualTo("Materials received by facility");

        assertThatThrownBy(() -> materialRequestService.confirmDelivered(
                created.id(),
                new ConfirmDeliveryRequest("Second confirmation")
        )).isInstanceOf(ConflictException.class);
    }

    private MaterialRequestCreateRequest createRequest(List<MaterialRequestItemRequest> items) {
        return new MaterialRequestCreateRequest(
                LocalDate.now().plusDays(7),
                "Prepare before class",
                items
        );
    }

    private ReferenceData createReferenceData(int anticipatedRegistrants) {
        long suffix = System.nanoTime();
        Long bookingUserId = suffix;
        Long employeeUserId = suffix + 1;
        userRepository.save(User.builder()
                .id(bookingUserId)
                .fullName("Material Booking User")
                .email("material-booking-" + suffix + "@example.com")
                .passwordHash("hash")
                .build());
        userRepository.save(User.builder()
                .id(employeeUserId)
                .fullName("Material Coordinator")
                .email("material-coordinator-" + suffix + "@example.com")
                .passwordHash("hash")
                .build());
        SeminarTypeResponse seminarType = seminarTypeService.create(
                new SeminarTypeRequest("Material Course " + suffix, "Materials", 8, "Classroom")
        );
        ConsultantResponse consultant = consultantService.create(
                new ConsultantRequest("Material Consultant " + suffix, "0901", "consultant-" + suffix + "@example.com", null, "Hanoi", "Vietnam", "Trainer")
        );
        SeminarResponse seminar = seminarService.create(new SeminarCreateRequest(
                seminarType.id(),
                consultant.id(),
                bookingUserId,
                employeeUserId,
                "Material Seminar " + suffix,
                LocalDate.now().plusDays(3),
                LocalDate.now().plusDays(4),
                "Hanoi",
                anticipatedRegistrants
        ));
        return new ReferenceData(seminarType, seminar, employeeUserId);
    }

    private MaterialResponse createMaterial(String name) {
        return materialService.create(new MaterialRequest(name, "Printed", "Description", "unit"));
    }

    private record ReferenceData(
            SeminarTypeResponse seminarType,
            SeminarResponse seminar,
            Long employeeUserId
    ) {
    }
}
