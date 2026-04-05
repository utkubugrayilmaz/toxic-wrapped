package com.toxicwrapped.backend.exception;

/**
 * WhatsApp dosyası parse edilirken oluşan hatalar.
 */
public class FileParsingException extends RuntimeException {

    private final ErrorCode errorCode;

    public FileParsingException(String message) {
        super(message);
        this.errorCode = ErrorCode.GENERAL_PARSE_ERROR;
    }

    public FileParsingException(String message, ErrorCode errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public FileParsingException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = ErrorCode.GENERAL_PARSE_ERROR;
    }

    public FileParsingException(String message, Throwable cause, ErrorCode errorCode) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public enum ErrorCode {
        EMPTY_FILE("Dosya boş"),
        INVALID_FORMAT("Geçersiz WhatsApp format"),
        UNSUPPORTED_ENCODING("Desteklenmeyen karakter kodlaması"),
        NO_MESSAGES_FOUND("Hiç mesaj bulunamadı"),
        GENERAL_PARSE_ERROR("Dosya işlenirken hata oluştu");

        private final String message;

        ErrorCode(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }
}