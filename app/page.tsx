// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, GitMerge, Zap, ArrowRight, Bookmark } from 'lucide-react';
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

const GithubIcon = ({ size = 16 }: { size?: number }): React.ReactElement => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const GitlabIcon = ({ size = 16 }: { size?: number }): React.ReactElement => (
  <svg role="img" viewBox="0 0 24 24" width={size} height={size} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="m23.705 13.521-1.171-3.606a.71.71 0 0 0-.23-.332.712.712 0 0 0-.4-.124h-.012a.712.712 0 0 0-.393.119.71.71 0 0 0-.24.322l-1.42 4.373H4.161l-1.42-4.373a.711.711 0 0 0-.24-.322.713.713 0 0 0-.393-.119h-.012a.713.713 0 0 0-.4.124.711.711 0 0 0-.23.332L.295 13.521a1.002 1.002 0 0 0 .363 1.117l11.025 8.012a.541.541 0 0 0 .634 0l11.025-8.012a1.002 1.002 0 0 0 .363-1.117zM12 2.378l2.002 6.162h-4.004L12 2.378z"/>
  </svg>
);

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


export const HomePage = (): React.ReactElement => {
  const features: FeatureDef[] = [
    {
      id: 'feat-1',
      title: 'Unified Aggregation',
      description: 'Stop context-switching. We pull Good First Issues from GitHub and GitLab into a single, standardized stream.',
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
    },
    {
      id: 'feat-4',
      title: 'Local Bookmarking',
      description: 'Save issues directly to your browser. Build a personal backlog of open-source targets without needing to create an account.',
      icon: <Bookmark size={24} />
    }
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-125 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-b from-blue-600/30 to-transparent blur-[100px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-10 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
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
            Live Open Source Issue Tracker
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6"
          >
            Find <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">Good First Issues</span> Faster.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-zinc-300 font-medium mb-4"
          >
            Your first open-source contribution, simplified.
          </motion.p>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg md:text-xl text-zinc-500 mb-10 leading-relaxed max-w-2xl mx-auto"
          >
            Discover beginner-friendly open-source projects tailored to your tech stack. We bring you the issues so you can focus on writing code.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
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
                <GithubIcon size={18} />
                <GitlabIcon size={18} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
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