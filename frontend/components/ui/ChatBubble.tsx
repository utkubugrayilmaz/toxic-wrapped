'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ChatBubbleProps {
  children: ReactNode;
  variant?: 'incoming' | 'outgoing';
  className?: string;
  delay?: number;
}

/**
 * WhatsApp tarzı mesaj balonu.
 * Animasyonlu giriş efekti ile.
 */
export function ChatBubble({
  children,
  variant = 'incoming',
  className,
  delay = 0,
}: ChatBubbleProps) {
  const isOutgoing = variant === 'outgoing';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.3,
        delay,
        ease: 'easeOut',
      }}
      className={cn(
        'max-w-[85%] px-4 py-2 rounded-lg relative',
        isOutgoing
          ? 'bg-[#005C4B] ml-auto rounded-tr-none'
          : 'bg-[#202C33] mr-auto rounded-tl-none',
        className
      )}
    >
      <div className="text-[#E9EDEF] text-sm sm:text-base">
        {children}
      </div>
    </motion.div>
  );
}