// src/components/home/FeatureCard.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

export const FeatureCard = ({ title, description, icon, delay }: FeatureCardProps): React.ReactElement => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay, ease: 'easeOut' }}
      className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-blue-500/30 hover:bg-zinc-900/80 transition-all duration-300 group"
    >
      <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-zinc-100 mb-3">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </motion.div>
  );
};