import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind class'larını birleştirir ve çakışmaları çözer.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Confidence değerini okunabilir formata çevirir.
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence)}%`;
}

/**
 * Milliseconds'ı okunabilir süreye çevirir.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Sayıyı locale-aware formatta gösterir.
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('tr-TR');
}