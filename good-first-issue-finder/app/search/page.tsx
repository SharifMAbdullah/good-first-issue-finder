'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterSidebar } from '@/components/search/FilterSidebar';
import { ResultCard } from '@/components/search/ResultCard';
import { ProjectItem, Category } from '@/types';

// Mock Data initialization
const ALL_PROJECTS: ProjectItem[] = [
  { id: '1', title: 'Nexus UI', description: 'A robust component library built on Radix.', category: 'Frontend', tags: ['React', 'Tailwind'] },
  { id: '2', title: 'DataSync API', description: 'High-throughput Rust-based microservice.', category: 'Backend', tags: ['Rust', 'gRPC'] },
  { id: '3', title: 'CloudDeploy', description: 'Terraform configurations for K8s clusters.', category: 'DevOps', tags: ['AWS', 'K8s'] },
  { id: '4', title: 'Admin Sphere', description: 'Fullstack dashboard with RBAC features.', category: 'Fullstack', tags: ['Next.js', 'PostgreSQL'] },
  { id: '5', title: 'LogStream', description: 'Real-time logging architecture via Kafka.', category: 'Backend', tags: ['Java', 'Kafka'] },
];

const AVAILABLE_CATEGORIES: Category[] = ['Frontend', 'Backend', 'Fullstack', 'DevOps'];

const SearchPage = (): React.ReactElement => {
  const { state, filteredItems, setQuery, toggleCategory } = useSearchFilters(ALL_PROJECTS);

  return (
    <div className="min-h-screen bg-black text-gray-200 p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-10">
          <h1 className="text-4xl font-semibold text-white tracking-tight mb-2">Project Directory</h1>
          <p className="text-zinc-500 text-sm">Find tools, microservices, and platforms instantly.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          <FilterSidebar 
            availableCategories={AVAILABLE_CATEGORIES}
            selectedCategories={state.categories}
            onToggleCategory={toggleCategory}
          />

          <main className="flex-1 flex flex-col min-w-0">
            <SearchBar value={state.query} onChange={setQuery} />

            <div className="relative">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  <p>No projects matched your exact filters.</p>
                </div>
              ) : (
                <motion.div 
                  layout 
                  className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item: ProjectItem): React.ReactElement => (
                      <ResultCard key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </main>
        </div>

      </div>
    </div>
  );
};

export default SearchPage;