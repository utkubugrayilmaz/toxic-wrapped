package com.toxicwrapped.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Analiz seçenekleri.
 * File ayrı olarak Controller'da @RequestParam ile alınır.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzeRequest {

    // Opsiyonel: Sadece belirli kişileri analiz et
    private String targetParticipant;

    // Opsiyonel: ML analizi yapılsın mı?
    @Builder.Default
    private boolean includeMlAnalysis = true;
}