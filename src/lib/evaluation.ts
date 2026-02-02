// Evaluation system for different question types

export interface QuestionOption {
  id: string;
  text: string;
  score?: number;
  correct?: boolean;
  feedback?: string;
}

export interface EvaluationResult {
  score: number;
  maxScore: number;
  isCorrect: boolean;
  feedback: string;
  xpEarned: number;
  conceptsMatched?: string[];
  conceptsMissed?: string[];
}

// Evaluate multiple choice question
export function evaluateMultipleChoice(
  userAnswer: string,
  correctAnswer: string,
  options: QuestionOption[],
  baseXP: number
): EvaluationResult {
  const isCorrect = userAnswer === correctAnswer;
  const selectedOption = options.find(o => o.id === userAnswer);
  const correctOption = options.find(o => o.id === correctAnswer);

  return {
    score: isCorrect ? 100 : 0,
    maxScore: 100,
    isCorrect,
    feedback: isCorrect
      ? `✅ Correct! ${correctOption?.feedback || ''}`
      : `❌ Not quite. The correct answer is "${correctOption?.text}". ${correctOption?.feedback || ''}`,
    xpEarned: isCorrect ? baseXP : Math.floor(baseXP * 0.1),
  };
}

// Evaluate trade-off question (weighted scoring)
export function evaluateTradeOff(
  userAnswer: string,
  options: QuestionOption[],
  baseXP: number
): EvaluationResult {
  const selectedOption = options.find(o => o.id === userAnswer);
  const bestOption = options.reduce((best, opt) => 
    (opt.score || 0) > (best.score || 0) ? opt : best
  );

  const score = selectedOption?.score || 0;
  const isCorrect = score >= 80; // Consider 80+ as "correct"

  let feedbackPrefix = '';
  if (score === 100) {
    feedbackPrefix = '🌟 Excellent!';
  } else if (score >= 80) {
    feedbackPrefix = '✅ Good choice!';
  } else if (score >= 50) {
    feedbackPrefix = '🔶 Acceptable, but not optimal.';
  } else {
    feedbackPrefix = '❌ Not the best approach.';
  }

  return {
    score,
    maxScore: 100,
    isCorrect,
    feedback: `${feedbackPrefix} ${selectedOption?.feedback || ''} The best answer would be: "${bestOption.text}"`,
    xpEarned: Math.floor(baseXP * (score / 100)),
  };
}

// Evaluate multi-select question
export function evaluateMultiSelect(
  userAnswers: string[],
  options: QuestionOption[],
  baseXP: number,
  penaltyForWrong: number = 10
): EvaluationResult {
  const correctOptions = options.filter(o => o.correct);
  const correctIds = new Set(correctOptions.map(o => o.id));
  
  let correctCount = 0;
  let wrongCount = 0;

  userAnswers.forEach(answer => {
    if (correctIds.has(answer)) {
      correctCount++;
    } else {
      wrongCount++;
    }
  });

  const missedCount = correctIds.size - correctCount;
  const pointsPerCorrect = 100 / correctIds.size;
  const rawScore = (correctCount * pointsPerCorrect) - (wrongCount * penaltyForWrong);
  const score = Math.max(0, Math.min(100, rawScore));
  const isCorrect = correctCount === correctIds.size && wrongCount === 0;

  let feedback = '';
  if (isCorrect) {
    feedback = '✅ Perfect! You identified all the correct answers.';
  } else if (correctCount > 0) {
    feedback = `🔶 You got ${correctCount} out of ${correctIds.size} correct.`;
    if (wrongCount > 0) {
      feedback += ` ${wrongCount} incorrect selection(s).`;
    }
    if (missedCount > 0) {
      feedback += ` You missed ${missedCount} correct answer(s).`;
    }
  } else {
    feedback = '❌ None of your selections were correct. Review the concepts and try again.';
  }

  return {
    score: Math.round(score),
    maxScore: 100,
    isCorrect,
    feedback,
    xpEarned: Math.floor(baseXP * (score / 100)),
  };
}

// Keyword-based evaluation for text input
interface ConceptKeywords {
  concept: string;
  keywords: string[];
  weight: number;
  required: boolean;
}

export function evaluateTextInput(
  userAnswer: string,
  concepts: ConceptKeywords[],
  baseXP: number
): EvaluationResult {
  const normalizedAnswer = userAnswer.toLowerCase();
  let totalScore = 0;
  let maxScore = 0;
  const conceptsMatched: string[] = [];
  const conceptsMissed: string[] = [];
  const requiredMissing: string[] = [];

  for (const concept of concepts) {
    maxScore += concept.weight;
    
    const found = concept.keywords.some(keyword => 
      normalizedAnswer.includes(keyword.toLowerCase())
    );
    
    if (found) {
      totalScore += concept.weight;
      conceptsMatched.push(concept.concept);
    } else {
      conceptsMissed.push(concept.concept);
      if (concept.required) {
        requiredMissing.push(concept.concept);
      }
    }
  }

  const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const isCorrect = requiredMissing.length === 0 && scorePercent >= 60;

  let feedback = '';
  if (scorePercent >= 90) {
    feedback = '🌟 Excellent answer! You covered all the key concepts.';
  } else if (scorePercent >= 70) {
    feedback = '✅ Good answer! You covered most of the important points.';
  } else if (scorePercent >= 50) {
    feedback = '🔶 Decent attempt, but some key concepts are missing.';
  } else {
    feedback = '❌ Your answer needs more detail. Review the core concepts.';
  }

  if (conceptsMissed.length > 0 && scorePercent < 90) {
    feedback += ` Consider mentioning: ${conceptsMissed.slice(0, 3).join(', ')}.`;
  }

  return {
    score: scorePercent,
    maxScore: 100,
    isCorrect,
    feedback,
    xpEarned: Math.floor(baseXP * (scorePercent / 100)),
    conceptsMatched,
    conceptsMissed,
  };
}

// Self-judge evaluation (user decides if they passed or failed)
export function evaluateSelfJudge(
  passed: boolean,
  baseXP: number
): EvaluationResult {
  const score = passed ? 100 : 40; // Give partial XP even for failed attempts to encourage honesty
  
  return {
    score,
    maxScore: 100,
    isCorrect: passed,
    feedback: passed 
      ? '🌟 Great! You understood the concept well.'
      : '📚 Honest self-assessment helps you learn! This topic has been added to your review list.',
    xpEarned: Math.floor(baseXP * (score / 100)),
  };
}

// Main evaluation function
export function evaluateAnswer(
  questionType: string,
  userAnswer: string | string[],
  questionData: {
    options?: QuestionOption[];
    correctAnswer?: string;
    concepts?: ConceptKeywords[];
    xpValue: number;
    selfJudgeResult?: { passed: boolean };
  }
): EvaluationResult {
  const { options = [], correctAnswer = '', concepts = [], xpValue } = questionData;

  switch (questionType) {
    case 'multiple_choice':
      return evaluateMultipleChoice(
        userAnswer as string,
        correctAnswer,
        options,
        xpValue
      );

    case 'trade_off':
      return evaluateTradeOff(
        userAnswer as string,
        options,
        xpValue
      );

    case 'multi_select':
      return evaluateMultiSelect(
        userAnswer as string[],
        options,
        xpValue
      );

    case 'text_input':
      return evaluateTextInput(
        userAnswer as string,
        concepts,
        xpValue
      );

    case 'self_judge':
      return evaluateSelfJudge(
        questionData.selfJudgeResult?.passed ?? false,
        xpValue
      );

    default:
      return {
        score: 0,
        maxScore: 100,
        isCorrect: false,
        feedback: 'Unknown question type',
        xpEarned: 0,
      };
  }
}
