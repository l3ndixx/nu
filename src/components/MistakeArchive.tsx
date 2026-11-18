import React, { useMemo, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Question, TutorActionMode, UserProgress } from '../types/nuet';
import { AITutorPanel } from './AITutorPanel';

interface MistakeArchiveProps {
  questions: Question[];
  progress: UserProgress;
  onGoToPractice: () => void;
}

interface MistakeRecord {
  key: string;
  source: string;
  timestamp: string;
  question: Question;
  selectedIndex: number | null;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

export function MistakeArchive({
  questions,
  progress,
  onGoToPractice,
}: MistakeArchiveProps) {
  const [activeTutorItem, setActiveTutorItem] = useState<{
    question: Question;
    selectedIndex: number | null;
    action: TutorActionMode | null;
  } | null>(null);

  const mistakeRecords = useMemo<MistakeRecord[]>(() => {
    const items: MistakeRecord[] = [];

    for (const att of Object.values(progress.attempts)) {
      if (!att.isCorrect) {
        const q = questions.find((item) => item.id === att.questionId);
        if (q) {
          items.push({
            key: `practice-${q.id}`,
            source: 'Practice',
            timestamp: att.answeredAt,
            question: q,
            selectedIndex: att.selectedIndex,
          });
        }
      }
    }

    for (const exam of progress.examHistory) {
      for (const res of exam.results) {
        if (!res.isCorrect) {
          const q = questions.find((item) => item.id === res.questionId);
          if (q) {
            items.push({
              key: `exam-${exam.id}-${q.id}`,
              source: exam.modeLabel,
              timestamp: exam.completedAt,
              question: q,
              selectedIndex: res.selectedIndex,
            });
          }
        }
      }
    }

    return items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [progress.attempts, progress.examHistory, questions]);

  if (mistakeRecords.length === 0) {
    return (
      <div className="bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 border-t-[#059669] p-10 text-center space-y-4">
        <p className="text-sm text-black/65 dark:text-white/65">No mistakes recorded yet.</p>
        <button
          type="button"
          onClick={onGoToPractice}
          className="group inline-flex items-center gap-1.5 px-4 py-2 border border-[#0A0A0A] dark:border-white text-xs font-medium hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-colors"
        >
          <span>Start Practice</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-6 items-start ${
        activeTutorItem ? 'grid-cols-1 xl:grid-cols-12' : 'grid-cols-1'
      }`}
    >
      <div className={`space-y-4 ${activeTutorItem ? 'xl:col-span-7' : ''}`}>
        {mistakeRecords.map((item) => {
          const userChoice =
            item.selectedIndex !== null
              ? `${OPTION_LETTERS[item.selectedIndex]}) ${item.question.options[item.selectedIndex]}`
              : 'Skipped';
          const keyChoice = `${OPTION_LETTERS[item.question.correctIndex]}) ${item.question.options[item.question.correctIndex]}`;

          return (
            <article
              key={item.key}
              className="bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 border-t-[#E11D48] p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10 text-xs">
                <div className="flex items-center gap-2 text-black/55 dark:text-white/55">
                  <span className="font-medium text-[#0A0A0A] dark:text-white">
                    {item.source}
                  </span>
                  <span>·</span>
                  <span>{item.question.subtopic}</span>
                </div>
                <span className="inline-flex items-center gap-1 font-medium text-[#E11D48]">
                  <X className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Wrong</span>
                </span>
              </div>

              <p className="text-sm leading-relaxed text-[#0A0A0A] dark:text-white whitespace-pre-line max-w-[68ch]">
                {item.question.prompt}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 border border-[#E11D48]">
                  <p className="text-black/55 dark:text-white/55 mb-1">Yours</p>
                  <p className="font-medium">{userChoice}</p>
                </div>
                <div className="p-3 border border-[#059669]">
                  <p className="text-black/55 dark:text-white/55 mb-1">Correct</p>
                  <p className="font-medium">{keyChoice}</p>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-black/75 dark:text-white/75 bg-[#F8F8F8] dark:bg-[#111111] p-4 border border-black/10 dark:border-white/10">
                {item.question.explanation}
              </p>

              <button
                type="button"
                onClick={() =>
                  setActiveTutorItem({
                    question: item.question,
                    selectedIndex: item.selectedIndex,
                    action:
                      item.selectedIndex !== null ? 'explain_mistake' : 'wrong_options',
                  })
                }
                className="group inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#0A0A0A] dark:border-white text-xs font-medium hover:border-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-colors duration-200"
              >
                <span>Explain Mistake</span>
                <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </article>
          );
        })}
      </div>

      {activeTutorItem && (
        <div className="xl:col-span-5 xl:sticky xl:top-6">
          <AITutorPanel
            question={activeTutorItem.question}
            selectedOptionIndex={activeTutorItem.selectedIndex}
            initialAction={activeTutorItem.action}
            onActionHandled={() =>
              setActiveTutorItem((prev) => (prev ? { ...prev, action: null } : null))
            }
            onClose={() => setActiveTutorItem(null)}
          />
        </div>
      )}
    </div>
  );
}
