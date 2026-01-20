'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, Lock, FileSearch } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Module } from '@/types';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  module: Module;
  progress?: {
    completed: number;
    total: number;
  };
  isLocked?: boolean;
}

export function ModuleCard({ module, progress, isLocked = false }: ModuleCardProps) {
  const router = useRouter();

  const clearanceLevels = {
    beginner: 'bg-emerald-600/20 text-emerald-500 border border-emerald-600/30',
    intermediate: 'bg-amber-600/20 text-amber-500 border border-amber-600/30',
    advanced: 'bg-red-600/20 text-red-500 border border-red-600/30',
  };

  const clearanceLabels = {
    beginner: 'Entry',
    intermediate: 'Standard',
    advanced: 'High',
  };

  const completionPercent = progress ? (progress.completed / progress.total) * 100 : 0;
  const isCompleted = progress && progress.completed === progress.total && progress.total > 0;

  const handleClick = () => {
    if (!isLocked) {
      router.push(`/learn/${module.slug}`);
    }
  };

  return (
    <Card
      hover={!isLocked}
      onClick={handleClick}
      className={cn(
        'relative overflow-hidden',
        isLocked && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Color accent bar */}
      <div
        className="h-1"
        style={{ backgroundColor: module.colorTheme }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{module.icon}</span>
            <div>
              <h3 className="font-semibold text-lg text-white">{module.title}</h3>
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded',
                  clearanceLevels[module.difficulty as keyof typeof clearanceLevels]
                )}
              >
                {clearanceLabels[module.difficulty as keyof typeof clearanceLabels]}
              </span>
            </div>
          </div>

          {isLocked ? (
            <Lock className="w-5 h-5 text-neutral-600" />
          ) : isCompleted ? (
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          ) : (
            <FileSearch className="w-5 h-5 text-neutral-400" />
          )}
        </div>

        {/* Description */}
        <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
          {module.description}
        </p>

        {/* Progress */}
        {progress && progress.total > 0 && (
          <div className="space-y-2">
            <ProgressBar
              value={progress.completed}
              max={progress.total}
              color={isCompleted ? 'green' : 'amber'}
            />
            <p className="text-xs text-neutral-500">
              {progress.completed} of {progress.total} incidents resolved
            </p>
          </div>
        )}

        {!progress && (
          <p className="text-xs text-neutral-500">
            {module._count?.lessons || 0} incidents
          </p>
        )}
      </div>
    </Card>
  );
}
