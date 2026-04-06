'use client';

import { motion } from 'framer-motion';
import { Share2, RotateCcw } from 'lucide-react';

interface FinalCardProps {
  totalMessages: number;
  dominantTone: string;
  onRestart: () => void;
}

export function FinalCard({ totalMessages, dominantTone, onRestart }: FinalCardProps) {
  const handleShare = async () => {
    const shareText = `🔍 WhatsApp Wrapped sonuçlarım:\n📊 ${totalMessages.toLocaleString('tr-TR')} mesaj analiz edildi\n${dominantTone}\n\nSen de dene: [URL]`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Toxic Wrapped Sonuçlarım',
          text: shareText,
        });
      } catch {

        // Kullanıcı iptal etti veya hata
        console.log('Share cancelled');
      }
    } else {
      // Fallback: clipboard
      await navigator.clipboard.writeText(shareText);
      alert('Sonuçlar kopyalandı!');
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-whatsapp-green/20 via-transparent to-whatsapp-teal/10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center relative z-10 w-full max-w-md"
      >
        {/* Celebration Emoji */}
        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-7xl block mb-6"
        >
          🎉
        </motion.span>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-whatsapp-text-primary mb-2"
        >
          {"Wrapped'in Bitti!"}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-whatsapp-text-secondary mb-8"
        >
          Umarız ilginç şeyler öğrenmişsindir 👀
        </motion.p>

        {/* Privacy Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-whatsapp-light/60 rounded-xl p-4 mb-8"
        >
          <p className="text-whatsapp-text-secondary text-sm flex items-center justify-center gap-2">
            🔒 Verilerinin hiçbiri kaydedilmedi
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 bg-whatsapp-green hover:bg-whatsapp-teal text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            <Share2 className="w-5 h-5" />
            Paylaş
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRestart();
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-whatsapp-light hover:bg-whatsapp-border text-whatsapp-text-primary font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Yeni Analiz
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}