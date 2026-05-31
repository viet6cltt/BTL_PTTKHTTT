package com.training.logistics.seminar.dto.request;

import com.training.logistics.seminar.model.TimeSlot;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record SeminarUpdateRequest(
        @NotNull Long seminarTypeId,
        @NotNull Long consultantId,
        @NotBlank String seminarName,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotNull TimeSlot expectedTimeSlot,
        @NotBlank String city,
        @NotNull @Positive Integer anticipatedRegistrants,
        String note
) {
}
