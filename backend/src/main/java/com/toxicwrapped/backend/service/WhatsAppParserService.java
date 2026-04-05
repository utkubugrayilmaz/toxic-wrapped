package com.toxicwrapped.backend.service;

import com.toxicwrapped.backend.exception.FileParsingException;
import com.toxicwrapped.backend.exception.FileParsingException.ErrorCode;
import com.toxicwrapped.backend.model.ChatMessage;
import com.toxicwrapped.backend.model.ChatMessage.MessageType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * WhatsApp .txt export dosyasını parse eder.
 * Desteklenen formatlar:
 * - [01.01.2024, 14:30:00] Sender: Message
 * - 01.01.2024, 14:30 - Sender: Message
 * - [1/1/24, 2:30 PM] Sender: Message
 */
@Slf4j
@Service
public class WhatsAppParserService {

    // WhatsApp format pattern'leri
    private static final Pattern PATTERN_BRACKETED = Pattern.compile(
            "^\\[(\\d{1,2}\\.\\d{1,2}\\.\\d{4}),\\s*(\\d{1,2}:\\d{2}(?::\\d{2})?)\\]\\s*([^:]+):\\s*(.+)$"
    );

    private static final Pattern PATTERN_DASHED = Pattern.compile(
            "^(\\d{1,2}\\.\\d{1,2}\\.\\d{4}),\\s*(\\d{1,2}:\\d{2}(?::\\d{2})?)\\s*-\\s*([^:]+):\\s*(.+)$"
    );

    private static final Pattern PATTERN_US_FORMAT = Pattern.compile(
            "^\\[(\\d{1,2}/\\d{1,2}/\\d{2,4}),\\s*(\\d{1,2}:\\d{2}(?::\\d{2})?\\s*(?:AM|PM)?)\\]\\s*([^:]+):\\s*(.+)$",
            Pattern.CASE_INSENSITIVE
    );

    // Tarih formatları
    private static final DateTimeFormatter[] DATE_FORMATTERS = {
            DateTimeFormatter.ofPattern("dd.MM.yyyy H:mm:ss"),
            DateTimeFormatter.ofPattern("dd.MM.yyyy H:mm"),
            DateTimeFormatter.ofPattern("d.M.yyyy H:mm:ss"),
            DateTimeFormatter.ofPattern("d.M.yyyy H:mm"),
            DateTimeFormatter.ofPattern("M/d/yy h:mm a"),
            DateTimeFormatter.ofPattern("M/d/yyyy h:mm a"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy H:mm")
    };

    // Media mesajları için pattern
    private static final Pattern MEDIA_PATTERN = Pattern.compile(
            "(<Medya dahil edilmedi>|<Media omitted>|image omitted|video omitted|audio omitted|sticker omitted)",
            Pattern.CASE_INSENSITIVE
    );

    // Sistem mesajları için pattern
    private static final Pattern SYSTEM_PATTERN = Pattern.compile(
            "(created group|added|removed|left|changed|güvenlik kodu|şifreleme|oluşturdu|ekledi|çıkardı|ayrıldı)",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * WhatsApp export dosyasını parse eder.
     *
     * @param file Upload edilen .txt dosyası
     * @return Parse edilmiş mesaj listesi
     * @throws FileParsingException Parse hatası durumunda
     */
    public List<ChatMessage> parse(MultipartFile file) {
        validateFile(file);

        List<ChatMessage> messages = new ArrayList<>();
        StringBuilder continuationBuffer = new StringBuilder();
        ChatMessage lastMessage = null;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line;

            while ((line = reader.readLine()) != null) {

                if (line.trim().isEmpty()) {
                    continue;
                }

                ChatMessage parsed = parseLine(line);

                if (parsed != null) {
                    // Önceki mesajın devamını kaydet
                    if (lastMessage != null && !continuationBuffer.isEmpty()) {
                        lastMessage.setMessage(
                                lastMessage.getMessage() + "\n" + continuationBuffer.toString().trim()
                        );
                        continuationBuffer.setLength(0);
                    }

                    messages.add(parsed);
                    lastMessage = parsed;
                } else if (lastMessage != null) {
                    // Bu satır önceki mesajın devamı
                    if (!continuationBuffer.isEmpty()) {
                        continuationBuffer.append("\n");
                    }
                    continuationBuffer.append(line);
                }
            }

            // Son mesajın devamını ekle
            if (lastMessage != null && !continuationBuffer.isEmpty()) {
                lastMessage.setMessage(
                        lastMessage.getMessage() + "\n" + continuationBuffer.toString().trim()
                );
            }

        } catch (IOException e) {
            log.error("Dosya okuma hatası: {}", e.getMessage());
            throw new FileParsingException("Dosya okunamadı", e, ErrorCode.GENERAL_PARSE_ERROR);
        }

        if (messages.isEmpty()) {
            throw new FileParsingException(
                    "Dosyada geçerli WhatsApp mesajı bulunamadı",
                    ErrorCode.NO_MESSAGES_FOUND
            );
        }

        log.info("Parse tamamlandı: {} mesaj bulundu", messages.size());
        return messages;
    }

    /**
     * Dosya validasyonu yapar.
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileParsingException("Dosya boş", ErrorCode.EMPTY_FILE);
        }

        String filename = file.getOriginalFilename();
        if (filename != null && !filename.toLowerCase().endsWith(".txt")) {
            throw new FileParsingException(
                    "Sadece .txt dosyaları desteklenir",
                    ErrorCode.INVALID_FORMAT
            );
        }
    }

    /**
     * Tek bir satırı parse etmeye çalışır.
     *
     * @return ChatMessage veya null (mesaj satırı değilse)
     */
    private ChatMessage parseLine(String line) {
        // Farklı pattern'leri dene
        Matcher matcher = PATTERN_BRACKETED.matcher(line);
        if (matcher.matches()) {
            return createMessage(matcher.group(1), matcher.group(2), matcher.group(3), matcher.group(4));
        }

        matcher = PATTERN_DASHED.matcher(line);
        if (matcher.matches()) {
            return createMessage(matcher.group(1), matcher.group(2), matcher.group(3), matcher.group(4));
        }

        matcher = PATTERN_US_FORMAT.matcher(line);
        if (matcher.matches()) {
            return createMessage(matcher.group(1), matcher.group(2), matcher.group(3), matcher.group(4));
        }

        return null;
    }

    /**
     * Parse edilmiş değerlerden ChatMessage oluşturur.
     */
    private ChatMessage createMessage(String dateStr, String timeStr, String sender, String message) {
        LocalDateTime timestamp = parseDateTime(dateStr, timeStr);
        MessageType type = determineMessageType(message);

        return ChatMessage.builder()
                .timestamp(timestamp)
                .sender(sender.trim())
                .message(message.trim())
                .type(type)
                .build();
    }

    /**
     * Tarih ve saat string'lerini LocalDateTime'a çevirir.
     */
    private LocalDateTime parseDateTime(String dateStr, String timeStr) {
        String combined = dateStr + " " + timeStr;

        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDateTime.parse(combined, formatter);
            } catch (DateTimeParseException ignored) {
                // Sonraki formatter'ı dene
            }
        }

        log.warn("Tarih parse edilemedi: {}", combined);
        return LocalDateTime.now(); // Fallback
    }

    /**
     * Mesaj tipini belirler (TEXT, MEDIA, SYSTEM).
     */
    private MessageType determineMessageType(String message) {
        if (MEDIA_PATTERN.matcher(message).find()) {
            return MessageType.MEDIA;
        }
        if (SYSTEM_PATTERN.matcher(message).find()) {
            return MessageType.SYSTEM;
        }
        return MessageType.TEXT;
    }
}