import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser, calculateLevel } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { lessonId, totalScore, totalXP } = await request.json();

    // Get lesson
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Update progress as completed
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId: user.id,
          lessonId: lessonId,
        },
      },
      update: {
        completed: true,
        score: totalScore,
        xpEarned: totalXP + lesson.xpReward,
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        lessonId: lessonId,
        completed: true,
        score: totalScore,
        xpEarned: totalXP + lesson.xpReward,
        completedAt: new Date(),
      },
    });

    // Update user XP
    const newXP = user.xpPoints + lesson.xpReward;
    const newLevel = calculateLevel(newXP);
    const leveledUp = newLevel > user.level;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        xpPoints: newXP,
        level: newLevel,
      },
    });

    return NextResponse.json({
      success: true,
      progress,
      xpEarned: totalXP + lesson.xpReward,
      newLevel,
      leveledUp,
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
