import { ExamHistoryEntry, PracticeAttempt, Question, UserProgress } from '../types/nuet';

const STORAGE_KEY = 'nuet_prep_ai_progress_v1';

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPreviousDateString(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return getLocalDateString(dt);
}

export function getDefaultProgress(): UserProgress {
  const today = getLocalDateString();
  return {
    attempts: {},
    streakDays: 0,
    lastActiveDate: null,
    todayActivityCount: 0,
    todayDate: today,
    examHistory: [],
    theme: 'light',
  };
}

export function loadProgress(): UserProgress {
  const today = getLocalDateString();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultProgress();
    }
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    const lastActive = parsed.lastActiveDate ?? null;
    const yesterday = getPreviousDateString(today);

    let streakDays = typeof parsed.streakDays === 'number' ? parsed.streakDays : 0;
    if (lastActive && lastActive !== today && lastActive !== yesterday) {
      streakDays = 0;
    }

    const todayActivityCount = parsed.todayDate === today ? (parsed.todayActivityCount ?? 0) : 0;

    return {
      attempts: parsed.attempts ?? {},
      streakDays,
      lastActiveDate: lastActive,
      todayActivityCount,
      todayDate: today,
      examHistory: Array.isArray(parsed.examHistory) ? parsed.examHistory : [],
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function recordActivityStreak(progress: UserProgress, countIncrement = 1): UserProgress {
  const today = getLocalDateString();
  const yesterday = getPreviousDateString(today);

  let nextStreak = progress.streakDays;
  if (progress.lastActiveDate === today) {
    nextStreak = Math.max(1, progress.streakDays);
  } else if (progress.lastActiveDate === yesterday) {
    nextStreak = progress.streakDays + 1;
  } else {
    nextStreak = 1;
  }

  const nextTodayCount =
    progress.todayDate === today ? progress.todayActivityCount + countIncrement : countIncrement;

  return {
    ...progress,
    streakDays: nextStreak,
    lastActiveDate: today,
    todayDate: today,
    todayActivityCount: nextTodayCount,
  };
}

export function recordPracticeAttempt(
  progress: UserProgress,
  attempt: PracticeAttempt
): UserProgress {
  const withStreak = recordActivityStreak(progress, 1);
  return {
    ...withStreak,
    attempts: {
      ...withStreak.attempts,
      [attempt.questionId]: attempt,
    },
  };
}

export function recordExamCompletion(
  progress: UserProgress,
  entry: ExamHistoryEntry
): UserProgress {
  const withStreak = recordActivityStreak(progress, entry.totalQuestions);
  return {
    ...withStreak,
    examHistory: [entry, ...withStreak.examHistory].slice(0, 20),
  };
}

export interface ScoreBreakdown {
  mathAccuracy: number | null;
  ctAccuracy: number | null;
  mathAnswered: number;
  mathTotal: number;
  mathCorrect: number;
  ctAnswered: number;
  ctTotal: number;
  ctCorrect: number;
  predictedMathScore: number;
  predictedCtScore: number;
  predictedTotalScore: number;
  hasAnyData: boolean;
  admissionStatus: 'Below Threshold (<120)' | 'Foundation Pass (120+)' | 'Direct Undergraduate Pass (130+)';
}

export function computePredictedScore(
  progress: UserProgress,
  questions: Question[]
): ScoreBreakdown {
  const mathQuestions = questions.filter((q) => q.section === 'Mathematics');
  const ctQuestions = questions.filter((q) => q.section === 'Critical Thinking & Problem Solving');

  let mathAnswered = 0;
  let mathCorrect = 0;
  for (const q of mathQuestions) {
    const att = progress.attempts[q.id];
    if (att) {
      mathAnswered += 1;
      if (att.isCorrect) mathCorrect += 1;
    }
  }

  let ctAnswered = 0;
  let ctCorrect = 0;
  for (const q of ctQuestions) {
    const att = progress.attempts[q.id];
    if (att) {
      ctAnswered += 1;
      if (att.isCorrect) ctCorrect += 1;
    }
  }

  // Also factor in latest mock exam if practice attempts are sparse or empty
  const latestExam = progress.examHistory[0];

  const mathAccuracy =
    mathAnswered > 0 ? Math.round((mathCorrect / mathAnswered) * 100) : null;
  const ctAccuracy =
    ctAnswered > 0 ? Math.round((ctCorrect / ctAnswered) * 100) : null;

  const hasPracticeData = mathAnswered + ctAnswered > 0;
  const hasAnyData = hasPracticeData || Boolean(latestExam);

  // Compute predicted section scores out of 120.
  // Blend practice accuracy with latest mock exam if both exist, or use available source.
  let predictedMathScore = 0;
  let predictedCtScore = 0;

  if (hasPracticeData && latestExam) {
    const practiceMath = mathAccuracy !== null ? Math.round((mathAccuracy / 100) * 120) : latestExam.mathScore;
    const practiceCt = ctAccuracy !== null ? Math.round((ctAccuracy / 100) * 120) : latestExam.ctScore;
    predictedMathScore = Math.round(practiceMath * 0.6 + latestExam.mathScore * 0.4);
    predictedCtScore = Math.round(practiceCt * 0.6 + latestExam.ctScore * 0.4);
  } else if (hasPracticeData) {
    predictedMathScore = mathAccuracy !== null ? Math.round((mathAccuracy / 100) * 120) : 0;
    predictedCtScore = ctAccuracy !== null ? Math.round((ctAccuracy / 100) * 120) : 0;
  } else if (latestExam) {
    predictedMathScore = latestExam.mathScore;
    predictedCtScore = latestExam.ctScore;
  }

  const predictedTotalScore = predictedMathScore + predictedCtScore;

  let admissionStatus: ScoreBreakdown['admissionStatus'] = 'Below Threshold (<120)';
  if (predictedTotalScore >= 130) {
    admissionStatus = 'Direct Undergraduate Pass (130+)';
  } else if (predictedTotalScore >= 120) {
    admissionStatus = 'Foundation Pass (120+)';
  }

  return {
    mathAccuracy,
    ctAccuracy,
    mathAnswered,
    mathTotal: mathQuestions.length,
    mathCorrect,
    ctAnswered,
    ctTotal: ctQuestions.length,
    ctCorrect,
    predictedMathScore,
    predictedCtScore,
    predictedTotalScore,
    hasAnyData,
    admissionStatus,
  };
}
