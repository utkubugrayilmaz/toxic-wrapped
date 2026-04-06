'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getVolumeNarrative } from '@/lib/narrativeEngine';
import { formatNumber } from '@/lib/utils';

interface VolumeCardProps {
  totalMessages: number;
  avgMessagesPerDay: number;
}

export function VolumeCard({ totalMessages, avgMessagesPerDay }: VolumeCardProps) {
  const [count, setCount] = useState(0);
  const narrative = getVolumeNarrative(totalMessages);

  // Counter animation
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = totalMessages / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= totalMessages) {
        setCount(totalMessages);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalMessages]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-[#25D366]/15 via-transparent to-whatsapp-teal/10
 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center relative z-10"
      >
        {/* Emoji */}
        <motion.span
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-6xl block mb-6"
        >
          {narrative.emoji}
        </motion.span>

        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-whatsapp-text-secondary text-lg mb-2"
        >
          Toplam
        </motion.p>

        {/* Counter */}
        <motion.p
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="text-6xl sm:text-8xl font-bold text-whatsapp-green mb-2"
        >
          {formatNumber(count)}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-2xl text-whatsapp-text-primary mb-8"
        >
          mesaj 💬
        </motion.p>

        {/* Narrative */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="max-w-md mx-auto"
        >
          <p className="text-lg font-semibold text-whatsapp-text-primary mb-2">
            {narrative.title}
          </p>
          <p className="text-whatsapp-text-secondary text-sm leading-relaxed">
            {narrative.description}
          </p>
        </motion.div>

        {/* Daily Average */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-8 bg-whatsapp-light/80 px-6 py-3 rounded-xl inline-block"
        >
          <p className="text-2xl font-bold text-whatsapp-text-primary">
            {avgMessagesPerDay.toFixed(0)}
          </p>
          <p className="text-whatsapp-text-secondary text-xs">mesaj/gün ortalama</p>
        </motion.div>
      </motion.div>
    </div>
  );
}