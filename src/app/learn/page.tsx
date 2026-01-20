'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ModuleCard } from '@/components/lessons/ModuleCard';
import { Card, CardContent } from '@/components/ui/Card';
import { FileSearch, FolderOpen } from 'lucide-react';
import type { Module } from '@/types';

export default function LearnPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, refreshUser } = useAuthStore();
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Record<string, { completed: number; total: number }>>({});
  const [loadingModules, setLoadingModules] = useState(true);

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchModules() {
      try {
        const res = await fetch('/api/modules');
        const data = await res.json();
        setModules(data.modules || []);
        setProgress(data.progress || {});
      } catch (error) {
        console.error('Error fetching modules:', error);
      } finally {
        setLoadingModules(false);
      }
    }

    if (isAuthenticated) {
      fetchModules();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Group modules by difficulty (case clearance level)
  const beginnerModules = modules.filter(m => m.difficulty === 'beginner');
  const intermediateModules = modules.filter(m => m.difficulty === 'intermediate');
  const advancedModules = modules.filter(m => m.difficulty === 'advanced');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FolderOpen className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl font-bold text-white">Case Archives</h1>
        </div>
        <p className="text-neutral-400">
          Select an incident to investigate. Each case builds your expertise.
        </p>
      </div>

      {loadingModules ? (
        <div className="space-y-12">
          {[1, 2, 3].map((section) => (
            <div key={section}>
              <div className="h-8 w-48 bg-neutral-800 rounded animate-pulse mb-6" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-neutral-800 rounded-lg h-48 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : modules.length > 0 ? (
        <div className="space-y-12">
          {/* Entry-Level Clearance */}
          {beginnerModules.length > 0 && (
            <ModuleSection
              title="Entry Clearance"
              description="Foundational incidents. Start here to build your case-solving instincts."
              modules={beginnerModules}
              progress={progress}
              icon="🟢"
            />
          )}

          {/* Standard Clearance */}
          {intermediateModules.length > 0 && (
            <ModuleSection
              title="Standard Clearance"
              description="Complex failures requiring deeper investigation."
              modules={intermediateModules}
              progress={progress}
              icon="🟡"
            />
          )}

          {/* High Clearance */}
          {advancedModules.length > 0 && (
            <ModuleSection
              title="High Clearance"
              description="Critical system failures. Proceed with expertise."
              modules={advancedModules}
              progress={progress}
              icon="🔴"
            />
          )}
        </div>
      ) : (
        <Card className="bg-[#141414]">
          <CardContent className="py-12 text-center">
            <FileSearch className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No active cases</h3>
            <p className="text-neutral-400">New incidents will be filed soon. Stand by.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ModuleSection({
  title,
  description,
  modules,
  progress,
  icon,
}: {
  title: string;
  description: string;
  modules: Module[];
  progress: Record<string, { completed: number; total: number }>;
  icon: string;
}) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h2>
        <p className="text-neutral-400">{description}</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            progress={progress[module.id]}
          />
        ))}
      </div>
    </section>
  );
}
