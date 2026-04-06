'use client';

import { motion } from 'framer-motion';
import { getBehaviorNarrative, getDominantBehaviorNarrative } from '@/lib/narrativeEngine';
import { BehaviorLabel, ParticipantAnalysis } from '@/types/api';

interface BehaviorCardProps {
  participant: ParticipantAnalysis;
}

const BEHAVIOR_LABELS: Record<BehaviorLabel, string> = {
  gaslighting: 'Gaslighting',
  love_bombing: 'Love Bombing',
  passive_aggressive: 'Pasif Agresif',
  neutral: 'Normal',
};

const BEHAVIOR_COLORS: Record<BehaviorLabel, string> = {
  gaslighting: 'bg-amber-500',
  love_bombing: 'bg-pink-500',
  passive_aggressive: 'bg-blue-500',
  neutral: 'bg-whatsapp-green',
};

export function BehaviorCard({ participant }: BehaviorCardProps) {
  const { dominantBehavior, behaviorDistribution, analyzedMessages } = participant;
  const dominantNarrative = getDominantBehaviorNarrative(
    dominantBehavior,
    behaviorDistribution[dominantBehavior] || 0
  );

  // Sıralı behavior listesi (yüksekten düşüğe)
  const sortedBehaviors = Object.entries(behaviorDistribution)
    .sort((a, b) => b[1] - a[1])
    .filter(([, value]) => value > 0) as [BehaviorLabel, number][];

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative">
      {/* Background based on dominant behavior */}
      <div className={`absolute inset-0 pointer-events-none ${
        dominantBehavior === 'gaslighting' ? 'bg-linear-to-b from-amber-500/15 via-transparent to-transparent' :
        dominantBehavior === 'love_bombing' ? 'bg-linear-to-b from-pink-500/15 via-transparent to-transparent' :
        dominantBehavior === 'passive_aggressive' ? 'bg-linear-to-b from-blue-500/15 via-transparent to-transparent' :
        'bg-linear-to-b from-whatsapp-green/15 via-transparent to-transparent'
      }`} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center relative z-10 w-full max-w-md"
      >
        {/* Participant Name */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-whatsapp-text-secondary mb-2"
        >
          {participant.participant}
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className={`text-2xl sm:text-3xl font-bold mb-2 ${
            dominantBehavior === 'neutral' ? 'text-whatsapp-green' : 'text-amber-400'
          }`}
        >
          {dominantNarrative.headline}
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-whatsapp-text-secondary text-sm mb-6"
        >
          {dominantNarrative.subtext}
        </motion.p>

        {/* Behavior Distribution Bars */}
        <div className="space-y-3 mb-6">
          {sortedBehaviors.map(([behavior, percentage], index) => {
            const narrative = getBehaviorNarrative(behavior, percentage);
            return (
              <motion.div
                key={behavior}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-left"
              >
                <div className="flex justify-between mb-1">
                  <span className="text-whatsapp-text-primary text-sm flex items-center gap-2">
                    <span>{narrative.emoji}</span>
                    {BEHAVIOR_LABELS[behavior]}
                  </span>
                  <span className="text-whatsapp-text-secondary text-sm">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-whatsapp-dark rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                    className={`h-full rounded-full ${BEHAVIOR_COLORS[behavior]}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Analyzed Count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-whatsapp-text-secondary text-xs"
        >
          {analyzedMessages} mesaj analiz edildi
        </motion.p>
      </motion.div>
    </div>
  );
}