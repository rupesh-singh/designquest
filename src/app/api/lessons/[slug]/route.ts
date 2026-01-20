import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const lesson = await prisma.lesson.findUnique({
      where: { slug, isPublished: true },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields for questions
    const questions = lesson.questions.map((q: { options: string; correctAnswer: string; hints: string; }) => ({
      ...q,
      options: JSON.parse(q.options),
      correctAnswer: JSON.parse(q.correctAnswer),
      hints: q.hints ? JSON.parse(q.hints) : [],
    }));

    // Get user progress if logged in
    const user = await getCurrentUser();
    let progress = null;

    if (user) {
      progress = await prisma.userProgress.findUnique({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: lesson.id,
          },
        },
      });
    }

    return NextResponse.json({
      lesson: {
        ...lesson,
        questions,
      },
      progress,
    });
  } catch (error) {
    console.error('Get lesson error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
