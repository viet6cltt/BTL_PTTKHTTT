package com.training.logistics.seminar.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record SeminarUpdateRequest(
        @NotNull Long seminarTypeId,
        @NotNull Long consultantId,
        Long employeeId,
        @NotBlank String seminarName,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotBlank String city,
        @NotNull @Positive Integer anticipatedRegistrants,
        String note
) {
}
