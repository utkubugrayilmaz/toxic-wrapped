package com.toxicwrapped.backend.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Global exception handler - tüm hataları yakalar ve düzgün response döner.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(FileParsingException.class)
    public ResponseEntity<Map<String, Object>> handleFileParsingException(FileParsingException ex) {
        log.warn("File parsing error: {}", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(buildErrorResponse(
                        ex.getErrorCode().name(),
                        ex.getMessage(),
                        HttpStatus.BAD_REQUEST.value()
                ));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        log.warn("File too large: {}", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(buildErrorResponse(
                        "FILE_TOO_LARGE",
                        "Dosya boyutu çok büyük. Maksimum 10MB yükleyebilirsiniz.",
                        HttpStatus.PAYLOAD_TOO_LARGE.value()
                ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Invalid argument: {}", ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(buildErrorResponse(
                        "INVALID_ARGUMENT",
                        ex.getMessage(),
                        HttpStatus.BAD_REQUEST.value()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unexpected error: ", ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildErrorResponse(
                        "INTERNAL_ERROR",
                        "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
                        HttpStatus.INTERNAL_SERVER_ERROR.value()
                ));
    }

    private Map<String, Object> buildErrorResponse(String code, String message, int status) {
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("timestamp", LocalDateTime.now().toString());
        error.put("status", status);
        error.put("code", code);
        error.put("message", message);
        return error;
    }
}