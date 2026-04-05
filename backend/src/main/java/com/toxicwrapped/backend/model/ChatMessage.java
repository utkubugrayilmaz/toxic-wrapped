package com.toxicwrapped.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    private static final int MIN_ANALYZABLE_LENGTH = 10;

    private LocalDateTime timestamp;
    private String sender;
    private String message;

    private MessageType type;

    public enum MessageType {
        TEXT,
        MEDIA,
        SYSTEM
    }

    /**
     * Mesajın analiz edilebilir olup olmadığını kontrol eder.
     * Sadece TEXT tipi ve yeterli uzunluktaki mesajlar analiz edilir.
     */
    public boolean isAnalyzable() {
        return type == MessageType.TEXT
                && message != null
                && message.trim().length() >= MIN_ANALYZABLE_LENGTH;
    }
}