package com.training.logistics.auth.advice;

import com.training.logistics.auth.exception.InvalidCredentialsException;
import com.training.logistics.auth.exception.InvalidTokenException;
import com.training.logistics.auth.exception.TokenExpiredException;
import com.training.logistics.auth.exception.UserAlreadyExistsException;
import com.training.logistics.common.advice.GlobalExceptionHandler;
import com.training.logistics.common.dto.ErrorDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.training.logistics.auth.controller")
public class AuthExceptionHandler extends GlobalExceptionHandler {

    // 1. Invalid email/password -> Return 401
    public ResponseEntity<ErrorDetails> handleInvalidCredentials(InvalidCredentialsException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    // 2. Token expired -> 401 Unauthorized
    public ResponseEntity<ErrorDetails> handleTokenExpired(TokenExpiredException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    // 3. Token is invalid -> 401 Unauthorized
    public ResponseEntity<ErrorDetails> handleInvalidToken(InvalidTokenException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    // 4. Trùng lặp tài khoản -> 409 Conflict
    public ResponseEntity<ErrorDetails> handleUserAlreadyExists(UserAlreadyExistsException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.CONFLICT)
    }

}
