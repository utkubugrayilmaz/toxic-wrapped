package com.toxicwrapped.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * ML Service'den gelen response.
 * FastAPI'deki AnalyzeResponse ile uyumlu.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MlAnalysisResponse {

    private String label;
    private double confidence;
    private Map<String, Double> scores;
}