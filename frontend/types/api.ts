// ===========================================
// API Response Types - Backend ile birebir eşleşmeli
// ===========================================

export type BehaviorLabel =
  | 'gaslighting'
  | 'love_bombing'
  | 'passive_aggressive'
  | 'neutral';

export interface FlaggedMessage {
  message: string;
  label: BehaviorLabel;
  confidence: number;
}

export interface ParticipantAnalysis {
  participant: string;
  analyzedMessages: number;
  behaviorDistribution: Record<BehaviorLabel, number>;
  dominantBehavior: BehaviorLabel;
  flaggedMessages: FlaggedMessage[];
}

export interface OverallTone {
  dominantTone: string;
  distribution: Record<BehaviorLabel, number>;
  totalAnalyzedMessages: number;
  flaggedCount: number;
}

export interface ProcessingInfo {
  processingTimeMs: number;
  totalMessages: number;
  analyzedMessages: number;
  skippedMessages: number;
  mlServiceStatus: 'connected' | 'unavailable';
}

export interface Statistics {
  totalMessages: number;
  totalParticipants: number;
  totalDays: number;
  avgMessagesPerDay: number;
  messagesPerParticipant: Record<string, number>;
  percentagePerParticipant: Record<string, number>;
  messagesByHour: Record<string, number>;
  messagesByDayOfWeek: Record<string, number>;
  totalEmojis: number;
  topEmojis: Record<string, number>;
  mostActiveParticipant: string;
  mostActiveHour: string;
  mostActiveDay: string;
  longestMessageSender: string;
  longestMessageLength: number;
}

export interface AnalysisResponse {
  statistics: Statistics;
  participantAnalyses: Record<string, ParticipantAnalysis>;
  overallTone: OverallTone;
  processingInfo: ProcessingInfo;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  service: string;
  mlServiceHealthy: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  timestamp: string;
}