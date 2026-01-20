import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();

    const module = await prisma.module.findUnique({
      where: { slug, isPublished: true },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            storyContent: true,
            orderIndex: true,
            xpReward: true,
          },
        },
      },
    });

    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Get user progress for lessons in this module
    let lessonProgress: Record<string, { completed: boolean; score: number }> = {};
    
    if (user) {
      const progress = await prisma.userProgress.findMany({
        where: {
          userId: user.id,
          lessonId: { in: module.lessons.map((l: { id: any; }) => l.id) },
        },
      });

      progress.forEach((p: { lessonId: string | number; completed: any; score: any; }) => {
        lessonProgress[p.lessonId] = {
          completed: p.completed,
          score: p.score,
        };
      });
    }

    return NextResponse.json({ 
      module,
      progress: lessonProgress,
    });
  } catch (error) {
    console.error('Get module error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
