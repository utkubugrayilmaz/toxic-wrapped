'use client';

import { motion } from 'framer-motion';
import { getBalanceNarrative } from '@/lib/narrativeEngine';

interface BalanceCardProps {
  messagesPerParticipant: Record<string, number>;
  percentagePerParticipant: Record<string, number>;
}

export function BalanceCard({ messagesPerParticipant, percentagePerParticipant }: BalanceCardProps) {
  const narrative = getBalanceNarrative(percentagePerParticipant);
  const participants = Object.entries(percentagePerParticipant).sort((a, b) => b[1] - a[1]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />

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
          className="text-6xl block mb-4"
        >
          {narrative.emoji}
        </motion.span>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-whatsapp-text-primary mb-6"
        >
          {narrative.title}
        </motion.h2>

        {/* Participant Bars */}
        <div className="space-y-4 mb-6">
          {participants.map(([name, percentage], index) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.2 }}
              className="text-left"
            >
              <div className="flex justify-between mb-1">
                <span className="text-whatsapp-text-primary font-medium">{name}</span>
                <span className="text-whatsapp-green font-bold">{percentage.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-whatsapp-dark rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.6 + index * 0.2, duration: 0.8 }}
                  className={`h-full rounded-full ${
                    index === 0 ? 'bg-whatsapp-green' : 'bg-whatsapp-teal'
                  }`}
                />
              </div>
              <p className="text-whatsapp-text-secondary text-xs mt-1">
                {messagesPerParticipant[name]?.toLocaleString('tr-TR')} mesaj
              </p>
            </motion.div>
          ))}
        </div>

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