import React, { useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { CT_SUBTOPICS, MATH_SUBTOPICS } from '../data/questionBank';
import {
  ExamHistoryEntry,
  Question,
  Section,
  Subtopic,
  UserProgress,
} from '../types/nuet';
import { computePredictedScore } from '../utils/storage';

interface DashboardProps {
  progress: UserProgress;
  questions: Question[];
  onStartSprint: () => void;
  onStartFullMock: () => void;
  onPracticeSubtopic: (section: Section, subtopic: Subtopic) => void;
  onReviewExam: (entry: ExamHistoryEntry) => void;
  onResetProgress: () => void;
}

export function Dashboard({
  progress,
  questions,
  onStartSprint,
  onStartFullMock,
  onPracticeSubtopic,
  onReviewExam,
  onResetProgress,
}: DashboardProps) {
  const [confirmReset, setConfirmReset] = useState(false);

  const score = computePredictedScore(progress, questions);
  const totalAnswered = Object.keys(progress.attempts).length;
  const totalCorrect = Object.values(progress.attempts).filter((a) => a.isCorrect).length;

  const getSubtopicStats = (subtopic: Subtopic) => {
    const subQuestions = questions.filter((q) => q.subtopic === subtopic);
    let answered = 0;
    let correct = 0;
    for (const q of subQuestions) {
      const att = progress.attempts[q.id];
      if (att) {
        answered += 1;
        if (att.isCorrect) correct += 1;
      }
    }
    const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : null;
    return { total: subQuestions.length, answered, correct, accuracy };
  };

  const getStatusMeta = () => {
    if (!score.hasAnyData) {
      return {
        label: 'No Data',
        badgeClass: 'border-black/20 dark:border-white/20 text-black/60 dark:text-white/60',
        topBorderClass: 'border-t-[#0A0A0A] dark:border-t-white',
      };
    }
    if (score.admissionStatus === 'Direct Undergraduate Pass (130+)') {
      return {
        label: 'Direct Pass (130+)',
        badgeClass: 'border-[#059669] text-[#059669]',
        topBorderClass: 'border-t-[#059669]',
      };
    }
    if (score.admissionStatus === 'Foundation Pass (120+)') {
      return {
        label: 'Foundation Pass (120+)',
        badgeClass: 'border-[#059669] text-[#059669]',
        topBorderClass: 'border-t-[#059669]',
      };
    }
    return {
      label: 'Below Threshold',
      badgeClass: 'border-[#E11D48] text-[#E11D48]',
      topBorderClass: 'border-t-[#E11D48]',
    };
  };

  const statusMeta = getStatusMeta();
  const scorePercent = Math.min(100, Math.round((score.predictedTotalScore / 240) * 100));

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="pb-6 border-b border-black/15 dark:border-white/15 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <h1 className="font-serif text-4xl sm:text-5xl leading-none tracking-tight text-[#0A0A0A] dark:text-white">
          Readiness
        </h1>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onStartSprint}
            className="group inline-flex items-center gap-2 px-4 py-2 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white hover:border-[#D97706] hover:-translate-y-0.5 text-xs font-medium transition-all duration-200 whitespace-nowrap"
          >
            <span>Daily Sprint</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          <button
            type="button"
            onClick={onStartFullMock}
            className="group inline-flex items-center gap-2 px-4 py-2 border border-[#0A0A0A] dark:border-white bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:border-[#E11D48] hover:bg-[#E11D48] hover:text-white dark:hover:bg-[#E11D48] dark:hover:border-[#E11D48] dark:hover:text-white hover:-translate-y-0.5 text-xs font-medium transition-all duration-200 whitespace-nowrap"
          >
            <span>Mock Exam</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </header>

      {/* Score + Streak */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predicted Score */}
        <div
          className={`lg:col-span-2 bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 ${statusMeta.topBorderClass} p-6 sm:p-8 flex flex-col justify-between gap-8`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-black/55 dark:text-white/55">
                Predicted Score
              </p>
              <div className="mt-2 flex items-baseline gap-2.5">
                <span className="font-serif text-6xl sm:text-7xl leading-none tabular-nums text-[#0A0A0A] dark:text-white">
                  {score.hasAnyData ? score.predictedTotalScore : '---'}
                </span>
                <span className="font-mono text-sm text-black/45 dark:text-white/45 tabular-nums">
                  / 240
                </span>
              </div>
            </div>

            <span
              className={`px-3 py-1 border text-xs font-medium whitespace-nowrap ${statusMeta.badgeClass}`}
            >
              {statusMeta.label}
            </span>
          </div>

          {/* Threshold Bar */}
          <div className="space-y-2">
            <div className="relative h-2 bg-black/10 dark:bg-white/10">
              <div
                className={`h-full transition-all duration-300 ${
                  score.predictedTotalScore >= 120
                    ? 'bg-[#059669]'
                    : 'bg-[#0A0A0A] dark:bg-white'
                }`}
                style={{ width: `${score.hasAnyData ? scorePercent : 0}%` }}
              />
              <div
                className="absolute -top-1 -bottom-1 w-[1px] bg-black/50 dark:bg-white/50"
                style={{ left: '50%' }}
                title="120"
              />
              <div
                className="absolute -top-1.5 -bottom-1.5 w-[2px] bg-[#059669]"
                style={{ left: '54.17%' }}
                title="130"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-black/50 dark:text-white/50">
              <span className="font-mono">0</span>
              <span className="font-mono">120 Foundation · 130 Direct</span>
              <span className="font-mono">240</span>
            </div>
          </div>

          <div className="pt-5 border-t border-black/10 dark:border-white/10 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-black/55 dark:text-white/55">Math</p>
              <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-[#0A0A0A] dark:text-white">
                {score.hasAnyData ? score.predictedMathScore : '---'}{' '}
                <span className="text-xs font-normal text-black/45 dark:text-white/45">
                  / 120
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-black/55 dark:text-white/55">Critical Thinking</p>
              <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-[#0A0A0A] dark:text-white">
                {score.hasAnyData ? score.predictedCtScore : '---'}{' '}
                <span className="text-xs font-normal text-black/45 dark:text-white/45">
                  / 120
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Streak & Stats */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 border-t-[#D97706] p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div>
            <p className="text-xs font-medium text-black/55 dark:text-white/55">
              Daily Streak
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-serif text-6xl leading-none tabular-nums text-[#0A0A0A] dark:text-white">
                {progress.streakDays}
              </span>
              <span className="text-sm text-black/55 dark:text-white/55">
                {progress.streakDays === 1 ? 'day' : 'days'}
              </span>
            </div>
          </div>

          <dl className="pt-5 border-t border-black/10 dark:border-white/10 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-black/60 dark:text-white/60">Today</dt>
              <dd className="font-mono font-medium tabular-nums text-[#0A0A0A] dark:text-white">
                {progress.todayActivityCount}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-black/60 dark:text-white/60">Solved</dt>
              <dd className="font-mono font-medium tabular-nums text-[#0A0A0A] dark:text-white">
                {totalAnswered}/{questions.length}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-black/60 dark:text-white/60">Accuracy</dt>
              <dd className="font-mono font-medium tabular-nums text-[#0A0A0A] dark:text-white">
                {totalAnswered > 0 ? `${Math.round((totalCorrect / totalAnswered) * 100)}%` : '—'}
              </dd>
            </div>
          </dl>

          <div className="pt-3 border-t border-black/10 dark:border-white/10">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 text-xs text-black/50 dark:text-white/50 hover:text-[#E11D48] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Reset Data</span>
              </button>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-[#E11D48] font-medium">Reset all?</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onResetProgress();
                      setConfirmReset(false);
                    }}
                    className="px-2.5 py-1 border border-[#E11D48] bg-[#E11D48] text-white text-xs font-medium"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1 border border-black/20 dark:border-white/20 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section Accuracy */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mathematics */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 border-t-[#2563EB] p-6 sm:p-8 space-y-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-base font-semibold text-[#0A0A0A] dark:text-white">
              Mathematics
            </h2>
            <span className="font-mono text-lg font-semibold tabular-nums text-[#2563EB]">
              {score.mathAccuracy !== null ? `${score.mathAccuracy}%` : '—'}
            </span>
          </div>

          <div className="space-y-2">
            {MATH_SUBTOPICS.map((sub) => {
              const stats = getSubtopicStats(sub);
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => onPracticeSubtopic('Mathematics', sub)}
                  className="group w-full px-3.5 py-3 border border-black/10 dark:border-white/10 hover:border-[#2563EB] hover:-translate-y-0.5 flex items-center justify-between gap-4 text-left transition-all duration-200"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-[#0A0A0A] dark:text-white">{sub}</span>
                      <span className="font-mono text-xs tabular-nums text-black/55 dark:text-white/55">
                        {stats.accuracy !== null ? `${stats.accuracy}%` : `0/${stats.total}`}
                      </span>
                    </div>
                    <div className="h-[2px] bg-black/10 dark:bg-white/10">
                      <div
                        className="h-full bg-[#2563EB] transition-all duration-300"
                        style={{ width: `${stats.accuracy ?? 0}%` }}
                      />
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-black/35 dark:text-white/35 group-hover:text-[#2563EB] group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Critical Thinking */}
        <div className="bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 border-t-[#D97706] p-6 sm:p-8 space-y-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-base font-semibold text-[#0A0A0A] dark:text-white">
              Critical Thinking
            </h2>
            <span className="font-mono text-lg font-semibold tabular-nums text-[#D97706]">
              {score.ctAccuracy !== null ? `${score.ctAccuracy}%` : '—'}
            </span>
          </div>

          <div className="space-y-2">
            {CT_SUBTOPICS.map((sub) => {
              const stats = getSubtopicStats(sub);
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => onPracticeSubtopic('Critical Thinking & Problem Solving', sub)}
                  className="group w-full px-3.5 py-3 border border-black/10 dark:border-white/10 hover:border-[#D97706] hover:-translate-y-0.5 flex items-center justify-between gap-4 text-left transition-all duration-200"
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-[#0A0A0A] dark:text-white">{sub}</span>
                      <span className="font-mono text-xs tabular-nums text-black/55 dark:text-white/55">
                        {stats.accuracy !== null ? `${stats.accuracy}%` : `0/${stats.total}`}
                      </span>
                    </div>
                    <div className="h-[2px] bg-black/10 dark:bg-white/10">
                      <div
                        className="h-full bg-[#D97706] transition-all duration-300"
                        style={{ width: `${stats.accuracy ?? 0}%` }}
                      />
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-black/35 dark:text-white/35 group-hover:text-[#D97706] group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Exam History */}
      <section className="bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 border-t-[#E11D48]">
        <div className="px-6 py-4 border-b border-black/15 dark:border-white/15 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-[#0A0A0A] dark:text-white">
            Exam History
          </h2>
          <span className="font-mono text-xs text-black/50 dark:text-white/50 tabular-nums">
            {progress.examHistory.length}
          </span>
        </div>

        {progress.examHistory.length === 0 ? (
          <div className="px-6 py-10 text-center space-y-3">
            <p className="text-sm text-black/60 dark:text-white/60">
              No mock exams completed yet.
            </p>
            <button
              type="button"
              onClick={onStartFullMock}
              className="group inline-flex items-center gap-2 px-4 py-2 border border-[#0A0A0A] dark:border-white text-xs font-medium hover:border-[#E11D48] hover:bg-[#E11D48] hover:text-white transition-colors duration-200"
            >
              <span>Start Mock Exam</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/15 dark:border-white/15 text-xs font-medium text-black/55 dark:text-white/55">
                  <th className="py-3 px-6">Mode</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Score</th>
                  <th className="py-3 px-4 text-right">Accuracy</th>
                  <th className="py-3 px-4 text-right">Pace</th>
                  <th className="py-3 px-6 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-white/10 text-sm">
                {progress.examHistory.map((entry) => {
                  const accuracy = Math.round(
                    (entry.correctCount / entry.totalQuestions) * 100
                  );
                  const dateLabel = new Date(entry.completedAt).toLocaleDateString(
                    undefined,
                    { month: 'short', day: 'numeric' }
                  );
                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.025] transition-colors"
                    >
                      <td className="py-3 px-6 font-medium text-[#0A0A0A] dark:text-white whitespace-nowrap">
                        {entry.modeLabel}
                      </td>
                      <td className="py-3 px-4 text-black/60 dark:text-white/60 whitespace-nowrap">
                        {dateLabel}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums whitespace-nowrap">
                        {entry.predictedScore}/240
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs tabular-nums text-black/70 dark:text-white/70 whitespace-nowrap">
                        {accuracy}%
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-xs tabular-nums text-black/60 dark:text-white/60 whitespace-nowrap">
                        {entry.averageTimeSeconds}s/Q
                      </td>
                      <td className="py-3 px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onReviewExam(entry)}
                          className="group inline-flex items-center gap-1 text-xs font-medium text-[#0A0A0A] dark:text-white hover:text-[#E11D48] transition-colors"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
