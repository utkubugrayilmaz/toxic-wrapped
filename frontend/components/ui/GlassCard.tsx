'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Glassmorphism efektli kart.
 * Wrapped kartları için kullanılacak.
 */
export function GlassCard({ children, className, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: 'easeOut',
      }}
      className={cn(
        'backdrop-blur-lg bg-[#202C33]/80 border border-[#2A3942]',
        'rounded-2xl p-6 shadow-xl',
        className
      )}
    >
      {children}
    </motion.div>
  );
}