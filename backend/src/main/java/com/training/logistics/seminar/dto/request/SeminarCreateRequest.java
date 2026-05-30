package com.training.logistics.seminar.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record SeminarCreateRequest(
        @NotNull Long seminarTypeId,
        @NotNull Long consultantId,
        @NotNull Long bookingDepartmentUserId,
        @NotNull Long employeeId,
        @NotBlank String seminarName,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        @NotBlank String city,
        @NotNull @Positive Integer anticipatedRegistrants
) {
}
