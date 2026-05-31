package com.training.logistics.seminar.dto.response;

import com.training.logistics.seminar.model.SeminarStatus;
import com.training.logistics.seminar.model.TimeSlot;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record SeminarResponse(
        Long id,
        Long seminarTypeId,
        String seminarTypeName,
        Long consultantId,
        String consultantFullName,
        Long bookingDepartmentUserId,
        String bookingDepartmentUserFullName,
        Long coordinatorId,
        String coordinatorFullName,
        String seminarName,
        LocalDate startDate,
        LocalDate endDate,
        TimeSlot expectedTimeSlot,
        String city,
        Integer anticipatedRegistrants,
        SeminarStatus status,
        String note,
        LocalDateTime bookingCreatedDateTime
) {
}
