'use client';

import { motion } from 'framer-motion';
import { ChatBubble } from '@/components/ui';
import { formatNumber } from '@/lib/utils';

interface WelcomeCardProps {
  totalMessages: number;
  totalDays: number;
  participants: string[];
}

export function WelcomeCard({ totalMessages, totalDays, participants }: WelcomeCardProps) {
  const participantText = participants.length === 2 
    ? `${participants[0]} ve ${participants[1]}`
    : `${participants.length} kişi`;

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-[#25D366]/20 via-transparent to-transparent pointer-events-none" />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 relative z-10"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-5xl mb-4 block"
        >
          📊
        </motion.span>
        <h1 className="text-3xl sm:text-4xl font-bold text-whatsapp-text-primary">
          {"Wrapped'in"} <span className="text-[#25D366]">hazır!</span>
        </h1>
      </motion.div>

      {/* Chat Simulation */}
      <div className="w-full max-w-sm space-y-3 relative z-10">
        <ChatBubble variant="incoming" delay={0.5}>
          Hey! {participantText} arasındaki sohbete baktım 👀
        </ChatBubble>

        <ChatBubble variant="outgoing" delay={1.2}>
          Ne buldun?
        </ChatBubble>

        <ChatBubble variant="incoming" delay={1.9}>
          <span className="text-[#25D366] font-bold">{formatNumber(totalMessages)}</span> mesaj,{' '}
          <span className="text-[#25D366] font-bold">{totalDays}</span> gün boyunca...
        </ChatBubble>

        <ChatBubble variant="incoming" delay={2.6}>
          İlginç şeyler var! Hazır mısın? 👀
        </ChatBubble>
      </div>
    </div>
  );
}