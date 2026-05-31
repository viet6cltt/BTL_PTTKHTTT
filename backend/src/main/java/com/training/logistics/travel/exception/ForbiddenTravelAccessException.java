package com.training.logistics.travel.exception;

public class ForbiddenTravelAccessException extends RuntimeException {
    public ForbiddenTravelAccessException(String message) {
        super(message);
    }
}
