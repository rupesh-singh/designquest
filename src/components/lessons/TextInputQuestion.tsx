'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Question, EvaluationResult } from '@/types';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface TextInputQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmit: (answer: string) => Promise<EvaluationResult & { explanation: string }>;
  onNext: () => void;
  isLast: boolean;
}

export function TextInputQuestion({
  question,
  questionNumber,
  totalQuestions,
  onSubmit,
  onNext,
  isLast,
}: TextInputQuestionProps) {
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<(EvaluationResult & { explanation: string }) | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  // Reset state when question changes
  useEffect(() => {
    setAnswer('');
    setIsSubmitted(false);
    setIsLoading(false);
    setResult(null);
    setShowHint(false);
    setHintIndex(0);
  }, [question.id]);

  const handleSubmit = async () => {
    if (answer.trim().length < 10) {
      return;
    }

    setIsLoading(true);
    try {
      const evaluationResult = await onSubmit(answer);
      setResult(evaluationResult);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowHint = () => {
    setShowHint(true);
    if (hintIndex < question.hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto bg-[#141414]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center">
        <span className="text-sm font-medium text-neutral-400">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="text-sm font-medium text-amber-600">
          +{question.xpValue} XP
        </span>
      </div>

      {/* Question */}
      <div className="p-6">
        {/* Scenario */}
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 mb-6">
          <p className="text-neutral-200 whitespace-pre-wrap">{question.scenarioText}</p>
        </div>

        {/* Text Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-300">
            Your Answer:
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isSubmitted}
            placeholder="Explain your solution in detail. Consider architecture, technologies, and trade-offs..."
            className={cn(
              'w-full h-40 px-4 py-3 border rounded-lg resize-none bg-neutral-900 text-white',
              'focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent',
              'placeholder:text-neutral-500',
              isSubmitted ? 'bg-neutral-800' : 'border-neutral-700'
            )}
          />
          <div className="flex justify-between text-sm text-neutral-500">
            <span>Minimum 10 characters</span>
            <span>{answer.length} characters</span>
          </div>
        </div>

        {/* Hint */}
        {!isSubmitted && question.hints && question.hints.length > 0 && (
          <div className="mt-4">
            {showHint ? (
              <div className="bg-amber-600/10 border border-amber-600/30 rounded-lg p-4">
                <p className="text-sm text-amber-400">
                  <strong>Hint:</strong> {question.hints[Math.min(hintIndex, question.hints.length - 1)]}
                </p>
                {hintIndex < question.hints.length - 1 && (
                  <button
                    onClick={handleShowHint}
                    className="text-sm text-amber-500 hover:underline mt-2"
                  >
                    Show another hint
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleShowHint}
                className="text-sm text-neutral-400 hover:text-amber-600"
              >
                Need a hint?
              </button>
            )}
          </div>
        )}

        {/* Result */}
        {isSubmitted && result && (
          <div className="mt-6 space-y-4">
            {/* Score */}
            <div
              className={cn(
                'rounded-lg p-4',
                result.isCorrect ? 'bg-emerald-600/10 border border-emerald-600/30' : result.score >= 50 ? 'bg-amber-600/10 border border-amber-600/30' : 'bg-rose-600/10 border border-rose-600/30'
              )}
            >
              <div className="flex items-start gap-3">
                {result.isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium text-white">{result.feedback}</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    Score: {result.score}/100 • XP Earned: +{result.xpEarned}
                  </p>
                </div>
              </div>
            </div>

            {/* Concepts Breakdown */}
            {result.conceptsMatched && result.conceptsMatched.length > 0 && (
              <div className="bg-neutral-800 rounded-lg p-4">
                <p className="text-sm font-medium text-neutral-300 mb-2">Concepts Covered:</p>
                <div className="flex flex-wrap gap-2">
                  {result.conceptsMatched.map((concept) => (
                    <span
                      key={concept}
                      className="px-2 py-1 bg-emerald-600/20 text-emerald-500 rounded-full text-xs"
                    >
                      ✓ {concept.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {result.conceptsMissed?.map((concept) => (
                    <span
                      key={concept}
                      className="px-2 py-1 bg-neutral-700 text-neutral-400 rounded-full text-xs"
                    >
                      ○ {concept.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <p className="text-sm font-medium text-neutral-300 mb-1">Model Answer:</p>
              <p className="text-sm text-neutral-400">{result.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900 rounded-b-lg flex justify-end gap-3">
        {!isSubmitted ? (
          <Button
            onClick={handleSubmit}
            disabled={answer.trim().length < 10}
            isLoading={isLoading}
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={onNext}>
            {isLast ? 'Complete Lesson' : 'Next Question →'}
          </Button>
        )}
      </div>
    </Card>
  );
}
