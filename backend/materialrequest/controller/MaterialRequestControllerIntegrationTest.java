package com.training.logistics.materialrequest.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.training.logistics.auth.model.User;
import com.training.logistics.auth.repository.UserRepository;
import com.training.logistics.masterdata.dto.request.MaterialRequirementRequest;
import com.training.logistics.masterdata.dto.request.MaterialRequest;
import com.training.logistics.masterdata.dto.request.SeminarTypeRequest;
import com.training.logistics.masterdata.dto.response.MaterialResponse;
import com.training.logistics.masterdata.dto.response.SeminarTypeResponse;
import com.training.logistics.masterdata.service.MaterialRequirementService;
import com.training.logistics.masterdata.service.MaterialService;
import com.training.logistics.masterdata.service.SeminarTypeService;
import com.training.logistics.seminar.dto.request.ConsultantRequest;
import com.training.logistics.seminar.dto.request.SeminarCreateRequest;
import com.training.logistics.seminar.dto.response.ConsultantResponse;
import com.training.logistics.seminar.dto.response.SeminarResponse;
import com.training.logistics.seminar.service.ConsultantService;
import com.training.logistics.seminar.service.SeminarService;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class MaterialRequestControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

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

    @Test
    void createsListsGetsAndConfirmsMaterialRequest() throws Exception {
        ReferenceData refs = createReferenceData(17);
        MaterialResponse workbook = materialService.create(
                new MaterialRequest("Controller Material Workbook", "Printed", "Workbook", "book")
        );
        materialRequirementService.create(
                refs.seminarType.id(),
                new MaterialRequirementRequest(workbook.id(), 1, true, 8, "One per eight")
        );

        String response = mockMvc.perform(post("/api/seminars/" + refs.seminar.id() + "/material-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBodyWithoutItems()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.seminarId").value(refs.seminar.id()))
                .andExpect(jsonPath("$.seminarName").value(refs.seminar.seminarName()))
                .andExpect(jsonPath("$.shipmentStatus").value("REQUESTED"))
                .andExpect(jsonPath("$.shippingAddress").doesNotExist())
                .andExpect(jsonPath("$.items[0].id").doesNotExist())
                .andExpect(jsonPath("$.items[0].materialName").value("Controller Material Workbook"))
                .andExpect(jsonPath("$.items[0].requestedQuantity").value(3))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long requestId = idFrom(response);
        mockMvc.perform(get("/api/material-requests/" + requestId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(requestId));
        mockMvc.perform(get("/api/material-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(requestId));
        mockMvc.perform(get("/api/seminars/" + refs.seminar.id() + "/material-requests"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(requestId));

        mockMvc.perform(patch("/api/material-requests/" + requestId + "/confirm-delivered")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "note": "Materials received by facility"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipmentStatus").value("DELIVERED"))
                .andExpect(jsonPath("$.deliveredConfirmedByUserId").doesNotExist())
                .andExpect(jsonPath("$.deliveryConfirmationNote").value("Materials received by facility"));
    }

    @Test
    void returnsProblemDetailsForValidationNotFoundAndConflict() throws Exception {
        ReferenceData refs = createReferenceData(10);
        MaterialResponse workbook = materialService.create(
                new MaterialRequest("Problem Detail Workbook", "Printed", "Workbook", "book")
        );

        mockMvc.perform(post("/api/seminars/" + refs.seminar.id() + "/material-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "notes": "Missing needed date"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation failed"));

        mockMvc.perform(get("/api/material-requests/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Resource not found"));

        String response = mockMvc.perform(post("/api/seminars/" + refs.seminar.id() + "/material-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBodyWithItem(workbook.id(), 1)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Long requestId = idFrom(response);

        mockMvc.perform(patch("/api/material-requests/" + requestId + "/confirm-delivered")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "note": "First confirmation"
                                }
                                """))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/api/material-requests/" + requestId + "/confirm-delivered")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "note": "Second confirmation"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("Conflict"));
    }

    private ReferenceData createReferenceData(int anticipatedRegistrants) {
        long suffix = System.nanoTime();
        Long bookingUserId = suffix;
        Long employeeUserId = suffix + 1;
        userRepository.save(User.builder()
                .id(bookingUserId)
                .fullName("Controller Material Booking User")
                .email("controller-material-booking-" + suffix + "@example.com")
                .passwordHash("hash")
                .build());
        userRepository.save(User.builder()
                .id(employeeUserId)
                .fullName("Controller Material Coordinator")
                .email("controller-material-coordinator-" + suffix + "@example.com")
                .passwordHash("hash")
                .build());
        SeminarTypeResponse seminarType = seminarTypeService.create(
                new SeminarTypeRequest("Controller Material Course " + suffix, "Materials", 8, "Classroom")
        );
        ConsultantResponse consultant = consultantService.create(
                new ConsultantRequest("Controller Material Consultant " + suffix, "0901", "cmc-" + suffix + "@example.com", null, "Hanoi", "Vietnam", "Trainer")
        );
        SeminarResponse seminar = seminarService.create(new SeminarCreateRequest(
                seminarType.id(),
                consultant.id(),
                bookingUserId,
                "Controller Material Seminar " + suffix,
                LocalDate.now().plusDays(3),
                LocalDate.now().plusDays(4),
                "Hanoi",
                anticipatedRegistrants,
                null
        ));
        return new ReferenceData(seminarType, seminar, employeeUserId);
    }

    private String createBodyWithoutItems() {
        return """
                {
                  "neededByDate": "%s",
                  "notes": "Send before setup"
                }
                """.formatted(LocalDate.now().plusDays(7));
    }

    private String createBodyWithItem(Long materialId, int quantity) {
        return """
                {
                  "neededByDate": "%s",
                  "items": [
                    {
                      "materialId": %d,
                      "requestedQuantity": %d,
                      "notes": "Coordinator override"
                    }
                  ]
                }
                """.formatted(LocalDate.now().plusDays(7), materialId, quantity);
    }

    private Long idFrom(String response) throws Exception {
        JsonNode json = objectMapper.readTree(response);
        assertThat(json.get("id").isNumber()).isTrue();
        return json.get("id").asLong();
    }

    private record ReferenceData(
            SeminarTypeResponse seminarType,
            SeminarResponse seminar,
            Long employeeUserId
    ) {
    }
}
