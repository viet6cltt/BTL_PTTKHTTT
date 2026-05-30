package com.training.logistics.masterdata.service;

import com.training.logistics.common.exception.BadRequestException;

final class MasterDataValidation {

    private MasterDataValidation() {
    }

    static String requireNotBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
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

    static Boolean requireBoolean(Boolean value, String fieldName) {
        if (value == null) {
            throw new BadRequestException(fieldName + " must not be null");
        }
        return value;
    }
}
