package com.toxicwrapped.backend.service;

import com.toxicwrapped.backend.dto.response.AnalysisResponse.FlaggedMessage;
import com.toxicwrapped.backend.dto.response.AnalysisResponse.OverallTone;
import com.toxicwrapped.backend.dto.response.AnalysisResponse.ParticipantAnalysis;
import com.toxicwrapped.backend.dto.response.MlAnalysisResponse;
import com.toxicwrapped.backend.model.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * ML Service (FastAPI) ile iletişim kurar.
 * Akıllı sampling ile sadece "ilginç" mesajları analiz eder.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MlClientService {

    private final WebClient mlServiceWebClient;

    // Sampling ayarları
    private static final int CONTEXT_SIZE = 5;           // Her mesaj için kaç önceki mesaj
    private static final int MAX_MESSAGES_TO_ANALYZE = 100;  // Maximum analiz edilecek mesaj
    private static final int MIN_MESSAGE_LENGTH = 15;    // Minimum mesaj uzunluğu
    private static final double TOXIC_THRESHOLD = 70.0;  // Bu üstü "flagged" sayılır

    // Toxic label'lar (neutral hariç)
    private static final List<String> TOXIC_LABELS = List.of(
            "gaslighting", "love_bombing", "passive_aggressive"
    );

    /**
     * ML Service'in ayakta olup olmadığını kontrol eder.
     */
    public boolean isServiceHealthy() {
        try {
            var response = mlServiceWebClient.get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            return response != null && "ok".equals(response.get("status"));
        } catch (WebClientException e) {
            log.warn("ML Service health check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Mesajları analiz eder ve katılımcı bazlı sonuçlar döner.
     */
    public Map<String, ParticipantAnalysis> analyzeMessages(List<ChatMessage> messages) {
        if (!isServiceHealthy()) {
            log.warn("ML Service unavailable, skipping analysis");
            return new HashMap<>();
        }

        // Analiz edilebilir mesajları filtrele ve sample al
        List<ChatMessage> analyzableMessages = selectMessagesForAnalysis(messages);
        log.info("Analiz için {} mesaj seçildi (toplam: {})", analyzableMessages.size(), messages.size());

        // Her mesajı analiz et
        Map<String, List<MlResultWithMessage>> resultsByParticipant = new HashMap<>();

        for (int i = 0; i < analyzableMessages.size(); i++) {
            ChatMessage target = analyzableMessages.get(i);
            List<ChatMessage> context = getContext(messages, target, CONTEXT_SIZE);

            try {
                MlAnalysisResponse response = analyzeSingleMessage(context, target);

                if (response != null) {
                    resultsByParticipant
                            .computeIfAbsent(target.getSender(), k -> new ArrayList<>())
                            .add(new MlResultWithMessage(target.getMessage(), response));
                }
            } catch (Exception e) {
                log.warn("Mesaj analiz hatası: {}", e.getMessage());
            }
        }

        // Katılımcı bazlı özet oluştur
        return buildParticipantAnalyses(resultsByParticipant);
    }

    /**
     * Genel sohbet tonunu hesaplar.
     */
    public OverallTone calculateOverallTone(Map<String, ParticipantAnalysis> participantAnalyses) {
        if (participantAnalyses.isEmpty()) {
            return OverallTone.builder()
                    .dominantTone("Analiz yapılamadı")
                    .distribution(new HashMap<>())
                    .totalAnalyzedMessages(0)
                    .flaggedCount(0)
                    .build();
        }

        // Tüm davranışları birleştir
        Map<String, Double> totalDistribution = new HashMap<>();
        int totalMessages = 0;
        int flaggedCount = 0;

        for (ParticipantAnalysis analysis : participantAnalyses.values()) {
            totalMessages += analysis.getAnalyzedMessages();
            flaggedCount += analysis.getFlaggedMessages().size();

            for (Map.Entry<String, Double> entry : analysis.getBehaviorDistribution().entrySet()) {
                totalDistribution.merge(entry.getKey(), entry.getValue(), Double::sum);
            }
        }

        // Ortalama al
        int participantCount = participantAnalyses.size();
        for (String key : totalDistribution.keySet()) {
            totalDistribution.compute(key, (k, v) -> Math.round((v / participantCount) * 100.0) / 100.0);
        }

        // Dominant tone belirle
        String dominantTone = determineDominantTone(totalDistribution, flaggedCount, totalMessages);

        return OverallTone.builder()
                .dominantTone(dominantTone)
                .distribution(totalDistribution)
                .totalAnalyzedMessages(totalMessages)
                .flaggedCount(flaggedCount)
                .build();
    }

    /**
     * Tek bir mesajı ML Service'e gönderir.
     */
    private MlAnalysisResponse analyzeSingleMessage(List<ChatMessage> context, ChatMessage target) {
        // Request body oluştur
        Map<String, Object> requestBody = new HashMap<>();

        List<Map<String, String>> contextList = context.stream()
                .map(msg -> Map.of(
                        "sender", msg.getSender(),
                        "message", msg.getMessage()
                ))
                .collect(Collectors.toList());

        requestBody.put("context", contextList);
        requestBody.put("target", Map.of(
                "sender", target.getSender(),
                "message", target.getMessage()
        ));

        return mlServiceWebClient.post()
                .uri("/analyze")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(MlAnalysisResponse.class)
                .block();
    }

    /**
     * Analiz için mesaj seçimi yapar (akıllı sampling).
     */
    private List<ChatMessage> selectMessagesForAnalysis(List<ChatMessage> messages) {
        // Önce analiz edilebilir mesajları filtrele
        List<ChatMessage> candidates = messages.stream()
                .filter(ChatMessage::isAnalyzable)
                .filter(m -> m.getMessage().length() >= MIN_MESSAGE_LENGTH)
                .toList();

        // Çok fazla mesaj varsa sampling yap
        if (candidates.size() <= MAX_MESSAGES_TO_ANALYZE) {
            return candidates;
        }

        // Eşit aralıklarla seç
        List<ChatMessage> sampled = new ArrayList<>();
        double step = (double) candidates.size() / MAX_MESSAGES_TO_ANALYZE;

        for (int i = 0; i < MAX_MESSAGES_TO_ANALYZE; i++) {
            int index = (int) (i * step);
            sampled.add(candidates.get(index));
        }

        return sampled;
    }

    /**
     * Bir mesaj için context (önceki mesajlar) döner.
     */
    private List<ChatMessage> getContext(List<ChatMessage> allMessages, ChatMessage target, int contextSize) {
        int targetIndex = allMessages.indexOf(target);
        if (targetIndex <= 0) {
            return new ArrayList<>();
        }

        int startIndex = Math.max(0, targetIndex - contextSize);
        return new ArrayList<>(allMessages.subList(startIndex, targetIndex));
    }

    /**
     * Katılımcı analizlerini oluşturur.
     */
    private Map<String, ParticipantAnalysis> buildParticipantAnalyses(
            Map<String, List<MlResultWithMessage>> resultsByParticipant) {

        Map<String, ParticipantAnalysis> analyses = new LinkedHashMap<>();

        for (Map.Entry<String, List<MlResultWithMessage>> entry : resultsByParticipant.entrySet()) {
            String participant = entry.getKey();
            List<MlResultWithMessage> results = entry.getValue();

            // Davranış dağılımı hesapla
            Map<String, Double> behaviorDistribution = calculateBehaviorDistribution(results);

            // Dominant davranış
            String dominantBehavior = behaviorDistribution.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("neutral");

            // Flagged mesajlar (toxic ve yüksek confidence)
            List<FlaggedMessage> flaggedMessages = results.stream()
                    .filter(r -> TOXIC_LABELS.contains(r.response.getLabel()))
                    .filter(r -> r.response.getConfidence() >= TOXIC_THRESHOLD)
                    .map(r -> FlaggedMessage.builder()
                            .message(truncateMessage(r.message, 100))
                            .label(r.response.getLabel())
                            .confidence(r.response.getConfidence())
                            .build())
                    .limit(5)  // En fazla 5 flagged mesaj göster
                    .collect(Collectors.toList());

            analyses.put(participant, ParticipantAnalysis.builder()
                    .participant(participant)
                    .analyzedMessages(results.size())
                    .behaviorDistribution(behaviorDistribution)
                    .dominantBehavior(dominantBehavior)
                    .flaggedMessages(flaggedMessages)
                    .build());
        }

        return analyses;
    }

    /**
     * Davranış dağılımı yüzdesi hesaplar.
     */
    private Map<String, Double> calculateBehaviorDistribution(List<MlResultWithMessage> results) {
        Map<String, Integer> counts = new HashMap<>();
        counts.put("gaslighting", 0);
        counts.put("love_bombing", 0);
        counts.put("passive_aggressive", 0);
        counts.put("neutral", 0);

        for (MlResultWithMessage result : results) {
            String label = result.response.getLabel();
            counts.merge(label, 1, Integer::sum);
        }

        int total = results.size();
        Map<String, Double> distribution = new LinkedHashMap<>();

        for (Map.Entry<String, Integer> entry : counts.entrySet()) {
            double percentage = total > 0 ? (entry.getValue() * 100.0 / total) : 0;
            distribution.put(entry.getKey(), Math.round(percentage * 100.0) / 100.0);
        }

        return distribution;
    }

    /**
     * Genel ton belirler.
     */
    private String determineDominantTone(Map<String, Double> distribution, int flaggedCount, int totalMessages) {
        double neutralPercentage = distribution.getOrDefault("neutral", 0.0);

        if (neutralPercentage >= 80) {
            return "Sağlıklı İletişim ✅";
        } else if (neutralPercentage >= 60) {
            return "Genel Olarak Normal 👍";
        } else if (flaggedCount > totalMessages * 0.3) {
            return "Dikkat Edilmeli ⚠️";
        } else {
            return "Bazı Endişeler Var 🔍";
        }
    }

    /**
     * Mesajı belirli uzunlukta keser.
     */
    private String truncateMessage(String message, int maxLength) {
        if (message.length() <= maxLength) {
            return message;
        }
        return message.substring(0, maxLength - 3) + "...";
    }

    /**
     * İç sınıf: Mesaj ve ML sonucunu birlikte tutar.
     */
    private record MlResultWithMessage(String message, MlAnalysisResponse response) {}
}