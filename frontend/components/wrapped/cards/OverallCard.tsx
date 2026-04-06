'use client';

import { motion } from 'framer-motion';
import { getOverallToneNarrative } from '@/lib/narrativeEngine';
import { OverallTone } from '@/types/api';

interface OverallCardProps {
  overallTone: OverallTone;
}

export function OverallCard({ overallTone }: OverallCardProps) {
  const narrative = getOverallToneNarrative(
    overallTone.dominantTone,
    overallTone.flaggedCount,
    overallTone.totalAnalyzedMessages
  );

  const severityColors = {
    safe: 'from-whatsapp-green/20',
    warning: 'from-amber-500/20',
    danger: 'from-red-500/20',
  };

  const severityTextColors = {
    safe: 'text-whatsapp-green',
    warning: 'text-amber-400',
    danger: 'text-red-400',
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative">
      {/* Background */}
      <div className={`absolute inset-0 bg-linear-to-b ${severityColors[narrative.severity]} via-transparent to-transparent pointer-events-none`} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center relative z-10 w-full max-w-md"
      >
        {/* Emoji */}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-7xl block mb-6"
        >
          {narrative.emoji}
        </motion.span>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-3xl sm:text-4xl font-bold mb-4 ${severityTextColors[narrative.severity]}`}
        >
          {narrative.title}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-whatsapp-text-secondary leading-relaxed mb-8"
        >
          {narrative.description}
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center gap-6"
        >
          <div className="bg-whatsapp-light/60 px-4 py-3 rounded-xl">
            <p className="text-2xl font-bold text-whatsapp-text-primary">
              {overallTone.totalAnalyzedMessages}
            </p>
            <p className="text-whatsapp-text-secondary text-xs">analiz edilen</p>
          </div>
          <div className="bg-whatsapp-light/60 px-4 py-3 rounded-xl">
            <p className={`text-2xl font-bold ${severityTextColors[narrative.severity]}`}>
              {overallTone.flaggedCount}
            </p>
            <p className="text-whatsapp-text-secondary text-xs">flagged mesaj</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}