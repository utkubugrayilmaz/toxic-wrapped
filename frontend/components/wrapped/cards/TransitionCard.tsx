'use client';

import { motion } from 'framer-motion';
import { TypingIndicator } from '@/components/ui';

export function TransitionCard() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative">
      {/* Background - Ominous gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-amber-500/10 via-transparent to-red-500/5 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center relative z-10"
      >
        {/* Emoji */}
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="text-6xl block mb-6"
        >
          🔍
        </motion.span>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl font-bold text-whatsapp-text-primary mb-4"
        >
          Şimdi asıl konuya geliyoruz...
        </motion.h2>

        {/* Suspense Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-whatsapp-text-secondary mb-8 max-w-sm mx-auto"
        >
          Mesajların tonunu analiz ettik. Gaslighting, love bombing, pasif agresiflik...
        </motion.p>

        {/* Typing Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center mb-6"
        >
          <TypingIndicator />
        </motion.div>

        {/* Warning */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-amber-400 text-sm"
        >
          Hazır mısın? 👀
        </motion.p>
      </motion.div>
    </div>
  );
}