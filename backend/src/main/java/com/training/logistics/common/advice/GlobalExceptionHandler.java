package com.training.logistics.common.advice;

import com.training.logistics.common.dto.ErrorDetails;
import com.training.logistics.common.exception.ConflictException;
import com.training.logistics.common.exception.ResourceNotFoundException;

import java.net.URI;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.training.logistics.common.exception.*;
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

    @ExceptionHandler(ResourceNotFoundException.class)
    ProblemDetail handleNotFound(ResourceNotFoundException exception) {
        return problem(HttpStatus.NOT_FOUND, "Resource not found", exception.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    ProblemDetail handleBadRequest(BadRequestException exception) {
        return problem(HttpStatus.BAD_REQUEST, "Bad request", exception.getMessage());
    }

    @ExceptionHandler(ConflictException.class)
    ProblemDetail handleConflict(ConflictException exception) {
        return problem(HttpStatus.CONFLICT, "Conflict", exception.getMessage());
    }

    private ProblemDetail problem(HttpStatus status, String title, String detail) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail);
        problem.setTitle(title);
        problem.setType(URI.create("about:blank"));
        return problem;
    }

    protected ResponseEntity<ErrorDetails> buildResponse(String message, HttpStatus status) {
        ErrorDetails errorDetails = new ErrorDetails(message);
        return ResponseEntity.status(status).body(errorDetails);
    }
}
