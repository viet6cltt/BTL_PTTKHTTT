package com.training.logistics.seminar.service;

import com.training.logistics.common.exception.BadRequestException;
import java.time.LocalDate;

final class SeminarValidation {

    private SeminarValidation() {
    }

    static String requireNotBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(fieldName + " must not be blank");
        }
        return value.trim();
    }

    static String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    static Integer requirePositive(Integer value, String fieldName) {
        if (value == null || value <= 0) {
            throw new BadRequestException(fieldName + " must be positive");
        }
        return value;
    }

    static LocalDate requireDate(LocalDate value, String fieldName) {
        if (value == null) {
            throw new BadRequestException(fieldName + " must not be null");
        }
        return value;
    }

    static void requireEndDateOnOrAfterStartDate(LocalDate startDate, LocalDate endDate) {
        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("endDate must be on or after startDate");
        }
    }

    static void requireFutureStartDate(LocalDate startDate) {
        if (!startDate.isAfter(LocalDate.now())) {
            throw new BadRequestException("startDate must be in the future");
        }
    }
}
