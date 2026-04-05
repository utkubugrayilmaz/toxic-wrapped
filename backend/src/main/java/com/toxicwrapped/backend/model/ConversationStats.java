package com.toxicwrapped.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationStats {

    // Genel istatistikler
    private int totalMessages;
    private int totalParticipants;
    private int totalDays;

    // Katılımcı bazlı
    private Map<String, Integer> messagesPerParticipant;
    private Map<String, Double> percentagePerParticipant;

    // Zaman bazlı
    private Map<Integer, Integer> messagesByHour;
    private Map<String, Integer> messagesByDayOfWeek;

    // Emoji istatistikleri
    private int totalEmojis;
    private Map<String, Integer> topEmojis;
    private Map<String, Integer> emojisPerParticipant;

    // İlginç metrikler (Wrapped için)
    private String mostActiveParticipant;
    private String mostActiveHour;
    private String mostActiveDay;
    private double avgMessagesPerDay;

    // En uzun mesaj
    private String longestMessageSender;
    private int longestMessageLength;
}