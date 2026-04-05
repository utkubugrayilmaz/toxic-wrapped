package com.toxicwrapped.backend.service;

import com.toxicwrapped.backend.dto.response.StatisticsResponse;
import com.toxicwrapped.backend.model.ChatMessage;
import com.toxicwrapped.backend.model.ChatMessage.MessageType;
import com.toxicwrapped.backend.util.EmojiUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Sohbet istatistiklerini hesaplar.
 * Wrapped kartları için gerekli tüm metrikleri üretir.
 */
@Slf4j
@Service
public class StatisticsService {

    private static final int TOP_EMOJI_LIMIT = 10;
    private static final Locale LOCALE_TR = new Locale("tr", "TR");

    /**
     * Tüm istatistikleri hesaplar.
     */
    public StatisticsResponse calculateStatistics(List<ChatMessage> messages) {
        log.info("İstatistik hesaplanıyor: {} mesaj", messages.size());

        // Sadece TEXT mesajları filtrele (istatistikler için)
        List<ChatMessage> textMessages = messages.stream()
                .filter(m -> m.getType() == MessageType.TEXT)
                .toList();

        // Katılımcı bazlı
        Map<String, Integer> messagesPerParticipant = calculateMessagesPerParticipant(textMessages);
        Map<String, Double> percentagePerParticipant = calculatePercentages(messagesPerParticipant, textMessages.size());

        // Zaman bazlı
        Map<Integer, Integer> messagesByHour = calculateMessagesByHour(textMessages);
        Map<String, Integer> messagesByDayOfWeek = calculateMessagesByDayOfWeek(textMessages);

        // Emoji istatistikleri
        Map<String, Integer> allEmojis = calculateAllEmojis(textMessages);
        int totalEmojis = allEmojis.values().stream().mapToInt(Integer::intValue).sum();
        Map<String, Integer> topEmojis = EmojiUtils.getTopEmojis(allEmojis, TOP_EMOJI_LIMIT);

        // Tarih aralığı
        int totalDays = calculateTotalDays(messages);
        double avgMessagesPerDay = totalDays > 0 ? (double) textMessages.size() / totalDays : 0;

        // Highlights
        String mostActiveParticipant = findMostActive(messagesPerParticipant);
        String mostActiveHour = formatHour(findMostActiveHour(messagesByHour));
        String mostActiveDay = findMostActiveDay(messagesByDayOfWeek);

        // En uzun mesaj
        ChatMessage longestMessage = findLongestMessage(textMessages);

        return StatisticsResponse.builder()
                .totalMessages(textMessages.size())
                .totalParticipants(messagesPerParticipant.size())
                .totalDays(totalDays)
                .avgMessagesPerDay(Math.round(avgMessagesPerDay * 100.0) / 100.0)
                .messagesPerParticipant(messagesPerParticipant)
                .percentagePerParticipant(percentagePerParticipant)
                .messagesByHour(messagesByHour)
                .messagesByDayOfWeek(messagesByDayOfWeek)
                .totalEmojis(totalEmojis)
                .topEmojis(topEmojis)
                .mostActiveParticipant(mostActiveParticipant)
                .mostActiveHour(mostActiveHour)
                .mostActiveDay(mostActiveDay)
                .longestMessageSender(longestMessage != null ? longestMessage.getSender() : null)
                .longestMessageLength(longestMessage != null ? longestMessage.getMessage().length() : 0)
                .build();
    }

    /**
     * Katılımcı başına mesaj sayısı.
     */
    private Map<String, Integer> calculateMessagesPerParticipant(List<ChatMessage> messages) {
        return messages.stream()
                .collect(Collectors.groupingBy(
                        ChatMessage::getSender,
                        LinkedHashMap::new,
                        Collectors.summingInt(e -> 1)
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));
    }

    /**
     * Katılımcı başına yüzde hesaplar.
     */
    private Map<String, Double> calculatePercentages(Map<String, Integer> counts, int total) {
        if (total == 0) {
            return new HashMap<>();
        }

        return counts.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> Math.round((e.getValue() * 100.0 / total) * 100.0) / 100.0,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));
    }

    /**
     * Saat bazında mesaj dağılımı (0-23).
     */
    private Map<Integer, Integer> calculateMessagesByHour(List<ChatMessage> messages) {
        Map<Integer, Integer> hourMap = new LinkedHashMap<>();

        // 0-23 saat için başlangıç değerleri
        for (int i = 0; i < 24; i++) {
            hourMap.put(i, 0);
        }

        messages.forEach(msg -> {
            if (msg.getTimestamp() != null) {
                int hour = msg.getTimestamp().getHour();
                hourMap.merge(hour, 1, Integer::sum);
            }
        });

        return hourMap;
    }

    /**
     * Gün bazında mesaj dağılımı.
     */
    private Map<String, Integer> calculateMessagesByDayOfWeek(List<ChatMessage> messages) {
        Map<String, Integer> dayMap = new LinkedHashMap<>();

        // Pazartesi'den başlayarak sırala
        for (DayOfWeek day : DayOfWeek.values()) {
            dayMap.put(day.getDisplayName(TextStyle.FULL, LOCALE_TR), 0);
        }

        messages.forEach(msg -> {
            if (msg.getTimestamp() != null) {
                String dayName = msg.getTimestamp().getDayOfWeek()
                        .getDisplayName(TextStyle.FULL, LOCALE_TR);
                dayMap.merge(dayName, 1, Integer::sum);
            }
        });

        return dayMap;
    }

    /**
     * Tüm mesajlardaki emoji frekansı.
     */
    private Map<String, Integer> calculateAllEmojis(List<ChatMessage> messages) {
        Map<String, Integer> allEmojis = new HashMap<>();

        for (ChatMessage msg : messages) {
            Map<String, Integer> msgEmojis = EmojiUtils.getEmojiFrequency(msg.getMessage());
            allEmojis = EmojiUtils.mergeCounts(allEmojis, msgEmojis);
        }

        return allEmojis;
    }

    /**
     * İlk ve son mesaj arasındaki gün sayısı.
     */
    private int calculateTotalDays(List<ChatMessage> messages) {
        if (messages.isEmpty()) {
            return 0;
        }

        LocalDate firstDate = messages.stream()
                .filter(m -> m.getTimestamp() != null)
                .map(m -> m.getTimestamp().toLocalDate())
                .min(LocalDate::compareTo)
                .orElse(LocalDate.now());

        LocalDate lastDate = messages.stream()
                .filter(m -> m.getTimestamp() != null)
                .map(m -> m.getTimestamp().toLocalDate())
                .max(LocalDate::compareTo)
                .orElse(LocalDate.now());

        return (int) ChronoUnit.DAYS.between(firstDate, lastDate) + 1;
    }

    /**
     * En çok mesaj atan katılımcı.
     */
    private String findMostActive(Map<String, Integer> messagesPerParticipant) {
        return messagesPerParticipant.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    /**
     * En aktif saat.
     */
    private int findMostActiveHour(Map<Integer, Integer> messagesByHour) {
        return messagesByHour.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(0);
    }

    /**
     * En aktif gün.
     */
    private String findMostActiveDay(Map<String, Integer> messagesByDayOfWeek) {
        return messagesByDayOfWeek.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    /**
     * En uzun mesajı bulur.
     */
    private ChatMessage findLongestMessage(List<ChatMessage> messages) {
        return messages.stream()
                .max((m1, m2) -> Integer.compare(
                        m1.getMessage().length(),
                        m2.getMessage().length()
                ))
                .orElse(null);
    }

    /**
     * Saat formatlar: 14 -> "14:00"
     */
    private String formatHour(int hour) {
        return String.format("%02d:00", hour);
    }
}