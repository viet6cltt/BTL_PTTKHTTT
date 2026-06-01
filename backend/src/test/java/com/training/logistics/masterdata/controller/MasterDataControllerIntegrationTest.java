package com.training.logistics.masterdata.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@WithMockUser(roles = "ADMIN")
class MasterDataControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createsAndReadsSeminarTypeWithDtoShape() throws Exception {
        String seminarBody = """
                {
                  "typeName": "Workshop",
                  "description": "Hands-on session",
                  "durationHours": 4,
                  "arrangementNotes": "Group tables"
                }
                """;

        String response = mockMvc.perform(post("/api/v1/master-data/seminar-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(seminarBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.typeName").value("Workshop"))
                .andExpect(jsonPath("$.durationHours").value(4))
                .andExpect(jsonPath("$.materialRequirements").doesNotExist())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Long seminarTypeId = idFrom(response);

        mockMvc.perform(get("/api/v1/master-data/seminar-types/" + seminarTypeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(seminarTypeId))
                .andExpect(jsonPath("$.typeName").value("Workshop"))
                .andExpect(jsonPath("$.description").value("Hands-on session"));
    }

    @Test
    void returnsProblemDetailStatusesForValidationMissingAndConflict() throws Exception {
        mockMvc.perform(post("/api/master-data/materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "materialName": "",
                                  "materialType": "Print",
                                  "unit": "set"
                                }
                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());

        mockMvc.perform(get("/api/master-data/materials/404"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Resource not found"));

        String seminarResponse = mockMvc.perform(post("/api/v1/master-data/seminar-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "typeName": "Course",
                                  "durationHours": 8
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Long seminarTypeId = idFrom(seminarResponse);

        String materialResponse = mockMvc.perform(post("/api/master-data/materials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "materialName": "Workbook",
                                  "materialType": "Printed",
                                  "unit": "book"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Long materialId = idFrom(materialResponse);

        mockMvc.perform(post("/api/master-data/seminar-types/" + seminarTypeId + "/material-requirements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(materialRequirementBody(materialId, 1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.materialId").value(materialId))
                .andExpect(jsonPath("$.materialName").value("Workbook"));
        mockMvc.perform(post("/api/master-data/seminar-types/" + seminarTypeId + "/material-requirements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(materialRequirementBody(materialId, 2)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("Conflict"));

        mockMvc.perform(delete("/api/master-data/materials/" + materialId))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.title").value("Conflict"));
    }

    private Long idFrom(String response) throws Exception {
        JsonNode json = objectMapper.readTree(response);
        assertThat(json.get("id").isNumber()).isTrue();
        return json.get("id").asLong();
    }

    private String materialRequirementBody(Long materialId, int defaultQuantity) {
        return """
                {
                  "materialId": %d,
                  "defaultQuantity": %d,
                  "dependOnNumParticipant": false
                }
                """.formatted(materialId, defaultQuantity);
    }
}
