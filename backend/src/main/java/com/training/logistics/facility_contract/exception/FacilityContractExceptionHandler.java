package com.training.logistics.facility_contract.exception;

import com.training.logistics.common.advice.GlobalExceptionHandler;
import com.training.logistics.common.dto.ErrorDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.training.logistics.facility_contract.controller")
public class FacilityContractExceptionHandler extends GlobalExceptionHandler {
    @ExceptionHandler(FacilityContractNotFoundException.class)
    public ResponseEntity<ErrorDetails> handleNotFound(FacilityContractNotFoundException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateFacilityContractException.class)
    public ResponseEntity<ErrorDetails> handleDuplicate(DuplicateFacilityContractException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InvalidFacilityContractRequestException.class)
    public ResponseEntity<ErrorDetails> handleInvalidRequest(InvalidFacilityContractRequestException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MinioStorageException.class)
    public ResponseEntity<ErrorDetails> handleStorage(MinioStorageException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
