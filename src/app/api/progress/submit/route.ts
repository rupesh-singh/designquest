import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser, calculateLevel } from '@/lib/auth';
import { evaluateAnswer } from '@/lib/evaluation';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { lessonId, questionId, answer, selfJudgeResult } = await request.json();

    // Get question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        lesson: true,
      },
    });

    if (!question || question.lessonId !== lessonId) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Parse question data
    const options = JSON.parse(question.options);
    const correctAnswer = JSON.parse(question.correctAnswer);

    // Evaluate the answer
    const result = evaluateAnswer(question.type, answer, {
      options,
      correctAnswer,
      xpValue: question.xpValue,
      selfJudgeResult,
    });

    // Update or create progress
    const existingProgress = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lessonId,
        },
      },
    });

    if (existingProgress) {
      await prisma.userProgress.update({
        where: { id: existingProgress.id },
        data: {
          attempts: existingProgress.attempts + 1,
          score: Math.max(existingProgress.score, result.score),
          xpEarned: Math.max(existingProgress.xpEarned, result.xpEarned),
        },
      });
    } else {
      await prisma.userProgress.create({
        data: {
          userId: user.id,
          lessonId: lessonId,
          attempts: 1,
          score: result.score,
          xpEarned: result.xpEarned,
        },
      });
    }

    // Update user XP if this is their best score
    const xpToAdd = existingProgress 
      ? Math.max(0, result.xpEarned - existingProgress.xpEarned)
      : result.xpEarned;

    if (xpToAdd > 0) {
      const newXP = user.xpPoints + xpToAdd;
      const newLevel = calculateLevel(newXP);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          xpPoints: newXP,
          level: newLevel,
        },
      });
    }

    return NextResponse.json({
      result,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
