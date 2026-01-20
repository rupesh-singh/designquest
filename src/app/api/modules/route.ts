import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    const modules = await prisma.module.findMany({
      where: { isPublished: true },
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: { lessons: true },
        },
      },
    });

    // If user is logged in, get their progress
    let progressMap: Record<string, { completed: number; total: number }> = {};
    
    if (user) {
      const progress = await prisma.userProgress.findMany({
        where: { userId: user.id, completed: true },
        include: {
          lesson: {
            select: { moduleId: true },
          },
        },
      });

      // Group progress by module
      progress.forEach((p: { lesson: { moduleId: any; }; }) => {
        const moduleId = p.lesson.moduleId;
        if (!progressMap[moduleId]) {
          progressMap[moduleId] = { completed: 0, total: 0 };
        }
        progressMap[moduleId].completed++;
      });

      // Add total count for each module
      modules.forEach((m: { id: string | number; _count: { lessons: number; }; }) => {
        if (!progressMap[m.id]) {
          progressMap[m.id] = { completed: 0, total: m._count.lessons };
        } else {
          progressMap[m.id].total = m._count.lessons;
        }
      });
    }

    return NextResponse.json({ 
      modules,
      progress: progressMap,
    });
  } catch (error) {
    console.error('Get modules error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
