'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Circle, Lock, FileSearch } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import type { Module, Lesson } from '@/types';
import { cn } from '@/lib/utils';

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading, refreshUser } = useAuthStore();
  const [module, setModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchModule() {
      try {
        const res = await fetch(`/api/modules/${params.slug}`);
        if (!res.ok) {
          router.push('/learn');
          return;
        }
        const data = await res.json();
        setModule(data.module);
        setLessons(data.module.lessons || []);
        setProgress(data.progress || {});
      } catch (error) {
        console.error('Error fetching module:', error);
        router.push('/learn');
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated && params.slug) {
      fetchModule();
    }
  }, [isAuthenticated, params.slug, router]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!module) return null;

  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const totalCount = lessons.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Find the next incomplete incident
  const nextLessonIndex = lessons.findIndex(l => !progress[l.id]?.completed);
  const nextLesson = nextLessonIndex >= 0 ? lessons[nextLessonIndex] : null;

  const clearanceLabels: Record<string, string> = {
    beginner: 'Entry Clearance',
    intermediate: 'Standard Clearance',
    advanced: 'High Clearance',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Back Button */}
      <Link
        href="/learn"
        className="inline-flex items-center text-neutral-400 hover:text-amber-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Case Archives
      </Link>

      {/* Module Header */}
      <div
        className="rounded-xl p-8 text-white mb-8 border border-neutral-800"
        style={{ backgroundColor: module.colorTheme }}
      >
        <div className="flex items-start gap-4">
          <span className="text-5xl">{module.icon}</span>
          <div className="flex-1">
            <p className="text-white/70 text-sm font-mono mb-1">CASE FILE</p>
            <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
            <p className="text-white/90 mb-4">{module.description}</p>
            <div className="flex items-center gap-4">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {clearanceLabels[module.difficulty] || module.difficulty}
              </span>
              <span className="text-sm">
                {totalCount} incidents
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Investigation Progress</span>
            <span>{completedCount} of {totalCount} resolved</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Continue Button */}
      {nextLesson && (
        <Card className="mb-8 border-l-4 border-l-amber-600 bg-[#141414]">
          <CardContent className="py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-mono">ACTIVE INCIDENT</p>
              <p className="font-semibold text-white">{nextLesson.title}</p>
            </div>
            <Link href={`/learn/${module.slug}/${nextLesson.slug}`}>
              <Button className="bg-amber-600 hover:bg-amber-500 text-white">
                <FileSearch className="w-4 h-4 mr-2" />
                Investigate
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Incidents List */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-white mb-4">Incident Reports</h2>
        {lessons.map((lesson, index) => {
          const lessonProgress = progress[lesson.id];
          const isCompleted = lessonProgress?.completed;
          const isLocked = index > 0 && !progress[lessons[index - 1].id]?.completed;
          const isCurrent = !isCompleted && !isLocked;

          return (
            <Link
              key={lesson.id}
              href={isLocked ? '#' : `/learn/${module.slug}/${lesson.slug}`}
              className={cn(
                'block',
                isLocked && 'pointer-events-none'
              )}
            >
              <Card
                hover={!isLocked}
                className={cn(
                  'transition-all bg-[#141414]',
                  isLocked && 'opacity-60',
                  isCurrent && 'ring-2 ring-amber-600 ring-offset-2 ring-offset-[#0a0a0a]'
                )}
              >
                <CardContent className="py-4 flex items-center gap-4">
                  {/* Status Icon */}
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                    isCompleted ? 'bg-emerald-600/20' : isLocked ? 'bg-neutral-800' : 'bg-neutral-700'
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5 text-neutral-500" />
                    ) : (
                      <FileSearch className="w-5 h-5 text-amber-600" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-neutral-500 font-mono">INC-{String(index + 1).padStart(3, '0')}</span>
                      {isCurrent && (
                        <span className="bg-amber-600/20 text-amber-500 text-xs px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-white">{lesson.title}</h3>
                  </div>

                  {/* Status */}
                  <div className="text-right">
                    {isCompleted ? (
                      <span className="text-sm text-emerald-500 font-medium">Resolved</span>
                    ) : isLocked ? (
                      <span className="text-sm text-neutral-500">Locked</span>
                    ) : (
                      <span className="text-sm text-neutral-400">Pending</span>
                    )}
                    {isCompleted && lessonProgress.score && (
                      <p className="text-xs text-neutral-500">Score: {lessonProgress.score}%</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
