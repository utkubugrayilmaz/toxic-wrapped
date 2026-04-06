'use client';

import { motion } from 'framer-motion';
import { getFlaggedMessageIntro } from '@/lib/narrativeEngine';
import { FlaggedMessage, BehaviorLabel } from '@/types/api';

interface RedFlagsCardProps {
  flaggedMessages: FlaggedMessage[];
  participantName: string;
}

const BEHAVIOR_EMOJIS: Record<BehaviorLabel, string> = {
  gaslighting: '🌀',
  love_bombing: '🎈',
  passive_aggressive: '🥶',
  neutral: '✅',
};

export function RedFlagsCard({ flaggedMessages, participantName }: RedFlagsCardProps) {
  const intro = getFlaggedMessageIntro(flaggedMessages.length);
  
  // En yüksek confidence'lı 3 mesajı al
  const topFlags = [...flaggedMessages]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-b from-red-500/10 via-transparent to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center relative z-10 w-full max-w-md"
      >
        {/* Emoji */}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="text-5xl block mb-4"
        >
          🚩
        </motion.span>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-whatsapp-text-primary mb-1"
        >
          {participantName}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-whatsapp-text-secondary text-sm mb-6"
        >
          {intro}
        </motion.p>

        {/* Flagged Messages */}
        {topFlags.length > 0 ? (
          <div className="space-y-3 text-left">
            {topFlags.map((flag, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.2 }}
                className="bg-whatsapp-light/60 rounded-lg p-3 border-l-4 border-red-400"
              >
                <p className="text-whatsapp-text-primary text-sm mb-2 leading-relaxed">
                  &ldquo;{flag.message}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-whatsapp-text-secondary flex items-center gap-1">
                    {BEHAVIOR_EMOJIS[flag.label]} {flag.label.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-red-400 font-medium">
                    {flag.confidence.toFixed(0)}% emin
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-whatsapp-green"
          >
            Temiz! 🎉
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}