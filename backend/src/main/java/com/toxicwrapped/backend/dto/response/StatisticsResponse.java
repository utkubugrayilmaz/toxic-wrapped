package com.toxicwrapped.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Temel istatistikler response'u.
 * Frontend'de Wrapped kartları için kullanılacak.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsResponse {

    // Genel
    private int totalMessages;
    private int totalParticipants;
    private int totalDays;
    private double avgMessagesPerDay;

    // Katılımcı bazlı
    private Map<String, Integer> messagesPerParticipant;
    private Map<String, Double> percentagePerParticipant;

    // Zaman bazlı
    private Map<Integer, Integer> messagesByHour;
    private Map<String, Integer> messagesByDayOfWeek;

    // Emoji
    private int totalEmojis;
    private Map<String, Integer> topEmojis;

    // Highlights (Wrapped kartları için)
    private String mostActiveParticipant;
    private String mostActiveHour;
    private String mostActiveDay;
    private String longestMessageSender;
    private int longestMessageLength;
}