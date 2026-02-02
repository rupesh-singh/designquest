// Master questions file - organized by topic
// We'll add questions in batches

export interface SeedQuestion {
  type: 'multiple_choice' | 'trade_off' | 'multi_select' | 'text_input' | 'self_judge';
  scenarioText: string;
  options: string; // JSON string
  correctAnswer: string; // JSON string
  explanation: string;
  hints: string; // JSON string
  sampleSolution?: string; // For self_judge questions
  evaluationCriteria?: string; // JSON string for self_judge
  xpValue: number;
  orderIndex: number;
}

export interface SeedLesson {
  title: string;
  slug: string;
  storyContent: string;
  orderIndex: number;
  xpReward: number;
  questions: SeedQuestion[];
}

export interface SeedModule {
  title: string;
  slug: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  orderIndex: number;
  icon: string;
  colorTheme: string;
  lessons: SeedLesson[];
}

// Import question batches
import { batch1Modules } from './batch1';
import { batch2Modules } from './batch2';
import { batch3Modules } from './batch3';
import { batch4Modules } from './batch4';
import { batch5Modules } from './batch5';
import { batch6Modules } from './batch6';
import { batch7Modules } from './batch7';

// Combine all batches
export const allModules: SeedModule[] = [
  ...batch1Modules,
  ...batch2Modules,
  ...batch3Modules,
  ...batch4Modules,
  ...batch5Modules,
  ...batch6Modules,
  ...batch7Modules,
  // Future batches will be added here:
  // ...batch5Modules,
];
