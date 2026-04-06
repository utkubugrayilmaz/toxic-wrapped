'use client';

import { motion } from 'framer-motion';
import { getTimeNarrative } from '@/lib/narrativeEngine';

interface TimeCardProps {
  mostActiveHour: string;
  messagesByHour: Record<string, number>;
}

export function TimeCard({ mostActiveHour, messagesByHour }: TimeCardProps) {
  const narrative = getTimeNarrative(mostActiveHour, messagesByHour);
  
  // En yoğun 5 saati bul
  const topHours = Object.entries(messagesByHour)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const maxCount = topHours[0]?.[1] || 1;

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative">
      {/* Background */}
      <div className={`absolute inset-0 pointer-events-none ${
        narrative.isNightOwl 
          ? 'bg-linear-to-b from-indigo-900/20 via-transparent to-purple-900/10'
          : 'bg-linear-to-b from-amber-500/10 via-transparent to-orange-500/5'
      }`} />

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
          className="text-2xl font-bold text-whatsapp-text-primary mb-2"
        >
          {narrative.title}
        </motion.h2>

        {/* Most Active Hour */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="mb-6"
        >
          <span className="text-5xl sm:text-6xl font-bold text-whatsapp-green">
            {mostActiveHour}
          </span>
          <p className="text-whatsapp-text-secondary mt-1">en aktif saat</p>
        </motion.div>

        {/* Hour Bars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center items-end gap-2 h-24 mb-6"
        >
          {topHours.map(([hour, count], index) => (
            <motion.div
              key={hour}
              initial={{ height: 0 }}
              animate={{ height: `${(count / maxCount) * 100}%` }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              className="w-10 bg-whatsapp-green/80 rounded-t-lg relative"
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-whatsapp-text-secondary">
                {hour}:00
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Narrative */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="text-whatsapp-text-secondary text-sm leading-relaxed max-w-sm mx-auto"
        >
          {narrative.description}
        </motion.p>
      </motion.div>
    </div>
  );
}