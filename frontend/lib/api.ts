import { AnalysisResponse, HealthResponse } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

/**
 * Backend health check
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/health`);
  
  if (!response.ok) {
    throw new Error('Backend bağlantısı başarısız');
  }
  
  return response.json();
}

/**
 * WhatsApp chat dosyasını analiz et
 */
export async function analyzeChat(file: File): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Analiz başarısız oldu');
  }

  return response.json();
}