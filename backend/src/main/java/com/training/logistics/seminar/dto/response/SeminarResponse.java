package com.training.logistics.seminar.dto.response;

import java.time.LocalDate;

public record SeminarResponse(
        Long id,
        Long seminarTypeId,
        String seminarTypeName,
        Long consultantId,
        String consultantFullName,
        Long bookingDepartmentUserId,
        String bookingDepartmentUserFullName,
        Long employeeId,
        String employeeFullName,
        String seminarName,
        LocalDate startDate,
        LocalDate endDate,
        String city,
        Integer anticipatedRegistrants,
        LocalDate bookingCreatedDate
) {
}
