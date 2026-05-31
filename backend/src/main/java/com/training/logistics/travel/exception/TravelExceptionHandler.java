package com.training.logistics.travel.exception;

import com.training.logistics.common.advice.GlobalExceptionHandler;
import com.training.logistics.common.dto.ErrorDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.training.logistics.travel.controller")
public class TravelExceptionHandler extends GlobalExceptionHandler {
    @ExceptionHandler(TravelArrangementNotFoundException.class)
    public ResponseEntity<ErrorDetails> handleNotFound(TravelArrangementNotFoundException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(InvalidTravelArrangementException.class)
    public ResponseEntity<ErrorDetails> handleInvalidRequest(InvalidTravelArrangementException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ForbiddenTravelAccessException.class)
    public ResponseEntity<ErrorDetails> handleForbidden(ForbiddenTravelAccessException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.FORBIDDEN);
    }
}
