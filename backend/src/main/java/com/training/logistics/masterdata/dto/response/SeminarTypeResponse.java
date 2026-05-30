package com.training.logistics.masterdata.dto.response;

public record SeminarTypeResponse(
        Long id,
        String typeName,
        String description,
        Integer durationHours,
        String arrangementNotes
) {
}
