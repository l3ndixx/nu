export type Section = 'Mathematics' | 'Critical Thinking & Problem Solving';

export type MathSubtopic = 'Algebra' | 'Geometry' | 'Probability' | 'Functions';
export type CriticalThinkingSubtopic =
  | 'Main Conclusion'
  | 'Assumption'
  | 'Flaw'
  | 'Problem Solving';

export type Subtopic = MathSubtopic | CriticalThinkingSubtopic;

export type Difficulty = 'Standard' | 'Challenging';

export interface Question {
  id: string;
  section: Section;
  subtopic: Subtopic;
  difficulty: Difficulty;
  prompt: string;
  options: [string, string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3 | 4;
  explanation: string;
  keyTerms: string[];
}

export interface PracticeAttempt {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  answeredAt: string;
}

export type ExamModeType = 'full' | 'quick' | 'sprint';

export interface ExamQuestionResult {
  questionId: string;
  selectedIndex: number | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
  flagged: boolean;
}

export interface ExamHistoryEntry {
  id: string;
  mode: ExamModeType;
  modeLabel: string;
  completedAt: string;
  totalQuestions: number;
  correctCount: number;
  mathCorrect: number;
  mathTotal: number;
  ctCorrect: number;
  ctTotal: number;
  predictedScore: number;
  mathScore: number;
  ctScore: number;
  averageTimeSeconds: number;
  totalDurationSeconds: number;
  results: ExamQuestionResult[];
}

export interface UserProgress {
  attempts: Record<string, PracticeAttempt>;
  streakDays: number;
  lastActiveDate: string | null;
  todayActivityCount: number;
  todayDate: string;
  examHistory: ExamHistoryEntry[];
  theme: 'light' | 'dark';
}

export type NavigationTab = 'dashboard' | 'math' | 'ct' | 'sprint' | 'mock';

export type TutorLanguage = 'en' | 'ru' | 'kk';
export type TutorActionMode = 'hint' | 'wrong_options' | 'explain_mistake' | 'chat';

export interface TutorMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  actionLabel?: string;
}
