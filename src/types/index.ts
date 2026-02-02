// Type definitions for DesignQuest

export interface User {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  xpPoints: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveAt: Date | null;
  createdAt: Date;
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  orderIndex: number;
  icon: string;
  colorTheme: string;
  isPublished: boolean;
  lessons?: Lesson[];
  _count?: {
    lessons: number;
  };
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  storyContent: string;
  orderIndex: number;
  xpReward: number;
  isPublished: boolean;
  module?: Module;
  questions?: Question[];
}

export interface QuestionOption {
  id: string;
  text: string;
  score?: number;
  correct?: boolean;
  feedback?: string;
}

export interface ConceptKeyword {
  concept: string;
  keywords: string[];
  weight: number;
  required: boolean;
}

export interface Question {
  id: string;
  lessonId: string;
  type: 'multiple_choice' | 'trade_off' | 'multi_select' | 'text_input' | 'self_judge';
  scenarioText: string;
  options: QuestionOption[];
  correctAnswer: string | string[];
  explanation: string;
  hints: string[];
  concepts?: ConceptKeyword[];
  sampleSolution?: string; // For self_judge questions - the expected/ideal solution
  evaluationCriteria?: string[]; // Criteria for self-evaluation
  xpValue: number;
  orderIndex: number;
}

export interface UserProgress {
  id: string;
  lessonId: string;
  completed: boolean;
  score: number;
  attempts: number;
  xpEarned: number;
  completedAt: Date | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  xpBonus: number;
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

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface ProgressResponse {
  progress: UserProgress;
  xpEarned: number;
  newLevel?: number;
  leveledUp: boolean;
}
