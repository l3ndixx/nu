import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Check,
  Lightbulb,
  RotateCcw,
  X,
} from 'lucide-react';
import { ALL_SUBTOPICS, CT_SUBTOPICS, MATH_SUBTOPICS } from '../data/questionBank';
import {
  PracticeAttempt,
  Question,
  Section,
  Subtopic,
  TutorActionMode,
} from '../types/nuet';
import { AITutorPanel } from './AITutorPanel';

interface PracticeModeProps {
  questions: Question[];
  attempts: Record<string, PracticeAttempt>;
  initialSection?: 'All' | Section;
  initialSubtopic?: 'All' | Subtopic;
  onRecordAttempt: (questionId: string, selectedIndex: number, isCorrect: boolean) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

export function PracticeMode({
  questions,
  attempts,
  initialSection = 'All',
  initialSubtopic = 'All',
  onRecordAttempt,
}: PracticeModeProps) {
  const [sectionFilter, setSectionFilter] = useState<'All' | Section>(initialSection);
  const [subtopicFilter, setSubtopicFilter] = useState<'All' | Subtopic>(initialSubtopic);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [lockedAnswers, setLockedAnswers] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const [qId, att] of Object.entries(attempts)) {
      initial[qId] = att.selectedIndex;
    }
    return initial;
  });

  const [tutorOpen, setTutorOpen] = useState(false);
  const [pendingTutorAction, setPendingTutorAction] = useState<TutorActionMode | null>(null);

  useEffect(() => {
    setSectionFilter(initialSection);
    setSubtopicFilter(initialSubtopic);
    setCurrentIndex(0);
  }, [initialSection, initialSubtopic]);

  useEffect(() => {
    if (Object.keys(attempts).length === 0) {
      setLockedAnswers({});
    }
  }, [attempts]);

  const availableSubtopics = useMemo(() => {
    if (sectionFilter === 'Mathematics') return MATH_SUBTOPICS;
    if (sectionFilter === 'Critical Thinking & Problem Solving') return CT_SUBTOPICS;
    return ALL_SUBTOPICS;
  }, [sectionFilter]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (sectionFilter !== 'All' && q.section !== sectionFilter) return false;
      if (subtopicFilter !== 'All' && q.subtopic !== subtopicFilter) return false;
      return true;
    });
  }, [questions, sectionFilter, subtopicFilter]);

  useEffect(() => {
    if (currentIndex >= filteredQuestions.length) {
      setCurrentIndex(0);
    }
  }, [filteredQuestions.length, currentIndex]);

  const activeQuestion = filteredQuestions[currentIndex] ?? null;
  const selectedIdx = activeQuestion ? lockedAnswers[activeQuestion.id] ?? null : null;
  const isAnswered = selectedIdx !== null;
  const isCorrect =
    activeQuestion && selectedIdx !== null ? selectedIdx === activeQuestion.correctIndex : false;

  const handleSectionChange = (nextSection: 'All' | Section) => {
    setSectionFilter(nextSection);
    setSubtopicFilter('All');
    setCurrentIndex(0);
  };

  const handleSubtopicChange = (nextSubtopic: 'All' | Subtopic) => {
    setSubtopicFilter(nextSubtopic);
    setCurrentIndex(0);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!activeQuestion || isAnswered) return;
    const correct = optionIndex === activeQuestion.correctIndex;
    setLockedAnswers((prev) => ({ ...prev, [activeQuestion.id]: optionIndex }));
    onRecordAttempt(activeQuestion.id, optionIndex, correct);
  };

  const handleRetryQuestion = () => {
    if (!activeQuestion) return;
    setLockedAnswers((prev) => {
      const next = { ...prev };
      delete next[activeQuestion.id];
      return next;
    });
  };

  const openTutorWithAction = (action: TutorActionMode | null) => {
    setTutorOpen(true);
    if (action) {
      setPendingTutorAction(action);
    }
  };

  const headingTitle =
    sectionFilter === 'Mathematics'
      ? 'Mathematics'
      : sectionFilter === 'Critical Thinking & Problem Solving'
        ? 'Critical Thinking'
        : 'Practice';

  const isMathQuestion = activeQuestion?.section === 'Mathematics';

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="pb-5 border-b border-black/15 dark:border-white/15 flex items-end justify-between gap-4">
        <h1 className="font-serif text-4xl sm:text-5xl leading-none tracking-tight text-[#0A0A0A] dark:text-white">
          {headingTitle}
        </h1>
        <span className="font-mono text-xs text-black/55 dark:text-white/55 tabular-nums">
          {filteredQuestions.length} items
        </span>
      </header>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Mathematics', 'Critical Thinking & Problem Solving'] as const).map(
            (sec) => {
              const active = sectionFilter === sec;
              const activeAccent =
                sec === 'Mathematics'
                  ? 'border-[#2563EB] bg-[#2563EB] text-white'
                  : sec === 'Critical Thinking & Problem Solving'
                    ? 'border-[#D97706] bg-[#D97706] text-white'
                    : 'border-[#0A0A0A] bg-[#0A0A0A] text-white dark:border-white dark:bg-white dark:text-[#0A0A0A]';
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => handleSectionChange(sec)}
                  className={`px-3 py-1.5 border text-xs font-medium transition-colors duration-200 whitespace-nowrap ${
                    active
                      ? activeAccent
                      : 'border-black/15 dark:border-white/15 text-black/65 dark:text-white/65 hover:border-[#0A0A0A] dark:hover:border-white hover:text-[#0A0A0A] dark:hover:text-white'
                  }`}
                >
                  {sec === 'All'
                    ? 'All'
                    : sec === 'Mathematics'
                      ? 'Math'
                      : 'Critical Thinking'}
                </button>
              );
            }
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleSubtopicChange('All')}
            className={`px-2.5 py-1 border text-xs font-medium transition-colors duration-200 whitespace-nowrap ${
              subtopicFilter === 'All'
                ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] dark:bg-white dark:text-[#0A0A0A] dark:border-white'
                : 'border-black/15 dark:border-white/15 text-black/60 dark:text-white/60 hover:border-[#0A0A0A] dark:hover:border-white'
            }`}
          >
            All Topics
          </button>
          {availableSubtopics.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => handleSubtopicChange(sub)}
              className={`px-2.5 py-1 border text-xs font-medium transition-colors duration-200 whitespace-nowrap ${
                subtopicFilter === sub
                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] dark:bg-white dark:text-[#0A0A0A] dark:border-white'
                  : 'border-black/15 dark:border-white/15 text-black/60 dark:text-white/60 hover:border-[#0A0A0A] dark:hover:border-white'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Question Index */}
        {filteredQuestions.length > 0 && (
          <div className="pt-3 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center gap-1.5">
            {filteredQuestions.map((q, idx) => {
              const lockedIdx = lockedAnswers[q.id];
              const qAnswered = lockedIdx !== undefined;
              const qCorrect = qAnswered && lockedIdx === q.correctIndex;
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Question ${idx + 1}`}
                  className={`w-8 h-8 border font-mono text-xs tabular-nums transition-colors duration-200 ${
                    isCurrent
                      ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] dark:bg-white dark:text-[#0A0A0A] dark:border-white font-semibold'
                      : !qAnswered
                        ? 'border-black/15 dark:border-white/15 text-black/70 dark:text-white/70 hover:border-[#0A0A0A] dark:hover:border-white'
                        : qCorrect
                          ? 'border-[#059669] text-[#059669]'
                          : 'border-[#E11D48] text-[#E11D48]'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Question Stage */}
      {!activeQuestion ? (
        <div className="bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 p-10 text-center space-y-3">
          <p className="text-sm text-black/65 dark:text-white/65">No matching questions.</p>
          <button
            type="button"
            onClick={() => {
              setSectionFilter('All');
              setSubtopicFilter('All');
            }}
            className="px-4 py-2 border border-[#0A0A0A] dark:border-white text-xs font-medium hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          className={`grid gap-6 items-start ${
            tutorOpen ? 'grid-cols-1 xl:grid-cols-12' : 'grid-cols-1'
          }`}
        >
          <article
            className={`bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 ${
              isMathQuestion ? 'border-t-[#2563EB]' : 'border-t-[#D97706]'
            } p-6 sm:p-8 lg:p-10 space-y-7 ${tutorOpen ? 'xl:col-span-7' : ''}`}
          >
            {/* Minimal Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs text-black/55 dark:text-white/55">
                <span className="font-mono font-semibold text-[#0A0A0A] dark:text-white tabular-nums">
                  {currentIndex + 1}/{filteredQuestions.length}
                </span>
                <span aria-hidden="true">·</span>
                <span>{activeQuestion.subtopic}</span>
                <span aria-hidden="true">·</span>
                <span>{activeQuestion.difficulty}</span>
              </div>

              {isMathQuestion && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#2563EB] text-[#2563EB] text-xs font-medium whitespace-nowrap">
                  <Calculator className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                  <span>No Calculator</span>
                </div>
              )}
            </div>

            {/* Question Stem */}
            <div className="text-[15px] sm:text-base leading-[1.7] text-[#0A0A0A] dark:text-white whitespace-pre-line max-w-[68ch]">
              {activeQuestion.prompt}
            </div>

            {/* Options A-E */}
            <div className="space-y-2.5" role="radiogroup" aria-label="Answer choices">
              {activeQuestion.options.map((optText, idx) => {
                const letter = OPTION_LETTERS[idx];
                const isSelected = selectedIdx === idx;
                const isCorrectOption = idx === activeQuestion.correctIndex;

                let rowClasses =
                  'bg-white dark:bg-[#0A0A0A] border-black/15 dark:border-white/15 text-[#0A0A0A] dark:text-white hover:border-[#0A0A0A] dark:hover:border-white hover:-translate-y-0.5';
                let badgeClasses = 'border-black/20 dark:border-white/20';

                if (isAnswered) {
                  if (isCorrectOption) {
                    rowClasses =
                      'bg-[#059669]/[0.06] border-[#059669] text-[#0A0A0A] dark:text-white';
                    badgeClasses = 'bg-[#059669] text-white border-[#059669]';
                  } else if (isSelected && !isCorrectOption) {
                    rowClasses =
                      'bg-[#E11D48]/[0.06] border-[#E11D48] text-[#0A0A0A] dark:text-white';
                    badgeClasses = 'bg-[#E11D48] text-white border-[#E11D48]';
                  } else {
                    rowClasses =
                      'bg-transparent border-black/10 dark:border-white/10 text-black/45 dark:text-white/40';
                    badgeClasses = 'border-black/10 dark:border-white/10 opacity-60';
                  }
                }

                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full min-h-[50px] px-4 py-3 border text-left flex items-center justify-between gap-4 transition-all duration-200 ${rowClasses}`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span
                        className={`w-7 h-7 border font-mono text-xs font-semibold flex items-center justify-center shrink-0 ${badgeClasses}`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm sm:text-[15px] leading-snug pt-0.5">
                        {optText}
                      </span>
                    </div>

                    {isAnswered && isCorrectOption && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#059669] whitespace-nowrap shrink-0">
                        <Check className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Correct</span>
                      </span>
                    )}

                    {isAnswered && isSelected && !isCorrectOption && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#E11D48] whitespace-nowrap shrink-0">
                        <X className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>Wrong</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Pre-answer Hint */}
            {!isAnswered && (
              <div className="pt-1 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => openTutorWithAction('hint')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-black/20 dark:border-white/20 text-xs font-medium hover:border-[#2563EB] hover:text-[#2563EB] transition-colors whitespace-nowrap"
                >
                  <Lightbulb className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>Socratic Hint</span>
                </button>
              </div>
            )}

            {/* Post-answer Solution */}
            {isAnswered && (
              <div className="pt-5 border-t border-black/15 dark:border-white/15 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`text-xs font-semibold ${
                      isCorrect ? 'text-[#059669]' : 'text-[#E11D48]'
                    }`}
                  >
                    {isCorrect
                      ? `Correct · Option ${OPTION_LETTERS[activeQuestion.correctIndex]}`
                      : `Incorrect · Answer is ${OPTION_LETTERS[activeQuestion.correctIndex]}`}
                  </span>

                  <button
                    type="button"
                    onClick={handleRetryQuestion}
                    className="inline-flex items-center gap-1 text-xs text-black/55 dark:text-white/55 hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Retry</span>
                  </button>
                </div>

                <div className="p-4 bg-[#F8F8F8] dark:bg-[#111111] border border-black/10 dark:border-white/10">
                  <p className="text-sm leading-relaxed text-black/85 dark:text-white/85 max-w-[66ch]">
                    {activeQuestion.explanation}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      openTutorWithAction(isCorrect ? 'wrong_options' : 'explain_mistake')
                    }
                    className="group inline-flex items-center gap-1.5 px-4 py-2 border border-[#0A0A0A] dark:border-white bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:border-[#2563EB] hover:bg-[#2563EB] hover:text-white dark:hover:border-[#2563EB] dark:hover:bg-[#2563EB] dark:hover:text-white text-xs font-medium transition-colors duration-200 whitespace-nowrap"
                  >
                    <span>Ask AI Tutor</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>

                  {!isCorrect && (
                    <button
                      type="button"
                      onClick={() => openTutorWithAction('wrong_options')}
                      className="px-3.5 py-2 border border-black/20 dark:border-white/20 text-xs font-medium hover:border-[#0A0A0A] dark:hover:border-white transition-colors whitespace-nowrap"
                    >
                      Wrong Options
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="pt-5 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                className="group inline-flex items-center gap-1.5 px-3.5 py-2 border border-black/20 dark:border-white/20 text-xs font-medium hover:border-[#0A0A0A] dark:hover:border-white disabled:opacity-30 transition-colors whitespace-nowrap"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={currentIndex >= filteredQuestions.length - 1}
                onClick={() =>
                  setCurrentIndex((i) => Math.min(filteredQuestions.length - 1, i + 1))
                }
                className="group inline-flex items-center gap-1.5 px-3.5 py-2 border border-black/20 dark:border-white/20 text-xs font-medium hover:border-[#0A0A0A] dark:hover:border-white disabled:opacity-30 transition-colors whitespace-nowrap"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          </article>

          {tutorOpen && (
            <div className="xl:col-span-5 xl:sticky xl:top-6">
              <AITutorPanel
                question={activeQuestion}
                selectedOptionIndex={selectedIdx}
                initialAction={pendingTutorAction}
                onActionHandled={() => setPendingTutorAction(null)}
                onClose={() => setTutorOpen(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
