package com.training.logistics.seminar.dto.request;

import com.training.logistics.seminar.model.TimeSlot;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record SeminarCreateRequest(
        @NotNull Long seminarTypeId,
        @NotNull Long consultantId,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotNull TimeSlot expectedTimeSlot,
        @NotBlank String city,
        @NotNull @Positive Integer anticipatedRegistrants
) {
}
