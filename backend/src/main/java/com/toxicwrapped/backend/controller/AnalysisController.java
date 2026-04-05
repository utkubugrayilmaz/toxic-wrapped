package com.toxicwrapped.backend.controller;

import com.toxicwrapped.backend.dto.response.AnalysisResponse;
import com.toxicwrapped.backend.dto.response.AnalysisResponse.OverallTone;
import com.toxicwrapped.backend.dto.response.AnalysisResponse.ParticipantAnalysis;
import com.toxicwrapped.backend.dto.response.AnalysisResponse.ProcessingInfo;
import com.toxicwrapped.backend.dto.response.StatisticsResponse;
import com.toxicwrapped.backend.model.ChatMessage;
import com.toxicwrapped.backend.service.MlClientService;
import com.toxicwrapped.backend.service.StatisticsService;
import com.toxicwrapped.backend.service.WhatsAppParserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Ana API endpoint'leri.
 * WhatsApp sohbet analizi için tek entry point.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class AnalysisController {

    private final WhatsAppParserService parserService;
    private final StatisticsService statisticsService;
    private final MlClientService mlClientService;

    /**
     * Health check endpoint.
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("service", "toxic-wrapped-backend");
        response.put("mlServiceHealthy", mlClientService.isServiceHealthy());
        return ResponseEntity.ok(response);
    }

    /**
     * Ana analiz endpoint'i.
     * WhatsApp .txt dosyası alır, istatistik + ML analizi yapar.
     */
    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnalysisResponse> analyze(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "targetParticipant", required = false) String targetParticipant,
            @RequestParam(value = "includeMlAnalysis", defaultValue = "true") boolean includeMlAnalysis
    ) {
        long startTime = System.currentTimeMillis();
        log.info("Analiz başlatıldı - Dosya: {}, Boyut: {} bytes",
                file.getOriginalFilename(), file.getSize());

        // 1. Parse
        List<ChatMessage> messages = parserService.parse(file);
        log.info("Parse tamamlandı: {} mesaj", messages.size());

        // 2. Katılımcı filtresi (opsiyonel)
        if (targetParticipant != null && !targetParticipant.isBlank()) {
            messages = filterByParticipant(messages, targetParticipant);
            log.info("Katılımcı filtresi uygulandı: {} mesaj kaldı", messages.size());
        }

        // 3. İstatistikler
        StatisticsResponse statistics = statisticsService.calculateStatistics(messages);

        // 4. ML Analizi (opsiyonel)
        Map<String, ParticipantAnalysis> participantAnalyses = new HashMap<>();
        OverallTone overallTone = null;
        String mlStatus = "skipped";

        if (includeMlAnalysis) {
            if (mlClientService.isServiceHealthy()) {
                participantAnalyses = mlClientService.analyzeMessages(messages);
                overallTone = mlClientService.calculateOverallTone(participantAnalyses);
                mlStatus = "connected";
                log.info("ML analizi tamamlandı: {} katılımcı analiz edildi", participantAnalyses.size());
            } else {
                mlStatus = "unavailable";
                log.warn("ML Service unavailable, analiz atlandı");
            }
        }

        // 5. Processing info
        long processingTime = System.currentTimeMillis() - startTime;
        ProcessingInfo processingInfo = ProcessingInfo.builder()
                .processingTimeMs(processingTime)
                .totalMessages(messages.size())
                .analyzedMessages(participantAnalyses.values().stream()
                        .mapToInt(ParticipantAnalysis::getAnalyzedMessages)
                        .sum())
                .skippedMessages(messages.size() - (int) messages.stream()
                        .filter(ChatMessage::isAnalyzable)
                        .count())
                .mlServiceStatus(mlStatus)
                .build();

        // 6. Response
        AnalysisResponse response = AnalysisResponse.builder()
                .statistics(statistics)
                .participantAnalyses(participantAnalyses)
                .overallTone(overallTone)
                .processingInfo(processingInfo)
                .build();

        log.info("Analiz tamamlandı - {} ms", processingTime);
        return ResponseEntity.ok(response);
    }

    /**
     * Sadece istatistik endpoint'i (ML analizi olmadan).
     * Daha hızlı response için.
     */
    @PostMapping(value = "/statistics", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StatisticsResponse> statistics(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "targetParticipant", required = false) String targetParticipant
    ) {
        log.info("İstatistik analizi başlatıldı - Dosya: {}", file.getOriginalFilename());

        List<ChatMessage> messages = parserService.parse(file);

        if (targetParticipant != null && !targetParticipant.isBlank()) {
            messages = filterByParticipant(messages, targetParticipant);
        }

        StatisticsResponse statistics = statisticsService.calculateStatistics(messages);

        log.info("İstatistik analizi tamamlandı");
        return ResponseEntity.ok(statistics);
    }

    /**
     * Katılımcıya göre mesaj filtreler.
     */
    private List<ChatMessage> filterByParticipant(List<ChatMessage> messages, String participant) {
        long distinctParticipants = messages.stream()
                .map(ChatMessage::getSender)
                .distinct()
                .count();

        // 2 kişilik sohbette tüm mesajları göster
        if (distinctParticipants == 2) {
            return messages;
        }

        // Grup sohbetinde sadece belirtilen katılımcının mesajları
        return messages.stream()
                .filter(m -> m.getSender().equalsIgnoreCase(participant))
                .toList();
    }
}