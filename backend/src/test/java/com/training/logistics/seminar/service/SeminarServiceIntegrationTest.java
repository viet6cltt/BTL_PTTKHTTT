package com.training.logistics.seminar.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.training.logistics.auth.model.User;
import com.training.logistics.auth.repository.UserRepository;
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
import com.training.logistics.masterdata.service.AudioVisualEquipmentService;
import com.training.logistics.masterdata.service.AvEquipmentRequirementService;
import com.training.logistics.masterdata.service.MaterialRequirementService;
import com.training.logistics.masterdata.service.MaterialService;
import com.training.logistics.masterdata.service.SeminarTypeService;
import com.training.logistics.seminar.dto.request.ConsultantRequest;
import com.training.logistics.seminar.dto.request.SeminarCreateRequest;
import com.training.logistics.seminar.dto.request.SeminarUpdateRequest;
import com.training.logistics.seminar.dto.response.ConsultantResponse;
import com.training.logistics.seminar.dto.response.SeminarResponse;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class SeminarServiceIntegrationTest {

    @Autowired
    private ConsultantService consultantService;

    @Autowired
    private SeminarService seminarService;

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

    @Autowired
    private UserRepository userRepository;

    @Test
    void supportsConsultantCreateUpdateAndDelete() {
        ConsultantResponse consultant = createConsultant(" Consultant One ");
        assertThat(consultant.fullName()).isEqualTo("Consultant One");

        ConsultantResponse updated = consultantService.update(
                consultant.id(),
                new ConsultantRequest("Consultant Two", "0902", "two@example.com", "2 Main", "Hanoi", "Vietnam", "Coach")
        );
        assertThat(updated.fullName()).isEqualTo("Consultant Two");
        assertThat(updated.email()).isEqualTo("two@example.com");

        consultantService.delete(consultant.id());
        assertThatThrownBy(() -> consultantService.getById(consultant.id()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void supportsSeminarCreateUpdateAndDeleteWithoutChangingCreatorOrBookingDate() {
        ReferenceData refs = createReferenceData();
        SeminarResponse seminar = seminarService.create(createRequest(refs));
        assertThat(seminar.seminarName()).isEqualTo("Architecture Workshop");
        assertThat(seminar.seminarTypeName()).isEqualTo("Architecture");
        assertThat(seminar.consultantFullName()).isEqualTo("Consultant One");
        assertThat(seminar.bookingDepartmentUserFullName()).isEqualTo("Booking User");
        assertThat(seminar.employeeFullName()).isEqualTo("Coordinator User");

        LocalDate bookingCreatedDate = seminar.bookingCreatedDate();
        SeminarResponse updated = seminarService.update(
                seminar.id(),
                new SeminarUpdateRequest(
                        refs.seminarType.id(),
                        refs.consultant.id(),
                        refs.employeeId,
                        "Updated Workshop",
                        LocalDate.of(2026, 7, 11),
                        LocalDate.of(2026, 7, 12),
                        "Da Nang",
                        42
                )
        );
        assertThat(updated.bookingDepartmentUserId()).isEqualTo(refs.bookingUserId);
        assertThat(updated.bookingCreatedDate()).isEqualTo(bookingCreatedDate);
        assertThat(updated.seminarName()).isEqualTo("Updated Workshop");
        assertThat(updated.anticipatedRegistrants()).isEqualTo(42);

        seminarService.delete(seminar.id());
        assertThatThrownBy(() -> seminarService.getById(seminar.id()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void rejectsMissingReferences() {
        ReferenceData refs = createReferenceData();

        assertThatThrownBy(() -> seminarService.create(createRequest(refs, 999L, refs.consultant.id(), refs.bookingUserId, refs.employeeId)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Seminar type not found");
        assertThatThrownBy(() -> seminarService.create(createRequest(refs, refs.seminarType.id(), 999L, refs.bookingUserId, refs.employeeId)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Consultant not found");
        assertThatThrownBy(() -> seminarService.create(createRequest(refs, refs.seminarType.id(), refs.consultant.id(), 999L, refs.employeeId)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Booking department user not found");
        assertThatThrownBy(() -> seminarService.create(createRequest(refs, refs.seminarType.id(), refs.consultant.id(), refs.bookingUserId, 999L)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Employee not found");
    }

    @Test
    void rejectsInvalidDateOrderAndRegistrantCount() {
        ReferenceData refs = createReferenceData();

        assertThatThrownBy(() -> seminarService.create(new SeminarCreateRequest(
                refs.seminarType.id(),
                refs.consultant.id(),
                refs.bookingUserId,
                refs.employeeId,
                "Invalid Date Seminar",
                LocalDate.of(2026, 7, 12),
                LocalDate.of(2026, 7, 11),
                "Hanoi",
                20
        ))).isInstanceOf(BadRequestException.class);

        assertThatThrownBy(() -> seminarService.create(new SeminarCreateRequest(
                refs.seminarType.id(),
                refs.consultant.id(),
                refs.bookingUserId,
                refs.employeeId,
                "Invalid Count Seminar",
                LocalDate.of(2026, 7, 11),
                LocalDate.of(2026, 7, 12),
                "Hanoi",
                0
        ))).isInstanceOf(BadRequestException.class);
    }

    @Test
    void blocksDeletingConsultantReferencedBySeminar() {
        ReferenceData refs = createReferenceData();
        seminarService.create(createRequest(refs));

        assertThatThrownBy(() -> consultantService.delete(refs.consultant.id()))
                .isInstanceOf(ConflictException.class);
    }

    @Test
    void calculatesRequirementsPreviewForParticipantDependentAndFixedRequirements() {
        ReferenceData refs = createReferenceData();
        MaterialResponse workbook = materialService.create(
                new MaterialRequest("Participant Workbook", "Printed", "Workbook", "book")
        );
        MaterialResponse flipchart = materialService.create(
                new MaterialRequest("Flipchart Pad", "Stationery", "Pad", "pad")
        );
        AudioVisualEquipmentResponse microphone = equipmentService.create(
                new AudioVisualEquipmentRequest("Wireless Microphone", "Audio", "unit")
        );
        AudioVisualEquipmentResponse projector = equipmentService.create(
                new AudioVisualEquipmentRequest("Projector", "Display", "unit")
        );

        materialRequirementService.create(
                refs.seminarType.id(),
                new MaterialRequirementRequest(workbook.id(), 1, true, 10, "One bundle per ten participants")
        );
        materialRequirementService.create(
                refs.seminarType.id(),
                new MaterialRequirementRequest(flipchart.id(), 3, false, null, "Fixed room setup")
        );
        avRequirementService.create(
                refs.seminarType.id(),
                new AvEquipmentRequirementRequest(microphone.id(), 1, true, 25)
        );
        avRequirementService.create(
                refs.seminarType.id(),
                new AvEquipmentRequirementRequest(projector.id(), 2, false, null)
        );

        SeminarResponse seminar = seminarService.create(createRequest(refs, 26));
        var preview = seminarService.getRequirementsPreview(seminar.id());

        assertThat(preview.seminarId()).isEqualTo(seminar.id());
        assertThat(preview.anticipatedRegistrants()).isEqualTo(26);
        assertThat(preview.materials())
                .extracting("materialName", "calculatedQuantity")
                .contains(
                        org.assertj.core.groups.Tuple.tuple("Participant Workbook", 3),
                        org.assertj.core.groups.Tuple.tuple("Flipchart Pad", 3)
                );
        assertThat(preview.audioVisualEquipment())
                .extracting("equipmentName", "calculatedQuantity")
                .contains(
                        org.assertj.core.groups.Tuple.tuple("Wireless Microphone", 2),
                        org.assertj.core.groups.Tuple.tuple("Projector", 2)
                );
    }

    private ReferenceData createReferenceData() {
        long suffix = System.nanoTime();
        Long bookingUserId = suffix;
        Long employeeId = suffix + 1;
        userRepository.save(User.builder()
                .id(bookingUserId)
                .fullName("Booking User")
                .email("booking-" + suffix + "@example.com")
                .passwordHash("hash")
                .build());
        userRepository.save(User.builder()
                .id(employeeId)
                .fullName("Coordinator User")
                .email("coordinator-" + suffix + "@example.com")
                .passwordHash("hash")
                .build());
        SeminarTypeResponse seminarType = seminarTypeService.create(
                new SeminarTypeRequest("Architecture", "Architecture training", 8, "Classroom")
        );
        ConsultantResponse consultant = createConsultant("Consultant One");
        return new ReferenceData(seminarType, consultant, bookingUserId, employeeId);
    }

    private ConsultantResponse createConsultant(String fullName) {
        return consultantService.create(
                new ConsultantRequest(fullName, "0901", "one@example.com", "1 Main", "Ho Chi Minh City", "Vietnam", "Trainer")
        );
    }

    private SeminarCreateRequest createRequest(ReferenceData refs) {
        return createRequest(refs, 25);
    }

    private SeminarCreateRequest createRequest(ReferenceData refs, int anticipatedRegistrants) {
        return createRequest(refs, refs.seminarType.id(), refs.consultant.id(), refs.bookingUserId, refs.employeeId, anticipatedRegistrants);
    }

    private SeminarCreateRequest createRequest(
            ReferenceData refs,
            Long seminarTypeId,
            Long consultantId,
            Long bookingUserId,
            Long employeeId
    ) {
        return createRequest(refs, seminarTypeId, consultantId, bookingUserId, employeeId, 25);
    }

    private SeminarCreateRequest createRequest(
            ReferenceData refs,
            Long seminarTypeId,
            Long consultantId,
            Long bookingUserId,
            Long employeeId,
            int anticipatedRegistrants
    ) {
        return new SeminarCreateRequest(
                seminarTypeId,
                consultantId,
                bookingUserId,
                employeeId,
                "Architecture Workshop",
                LocalDate.of(2026, 7, 10),
                LocalDate.of(2026, 7, 11),
                "Ho Chi Minh City",
                anticipatedRegistrants
        );
    }

    private record ReferenceData(
            SeminarTypeResponse seminarType,
            ConsultantResponse consultant,
            Long bookingUserId,
            Long employeeId
    ) {
    }
}
