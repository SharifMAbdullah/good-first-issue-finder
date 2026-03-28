// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, GitMerge, Zap, ArrowRight, Github, Gitlab } from 'lucide-react';
import { FeatureCard } from '@/components/home/FeatureCard';

// Defining a strict type for our static feature data
interface FeatureDef {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface VisitorData {
  allTime: number;
  today: number;
}

const VisitorStats = (): React.ReactElement => {
  const [data, setData] = useState<VisitorData | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      try {
        const res: Response = await fetch('/api/stats');
        if (!res.ok) throw new Error('Failed to fetch');
        
        const stats: VisitorData = await res.json();
        setData(stats);
      } catch (err: unknown) {
        console.error(err);
        setError(true);
      }
    };

    fetchStats();
  }, []); // Empty dependency array means this runs once on mount

  if (error) {
    return <div className="text-sm text-red-400/60">Stats unavailable</div>;
  }

  if (!data) {
    return <div className="text-sm text-zinc-500 animate-pulse">Loading stats...</div>;
  }

return (
    <div className="fixed bottom-6 right-6 bg-zinc-900/80 backdrop-blur-md border border-zinc-700 rounded-2xl px-5 py-3 text-xs text-zinc-400 z-50 shadow-xl">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400">●</span>
          <span>Today: <span className="text-white font-medium">{data.today}</span></span>
        </div>
        <div>All-time: <span className="text-white font-medium">{data.allTime}</span></div>
      </div>
    </div>
  );
};


const HomePage = (): React.ReactElement => {
  const features: FeatureDef[] = [
    {
      id: 'feat-1',
      title: 'Unified Aggregation',
      description: 'Stop context-switching. We pull "Good First Issues" from GitHub and "Quick Wins" from GitLab into a single, standardized stream.',
      icon: <GitMerge size={24} />
    },
    {
      id: 'feat-2',
      title: 'Live Synchronization',
      description: 'Our backend proxies and caches requests, ensuring you see live open issues without hitting strict API rate limits.',
      icon: <Zap size={24} />
    },
    {
      id: 'feat-3',
      title: 'Deep Filtering',
      description: 'Drill down by specific languages and platforms. Your exact filter state is encoded into the URL for easy sharing.',
      icon: <Search size={24} />
    }
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-125 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-b from-blue-600/30 to-transparent blur-[100px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Live Open Source Tracker
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8"
          >
            Your First Commit, <br />
            <span className="text-transparent bg-clip-text bg--to-r from-blue-400 to-cyan-400">
              Simplified.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto"
          >
            Discover accessible issues tailored to your tech stack. We aggregate the noise across the biggest version control platforms so you can focus on writing code.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/search"
              className="group flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-colors"
            >
              Start Searching
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <div className="flex items-center gap-4 px-6 py-4 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm font-medium">
              Supported Sources:
              <div className="flex items-center gap-2 text-zinc-300">
                <Github size={18} />
                <Gitlab size={18} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {features.map((feature: FeatureDef, index: number): React.ReactElement => (
            <FeatureCard 
              key={feature.id}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={0.4 + (index * 0.1)}
            />
          ))}
        </div>

      </div>
      <VisitorStats/>
    </div>
  );
};

export default HomePage;