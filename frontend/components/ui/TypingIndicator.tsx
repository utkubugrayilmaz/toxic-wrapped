'use client';

import { motion } from 'framer-motion';

/**
 * WhatsApp "yazıyor..." animasyonu.
 * 3 nokta bounce efekti.
 */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-[#202C33] rounded-lg w-fit rounded-tl-none">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 bg-[#8696A0] rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}