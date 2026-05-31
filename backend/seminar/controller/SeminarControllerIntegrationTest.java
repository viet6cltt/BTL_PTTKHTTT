// package com.training.logistics.seminar.controller;

// import static org.assertj.core.api.Assertions.assertThat;
// import static org.hamcrest.Matchers.nullValue;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// import com.fasterxml.jackson.databind.JsonNode;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.training.logistics.auth.model.User;
// import com.training.logistics.auth.repository.UserRepository;
// import com.training.logistics.masterdata.dto.request.AudioVisualEquipmentRequest;
// import com.training.logistics.masterdata.dto.request.AvEquipmentRequirementRequest;
// import com.training.logistics.masterdata.dto.request.MaterialRequest;
// import com.training.logistics.masterdata.dto.request.MaterialRequirementRequest;
// import com.training.logistics.masterdata.dto.request.SeminarTypeRequest;
// import com.training.logistics.masterdata.dto.response.AudioVisualEquipmentResponse;
// import com.training.logistics.masterdata.dto.response.MaterialResponse;
// import com.training.logistics.masterdata.dto.response.SeminarTypeResponse;
// import com.training.logistics.masterdata.service.AudioVisualEquipmentService;
// import com.training.logistics.masterdata.service.AvEquipmentRequirementService;
// import com.training.logistics.masterdata.service.MaterialRequirementService;
// import com.training.logistics.masterdata.service.MaterialService;
// import com.training.logistics.masterdata.service.SeminarTypeService;
// import com.training.logistics.seminar.dto.request.ConsultantRequest;
// import com.training.logistics.seminar.dto.response.ConsultantResponse;
// import com.training.logistics.seminar.service.ConsultantService;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.http.MediaType;
// import org.springframework.test.context.ActiveProfiles;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.transaction.annotation.Transactional;

// @SpringBootTest
// @AutoConfigureMockMvc
// @ActiveProfiles("test")
// @Transactional
// class SeminarControllerIntegrationTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Autowired
//     private ObjectMapper objectMapper;

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private SeminarTypeService seminarTypeService;

//     @Autowired
//     private ConsultantService consultantService;

//     @Autowired
//     private MaterialService materialService;

//     @Autowired
//     private AudioVisualEquipmentService equipmentService;

//     @Autowired
//     private MaterialRequirementService materialRequirementService;

//     @Autowired
//     private AvEquipmentRequirementService avRequirementService;

//     @Test
//     void createsAndReadsSeminarWithDtoOnlyResponseShape() throws Exception {
//         ReferenceData refs = createReferenceData();

//         String response = mockMvc.perform(post("/api/seminars")
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(seminarBody(refs, 31)))
//                 .andExpect(status().isCreated())
//                 .andExpect(jsonPath("$.seminarName").value("Controller Seminar"))
//                 .andExpect(jsonPath("$.seminarTypeId").value(refs.seminarType.id()))
//                 .andExpect(jsonPath("$.seminarTypeName").value("Controller Course"))
//                 .andExpect(jsonPath("$.consultantFullName").value("Controller Consultant"))
//                 .andExpect(jsonPath("$.bookingDepartmentUserFullName").value("Controller Booking User"))
//                 .andExpect(jsonPath("$.employeeId").value(nullValue()))
//                 .andExpect(jsonPath("$.employeeFullName").value(nullValue()))
//                 .andExpect(jsonPath("$.note").value("Controller note"))
//                 .andExpect(jsonPath("$.seminarType").doesNotExist())
//                 .andExpect(jsonPath("$.consultant").doesNotExist())
//                 .andReturn()
//                 .getResponse()
//                 .getContentAsString();

//         Long seminarId = idFrom(response);
//         mockMvc.perform(get("/api/seminars/" + seminarId))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.id").value(seminarId))
//                 .andExpect(jsonPath("$.anticipatedRegistrants").value(31));
//     }

//     @Test
//     void returnsProblemDetailForBadRequestNotFoundAndConflict() throws Exception {
//         ReferenceData refs = createReferenceData();

//         mockMvc.perform(post("/api/seminars")
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(seminarBody(refs, 0)))
//                 .andExpect(status().isBadRequest())
//                 .andExpect(jsonPath("$.title").value("Validation failed"));

//         mockMvc.perform(get("/api/seminars/999999"))
//                 .andExpect(status().isNotFound())
//                 .andExpect(jsonPath("$.title").value("Resource not found"));

//         mockMvc.perform(post("/api/seminars")
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(seminarBody(refs, 12)))
//                 .andExpect(status().isCreated());

//         mockMvc.perform(delete("/api/consultants/" + refs.consultant.id()))
//                 .andExpect(status().isConflict())
//                 .andExpect(jsonPath("$.title").value("Conflict"));
//     }

//     @Test
//     void returnsCalculatedRequirementsPreview() throws Exception {
//         ReferenceData refs = createReferenceData();
//         MaterialResponse workbook = materialService.create(
//                 new MaterialRequest("Controller Workbook", "Printed", "Workbook", "book")
//         );
//         AudioVisualEquipmentResponse microphone = equipmentService.create(
//                 new AudioVisualEquipmentRequest("Controller Microphone", "Audio", "unit")
//         );
//         materialRequirementService.create(
//                 refs.seminarType.id(),
//                 new MaterialRequirementRequest(workbook.id(), 1, true, 8, null)
//         );
//         avRequirementService.create(
//                 refs.seminarType.id(),
//                 new AvEquipmentRequirementRequest(microphone.id(), 2, false, null)
//         );

//         String response = mockMvc.perform(post("/api/seminars")
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(seminarBody(refs, 17)))
//                 .andExpect(status().isCreated())
//                 .andReturn()
//                 .getResponse()
//                 .getContentAsString();

//         Long seminarId = idFrom(response);
//         mockMvc.perform(get("/api/seminars/" + seminarId + "/requirements-preview"))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.seminarId").value(seminarId))
//                 .andExpect(jsonPath("$.anticipatedRegistrants").value(17))
//                 .andExpect(jsonPath("$.materials[0].materialName").value("Controller Workbook"))
//                 .andExpect(jsonPath("$.materials[0].calculatedQuantity").value(3))
//                 .andExpect(jsonPath("$.audioVisualEquipment[0].equipmentName").value("Controller Microphone"))
//                 .andExpect(jsonPath("$.audioVisualEquipment[0].calculatedQuantity").value(2));
//     }

//     private ReferenceData createReferenceData() {
//         long suffix = System.nanoTime();
//         Long bookingUserId = suffix;
//         userRepository.save(User.builder()
//                 .id(bookingUserId)
//                 .fullName("Controller Booking User")
//                 .email("controller-booking-" + suffix + "@example.com")
//                 .passwordHash("hash")
//                 .build());
//         SeminarTypeResponse seminarType = seminarTypeService.create(
//                 new SeminarTypeRequest("Controller Course", "Controller test", 6, "Classroom")
//         );
//         ConsultantResponse consultant = consultantService.create(
//                 new ConsultantRequest("Controller Consultant", "0901", "controller@example.com", null, "Hanoi", "Vietnam", "Trainer")
//         );
//         return new ReferenceData(seminarType, consultant, bookingUserId);
//     }

//     private String seminarBody(ReferenceData refs, int anticipatedRegistrants) {
//         return """
//                 {
//                   "seminarTypeId": %d,
//                   "consultantId": %d,
//                   "bookingDepartmentUserId": %d,
//                   "seminarName": "Controller Seminar",
//                   "startDate": "2026-08-01",
//                   "endDate": "2026-08-02",
//                   "city": "Hanoi",
//                   "anticipatedRegistrants": %d,
//                   "note": "Controller note"
//                 }
//                 """.formatted(
//                 refs.seminarType.id(),
//                 refs.consultant.id(),
//                 refs.bookingUserId,
//                 anticipatedRegistrants
//         );
//     }

//     private Long idFrom(String response) throws Exception {
//         JsonNode json = objectMapper.readTree(response);
//         assertThat(json.get("id").isNumber()).isTrue();
//         return json.get("id").asLong();
//     }

//     private record ReferenceData(
//             SeminarTypeResponse seminarType,
//             ConsultantResponse consultant,
//             Long bookingUserId
//     ) {
//     }
// }
