package com.training.logistics.seminar.dto.response;

import java.util.List;

public record SeminarRequirementsPreviewResponse(
        Long seminarId,
        String seminarName,
        Long seminarTypeId,
        String seminarTypeName,
        Integer anticipatedRegistrants,
        List<CalculatedMaterialRequirementResponse> materials,
        List<CalculatedAvEquipmentRequirementResponse> audioVisualEquipment
) {
}
