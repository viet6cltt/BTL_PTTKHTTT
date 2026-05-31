package com.training.logistics.materialrequest.service;

import com.training.logistics.common.exception.BadRequestException;
import java.time.LocalDate;

final class MaterialRequestValidation {

    private MaterialRequestValidation() {
    }

    static LocalDate requireDate(LocalDate value, String fieldName) {
        if (value == null) {
            throw new BadRequestException(fieldName + " must not be null");
        }
        return value;
    }

    static String requireNotBlank(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new BadRequestException(fieldName + " must not be blank");
        }
        return value.trim();
    }

    static Integer requirePositive(Integer value, String fieldName) {
        if (value == null || value <= 0) {
            throw new BadRequestException(fieldName + " must be positive");
        }
        return value;
    }
}
