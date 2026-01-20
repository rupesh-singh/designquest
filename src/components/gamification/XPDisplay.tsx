'use client';

import { CheckCircle } from 'lucide-react';

interface CasesSolvedDisplayProps {
  solvedCount: number;
  totalCount?: number;
  compact?: boolean;
}

export function CasesSolvedDisplay({ solvedCount, totalCount, compact = false }: CasesSolvedDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-500">
        <CheckCircle className="w-4 h-4" />
        <span className="font-medium">{solvedCount} solved</span>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] border border-neutral-800 rounded-lg p-6 text-white inline-block">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-emerald-600/20 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <p className="text-neutral-500 text-sm font-mono uppercase tracking-wider">Cases Solved</p>
          <p className="text-3xl font-bold">
            {solvedCount}
            {totalCount && <span className="text-neutral-600 text-lg font-normal"> / {totalCount}</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

// Keep the old export name for backward compatibility during transition
export { CasesSolvedDisplay as XPDisplay };
