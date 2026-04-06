'use client';

import { motion } from 'framer-motion';
import { getEmojiNarrative } from '@/lib/narrativeEngine';

interface EmojiCardProps {
  totalEmojis: number;
  topEmojis: Record<string, number>;
  totalMessages: number;
}

export function EmojiCard({ totalEmojis, topEmojis, totalMessages }: EmojiCardProps) {
  const narrative = getEmojiNarrative(totalEmojis, topEmojis, totalMessages);
  
  const topFive = Object.entries(topEmojis)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 via-transparent to-orange-500/10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center relative z-10 w-full max-w-md"
      >
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-whatsapp-text-primary mb-2"
        >
          {narrative.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-whatsapp-text-secondary mb-8"
        >
          Toplam <span className="text-whatsapp-green font-bold">{totalEmojis.toLocaleString('tr-TR')}</span> emoji
        </motion.p>

        {/* Top Emojis */}
        {topFive.length > 0 && (
          <div className="flex justify-center items-end gap-4 mb-8">
            {topFive.map(([emoji, count], index) => (
              <motion.div
                key={emoji}
                initial={{ opacity: 0, y: 20, scale: 0 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.15, type: 'spring' }}
                className="flex flex-col items-center"
              >
                <span className={`${index === 0 ? 'text-6xl' : index < 3 ? 'text-5xl' : 'text-4xl'} mb-2`}>
                  {emoji}
                </span>
                <span className="text-whatsapp-text-secondary text-sm">
                  {count}x
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Narrative */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-whatsapp-text-secondary text-sm leading-relaxed"
        >
          {narrative.description}
        </motion.p>
      </motion.div>
    </div>
  );
}