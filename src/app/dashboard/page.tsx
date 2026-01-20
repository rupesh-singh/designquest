'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, FileSearch, FolderOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { CasesSolvedDisplay } from '@/components/gamification/XPDisplay';
import { ModuleCard } from '@/components/lessons/ModuleCard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Module } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuthStore();
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  // Calculate total solved cases
  const totalSolved = Object.values(progress).reduce((acc, p) => acc + p.completed, 0);
  const totalCases = Object.values(progress).reduce((acc, p) => acc + p.total, 0);

  // Find the next case to investigate
  const nextModule = modules.find(m => {
    const p = progress[m.id];
    return !p || p.completed < p.total;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8">
        <p className="text-amber-600 font-mono text-sm tracking-wider mb-1">WELCOME BACK</p>
        <h1 className="text-3xl font-bold text-white">
          Agent {user.displayName || user.username}
        </h1>
        <p className="text-neutral-400 mt-1">New incidents await your expertise.</p>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <CasesSolvedDisplay
          solvedCount={totalSolved}
          totalCount={totalCases}
        />
      </div>

      {/* Continue Investigation Card */}
      {nextModule && (
        <Card className="mb-8 bg-gradient-to-r from-[#1a1a1a] to-[#141414] border-l-4 border-l-amber-600">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-500 text-sm font-mono mb-1 tracking-wider">ACTIVE CASE FILE</p>
                <h2 className="text-2xl font-bold mb-2 text-white">{nextModule.title}</h2>
                <p className="text-neutral-400">
                  {progress[nextModule.id] 
                    ? `${progress[nextModule.id].completed} of ${progress[nextModule.id].total} incidents resolved`
                    : 'Investigation pending'}
                </p>
              </div>
              <Link href={`/learn/${nextModule.slug}`}>
                <Button className="bg-amber-600 text-white hover:bg-amber-500 font-semibold">
                  Investigate
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Case Files */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-600" />
            Case Files
          </h2>
          <Link
            href="/learn"
            className="text-neutral-400 hover:text-amber-500 font-medium text-sm flex items-center gap-1 transition-colors"
          >
            View all cases
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingModules ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-neutral-800 rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        ) : modules.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.slice(0, 6).map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                progress={progress[module.id]}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileSearch className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No active cases</h3>
              <p className="text-neutral-400">New incidents will appear here. Stand by.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
