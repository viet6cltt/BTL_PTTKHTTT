package com.training.logistics.common.advice;

import com.training.logistics.common.dto.ErrorDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDetails> handleValidation(MethodArgumentNotValidException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class) // fallback for any other exception
    public ResponseEntity<ErrorDetails> handleGlobalException(Exception ex) {
        return buildResponse(ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    protected ResponseEntity<ErrorDetails> buildResponse(String message, HttpStatus status) {
        ErrorDetails errorDetails = new ErrorDetails(message);
        return ResponseEntity.status(status).body(errorDetails);
    }
}
