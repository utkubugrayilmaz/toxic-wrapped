package com.toxicwrapped.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Ana analysis response - her şeyi birleştirir.
 * Frontend bu response'u alıp Wrapped UI'ı render eder.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResponse {

    // Temel istatistikler
    private StatisticsResponse statistics;

    // ML analizleri (katılımcı bazlı)
    private Map<String, ParticipantAnalysis> participantAnalyses;

    // Genel sohbet tonu
    private OverallTone overallTone;

    // İşlem bilgisi
    private ProcessingInfo processingInfo;

    /**
     * Her katılımcı için ML analiz sonuçları
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantAnalysis {
        private String participant;
        private int analyzedMessages;
        private Map<String, Double> behaviorDistribution;  // gaslighting: 15%, neutral: 80%...
        private String dominantBehavior;
        private List<FlaggedMessage> flaggedMessages;      // Dikkat çeken mesajlar
    }

    /**
     * Dikkat çeken (toxic) mesajlar
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlaggedMessage {
        private String message;
        private String label;
        private double confidence;
    }

    /**
     * Genel sohbet tonu özeti
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverallTone {
        private String dominantTone;          // "Mostly Neutral", "Some Concerns"
        private Map<String, Double> distribution;
        private int totalAnalyzedMessages;
        private int flaggedCount;             // Toxic olarak işaretlenen mesaj sayısı
    }

    /**
     * İşlem meta bilgisi
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProcessingInfo {
        private long processingTimeMs;
        private int totalMessages;
        private int analyzedMessages;
        private int skippedMessages;
        private String mlServiceStatus;       // "connected", "unavailable"
    }
}