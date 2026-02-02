'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MarkdownText } from '@/components/ui/MarkdownText';
import type { Question, QuestionOption, EvaluationResult } from '@/types';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmit: (answer: string | string[]) => Promise<EvaluationResult & { explanation: string }>;
  onNext: () => void;
  isLast: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onSubmit,
  onNext,
  isLast,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>(
    question.type === 'multi_select' ? [] : ''
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<(EvaluationResult & { explanation: string }) | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(question.type === 'multi_select' ? [] : '');
    setIsSubmitted(false);
    setIsLoading(false);
    setResult(null);
    setShowHint(false);
    setHintIndex(0);
  }, [question.id, question.type]);

  const handleOptionSelect = (optionId: string) => {
    if (isSubmitted) return;

    if (question.type === 'multi_select') {
      const currentSelection = selectedAnswer as string[];
      if (currentSelection.includes(optionId)) {
        setSelectedAnswer(currentSelection.filter((id) => id !== optionId));
      } else {
        setSelectedAnswer([...currentSelection, optionId]);
      }
    } else {
      setSelectedAnswer(optionId);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)) {
      return;
    }

    setIsLoading(true);
    try {
      const evaluationResult = await onSubmit(selectedAnswer);
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

  const getOptionClassName = (option: QuestionOption) => {
    const isSelected = question.type === 'multi_select'
      ? (selectedAnswer as string[]).includes(option.id)
      : selectedAnswer === option.id;

    let baseClass = 'p-4 rounded-lg border-2 transition-all cursor-pointer';

    if (!isSubmitted) {
      return cn(
        baseClass,
        isSelected
          ? 'border-amber-600 bg-amber-600/10'
          : 'border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800/50'
      );
    }

    // After submission, show correct/incorrect
    const correctAnswer = question.correctAnswer;
    const isCorrect = question.type === 'multi_select'
      ? option.correct
      : option.id === correctAnswer;

    if (isCorrect) {
      return cn(baseClass, 'border-emerald-600 bg-emerald-600/10');
    }

    if (isSelected && !isCorrect) {
      return cn(baseClass, 'border-rose-600 bg-rose-600/10');
    }

    return cn(baseClass, 'border-neutral-700 opacity-60');
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
          <MarkdownText className="text-neutral-200">{question.scenarioText}</MarkdownText>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option) => (
            <div
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={getOptionClassName(option)}
            >
              <div className="flex items-start gap-3">
                {question.type === 'multi_select' ? (
                  (selectedAnswer as string[]).includes(option.id) ? (
                    <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" />
                  )
                ) : (
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center',
                      selectedAnswer === option.id
                        ? 'border-amber-600'
                        : 'border-neutral-500'
                    )}
                  >
                    {selectedAnswer === option.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                    )}
                  </div>
                )}
                <span className="text-neutral-200">{option.text}</span>
              </div>
            </div>
          ))}
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

            {/* Explanation */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <p className="text-sm font-medium text-neutral-300 mb-1">Learn More:</p>
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
            disabled={!selectedAnswer || (Array.isArray(selectedAnswer) && selectedAnswer.length === 0)}
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
