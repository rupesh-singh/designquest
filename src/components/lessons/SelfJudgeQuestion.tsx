'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Eye, EyeOff, ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MarkdownText } from '@/components/ui/MarkdownText';
import type { Question, EvaluationResult } from '@/types';
import { cn } from '@/lib/utils';

interface SelfJudgeQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmit: (answer: string | string[], selfJudgeResult?: { passed: boolean }) => Promise<EvaluationResult & { explanation: string }>;
  onNext: () => void;
  isLast: boolean;
}

export function SelfJudgeQuestion({
  question,
  questionNumber,
  totalQuestions,
  onSubmit,
  onNext,
  isLast,
}: SelfJudgeQuestionProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [selfJudgement, setSelfJudgement] = useState<'passed' | 'failed' | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<(EvaluationResult & { explanation: string }) | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  // Reset state when question changes
  useEffect(() => {
    setUserAnswer('');
    setShowSolution(false);
    setSelfJudgement(null);
    setIsSubmitted(false);
    setIsLoading(false);
    setResult(null);
    setShowHint(false);
    setHintIndex(0);
  }, [question.id]);

  const handleShowHint = () => {
    setShowHint(true);
    if (hintIndex < question.hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
  };

  const handleSelfJudge = async (passed: boolean) => {
    setSelfJudgement(passed ? 'passed' : 'failed');
    setIsLoading(true);
    
    try {
      const evaluationResult = await onSubmit(userAnswer, { passed });
      setResult(evaluationResult);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting self-judgement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Parse sample solution and evaluation criteria from question
  const sampleSolution = question.sampleSolution || question.explanation;
  const evaluationCriteria = question.evaluationCriteria || [];

  return (
    <Card className="max-w-3xl mx-auto bg-[#141414]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-400">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded-full">
            Self-Evaluated
          </span>
        </div>
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

        {/* Evaluation Criteria */}
        {evaluationCriteria.length > 0 && (
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Evaluation Criteria:
            </p>
            <ul className="list-disc list-inside space-y-1">
              {evaluationCriteria.map((criteria, index) => (
                <li key={index} className="text-sm text-blue-300/80">{criteria}</li>
              ))}
            </ul>
          </div>
        )}

        {/* User's Answer Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Your Answer / Approach:
          </label>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Think through the problem and write your approach here... (This helps you solidify your thinking before seeing the solution)"
            className="w-full h-48 px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-600/50 resize-none"
            disabled={showSolution}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Writing down your approach helps reinforce learning, but it&apos;s optional.
          </p>
        </div>

        {/* Hint */}
        {!showSolution && question.hints && question.hints.length > 0 && (
          <div className="mb-6">
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

        {/* Show/Hide Solution Button */}
        {!isSubmitted && (
          <div className="mb-6">
            <Button
              variant="secondary"
              onClick={() => setShowSolution(!showSolution)}
              className="w-full flex items-center justify-center gap-2"
            >
              {showSolution ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide Solution
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  View Solution
                </>
              )}
            </Button>
          </div>
        )}

        {/* Solution */}
        {showSolution && (
          <div className="mb-6">
            <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-lg p-4">
              <p className="text-sm font-medium text-emerald-400 mb-3">Sample Solution:</p>
              <MarkdownText className="text-neutral-200 text-sm">
                {sampleSolution}
              </MarkdownText>
            </div>
          </div>
        )}

        {/* Self-Judgement Buttons */}
        {showSolution && !isSubmitted && (
          <div className="space-y-4">
            <p className="text-center text-neutral-300 text-sm">
              Compare your answer to the solution. How did you do?
            </p>
            <div className="flex gap-4">
              <Button
                variant="secondary"
                onClick={() => handleSelfJudge(true)}
                disabled={isLoading}
                className="flex-1 bg-emerald-600/20 border-emerald-600/30 hover:bg-emerald-600/30 text-emerald-400"
              >
                <ThumbsUp className="w-5 h-5 mr-2" />
                I Got It Right
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleSelfJudge(false)}
                disabled={isLoading}
                className="flex-1 bg-rose-600/20 border-rose-600/30 hover:bg-rose-600/30 text-rose-400"
              >
                <ThumbsDown className="w-5 h-5 mr-2" />
                I Need More Practice
              </Button>
            </div>
          </div>
        )}

        {/* Result */}
        {isSubmitted && result && (
          <div className="mt-6 space-y-4">
            {/* Score */}
            <div
              className={cn(
                'rounded-lg p-4',
                selfJudgement === 'passed' 
                  ? 'bg-emerald-600/10 border border-emerald-600/30' 
                  : 'bg-amber-600/10 border border-amber-600/30'
              )}
            >
              <div className="flex items-start gap-3">
                {selfJudgement === 'passed' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium text-white">
                    {selfJudgement === 'passed' 
                      ? 'Great job! You understood the concept.' 
                      : 'No worries! Learning is a journey.'}
                  </p>
                  <p className="text-sm text-neutral-400 mt-1">
                    XP Earned: +{result.xpEarned}
                  </p>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
              <p className="text-sm font-medium text-neutral-300 mb-1">Key Takeaways:</p>
              <p className="text-sm text-neutral-400">{question.explanation}</p>
            </div>

            {/* Self-Reflection Prompt for Failed */}
            {selfJudgement === 'failed' && (
              <div className="bg-purple-600/10 border border-purple-600/30 rounded-lg p-4">
                <p className="text-sm font-medium text-purple-400 mb-1">💡 Pro Tip:</p>
                <p className="text-sm text-purple-300/80">
                  This question will appear again in your review queue. Consider bookmarking this topic for deeper study.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900 rounded-b-lg flex justify-end gap-3">
        {isSubmitted ? (
          <Button onClick={onNext}>
            {isLast ? 'Complete Lesson' : 'Next Question →'}
          </Button>
        ) : !showSolution ? (
          <p className="text-sm text-neutral-500 self-center">
            View the solution to continue
          </p>
        ) : null}
      </div>
    </Card>
  );
}
