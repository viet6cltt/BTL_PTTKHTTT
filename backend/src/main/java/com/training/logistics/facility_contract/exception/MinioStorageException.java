package com.training.logistics.facility_contract.exception;

public class MinioStorageException extends RuntimeException {
    public MinioStorageException(String message) {
        super(message);
    }

    public MinioStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
