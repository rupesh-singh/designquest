'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { QuestionCard } from '@/components/lessons/QuestionCard';
import { TextInputQuestion } from '@/components/lessons/TextInputQuestion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { Lesson, Question, EvaluationResult } from '@/types';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading, refreshUser } = useAuthStore();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchLesson() {
      try {
        const res = await fetch(`/api/lessons/${params.lessonSlug}`);
        if (!res.ok) {
          router.push(`/learn/${params.slug}`);
          return;
        }
        const data = await res.json();
        setLesson(data.lesson);
        setQuestions(data.lesson.questions || []);
      } catch (error) {
        console.error('Error fetching lesson:', error);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated && params.lessonSlug) {
      fetchLesson();
    }
  }, [isAuthenticated, params.slug, params.lessonSlug, router]);

  const handleSubmitAnswer = async (answer: string | string[]): Promise<EvaluationResult & { explanation: string }> => {
    const currentQuestion = questions[currentQuestionIndex];
    
    const res = await fetch('/api/progress/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId: lesson?.id,
        questionId: currentQuestion.id,
        answer,
      }),
    });

    const data = await res.json();
    
    // Track cumulative score and XP
    setTotalXP(prev => prev + data.result.xpEarned);
    setTotalScore(prev => prev + data.result.score);

    return {
      ...data.result,
      explanation: data.explanation,
    };
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Complete the lesson
      completeLesson();
    }
  };

  const completeLesson = async () => {
    try {
      const avgScore = Math.round(totalScore / questions.length);
      
      const res = await fetch('/api/progress/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: lesson?.id,
          totalScore: avgScore,
          totalXP,
        }),
      });

      const data = await res.json();
      setLeveledUp(data.leveledUp);
      setIsComplete(true);
      
      // Refresh user data
      refreshUser();
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!lesson) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Incident Resolved Screen
  if (isComplete) {
    const avgScore = Math.round(totalScore / questions.length);
    
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 min-h-screen">
        <Card className="text-center border-t-4 border-t-emerald-600 bg-[#141414]">
          <CardContent className="py-12">
            <div className="w-20 h-20 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <p className="text-emerald-500 font-mono text-sm mb-2">CASE CLOSED</p>
            <h1 className="text-3xl font-bold text-white mb-2">
              Incident Resolved
            </h1>
            <p className="text-neutral-400 mb-8">
              {lesson.title} has been successfully investigated.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-8">
              <div className="bg-neutral-800 rounded-lg p-4">
                <p className="text-sm text-neutral-400 font-medium">Findings</p>
                <p className="text-2xl font-bold text-white">{questions.length}</p>
              </div>
              <div className="bg-emerald-600/10 rounded-lg p-4">
                <p className="text-sm text-emerald-500 font-medium">Accuracy</p>
                <p className="text-2xl font-bold text-emerald-500">{avgScore}%</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/learn/${params.slug}`}>
                <Button variant="outline">
                  Back to Case File
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button>
                  Return to HQ
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Briefing Screen
  if (showIntro) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen">
        <Link
          href={`/learn/${params.slug}`}
          className="inline-flex items-center text-neutral-400 hover:text-amber-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {lesson.module?.title}
        </Link>

        <Card className="border-t-4 border-t-amber-600 bg-[#141414]">
          <CardContent className="py-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-amber-600/20 text-amber-500 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <AlertTriangle className="w-4 h-4" />
                Incident Report
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
              <p className="text-neutral-400">
                {questions.length} checkpoints to resolve
              </p>
            </div>

            {/* Story/Context */}
            <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-6 mb-8">
              <h2 className="font-mono text-amber-600 text-sm mb-3">SITUATION BRIEFING</h2>
              <div className="prose prose-invert">
                <p className="text-neutral-300 whitespace-pre-wrap">{lesson.storyContent}</p>
              </div>
            </div>

            <div className="text-center">
              <Button size="lg" className="bg-amber-600 hover:bg-amber-500 text-white" onClick={() => setShowIntro(false)}>
                Begin Investigation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Question View
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen">
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Link
            href={`/learn/${params.slug}`}
            className="text-neutral-400 hover:text-amber-600 text-sm transition-colors"
          >
            ← Abort Investigation
          </Link>
          <span className="text-sm text-neutral-500 font-mono">
            {lesson.title}
          </span>
        </div>
        <ProgressBar value={progressPercent} max={100} color="amber" />
      </div>

      {/* Current Question */}
      {currentQuestion && (
        currentQuestion.type === 'text_input' ? (
          <TextInputQuestion
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onSubmit={handleSubmitAnswer}
            onNext={handleNext}
            isLast={currentQuestionIndex === questions.length - 1}
          />
        ) : (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onSubmit={handleSubmitAnswer}
            onNext={handleNext}
            isLast={currentQuestionIndex === questions.length - 1}
          />
        )
      )}
    </div>
  );
}
