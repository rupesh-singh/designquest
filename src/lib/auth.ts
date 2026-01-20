import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const TOKEN_NAME = 'auth_token';

export interface JWTPayload {
  userId: string;
  username: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Set auth cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Remove auth cookie
export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

// Get current user from cookie
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      xpPoints: true,
      level: true,
      currentStreak: true,
      longestStreak: true,
      lastActiveAt: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  // Get solved count separately
  const solvedCount = await prisma.userProgress.count({
    where: {
      userId: user.id,
      completed: true,
    },
  });

  return {
    ...user,
    solvedCount,
  };
}

// Re-export from xp.ts for convenience in server components
export { calculateLevel, xpForNextLevel } from './xp';

// Update streak
export async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastActiveAt: true, currentStreak: true, longestStreak: true },
  });

  if (!user) return;

  const now = new Date();
  const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
  
  let newStreak = user.currentStreak;

  if (!lastActive) {
    newStreak = 1;
  } else {
    const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Same day, no change
    } else if (diffDays === 1) {
      // Consecutive day
      newStreak = user.currentStreak + 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak),
      lastActiveAt: now,
    },
  });
}
