'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DropZone } from '@/components/upload/DropZone';
import { TypingIndicator, GlassCard } from '@/components/ui';
import { analyzeChat } from '@/lib/api';
import { AnalysisResponse } from '@/types/api';
import { MessageCircle, Shield, Sparkles } from 'lucide-react';

type AppState = 'upload' | 'analyzing' | 'results';

export default function Home() {
  const [state, setState] = useState<AppState>('upload');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setState('analyzing');

    try {
      const response = await analyzeChat(file);
      setResult(response);
      setState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      setState('upload');
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Upload State */}
      {state === 'upload' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col items-center justify-center p-6"
        >
          {/* Logo & Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-[#E9EDEF] mb-2">
              Toxic <span className="text-[#25D366]">Wrapped</span>
            </h1>
            <p className="text-[#8696A0]">
              WhatsApp sohbetlerini analiz et, gerçekleri gör
            </p>
          </motion.div>

          {/* DropZone */}
          <DropZone
            onFileSelect={handleFileSelect}
            isLoading={false}
            error={error}
          />

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 mt-12"
          >
            <Feature
              icon={<MessageCircle className="w-5 h-5" />}
              text="Mesaj Analizi"
            />
            <Feature
              icon={<Sparkles className="w-5 h-5" />}
              text="AI Destekli"
            />
            <Feature
              icon={<Shield className="w-5 h-5" />}
              text="Veriler Saklanmaz"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Analyzing State */}
      {state === 'analyzing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center p-6"
        >
          <GlassCard className="text-center">
            <h2 className="text-xl font-semibold text-[#E9EDEF] mb-4">
              Sohbet analiz ediliyor...
            </h2>
            <div className="flex justify-center mb-4">
              <TypingIndicator />
            </div>
            <p className="text-[#8696A0] text-sm">
              Bu işlem birkaç saniye sürebilir
            </p>
          </GlassCard>
        </motion.div>
      )}

      {/* Results State - Şimdilik basit gösterim */}
      {state === 'results' && result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center p-6"
        >
          <GlassCard className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-[#25D366] mb-4">
              🎉 Analiz Tamamlandı!
            </h2>
            
            <div className="space-y-3 text-[#E9EDEF]">
              <p>
                <span className="text-[#8696A0]">Toplam Mesaj:</span>{' '}
                <strong>{result.statistics.totalMessages}</strong>
              </p>
              <p>
                <span className="text-[#8696A0]">Katılımcı:</span>{' '}
                <strong>{result.statistics.totalParticipants}</strong>
              </p>
              <p>
                <span className="text-[#8696A0]">En Aktif:</span>{' '}
                <strong>{result.statistics.mostActiveParticipant}</strong>
              </p>
              <p>
                <span className="text-[#8696A0]">Genel Ton:</span>{' '}
                <strong>{result.overallTone.dominantTone}</strong>
              </p>
            </div>

            <button
              onClick={() => {
                setState('upload');
                setResult(null);
              }}
              className="mt-6 w-full py-3 bg-[#25D366] text-white font-semibold rounded-lg hover:bg-[#1da851] transition-colors"
            >
              Yeni Analiz
            </button>
          </GlassCard>
        </motion.div>
      )}
    </main>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[#8696A0]">
      {icon}
      <span className="text-sm">{text}</span>
    </div>
  );
}