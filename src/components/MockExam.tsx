import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Check,
  Clock,
  Flag,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  ExamHistoryEntry,
  ExamModeType,
  ExamQuestionResult,
  Question,
  TutorActionMode,
  UserProgress,
} from '../types/nuet';
import { AITutorPanel } from './AITutorPanel';
import { MistakeArchive } from './MistakeArchive';

interface MockExamProps {
  questions: Question[];
  progress: UserProgress;
  autoStartMode?: ExamModeType | null;
  onConsumeAutoStart?: () => void;
  initialReviewEntry?: ExamHistoryEntry | null;
  onConsumeReviewEntry?: () => void;
  onCompleteExam: (entry: ExamHistoryEntry) => void;
  onGoToPractice: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

function formatTimer(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function MockExam({
  questions,
  progress,
  autoStartMode = null,
  onConsumeAutoStart,
  initialReviewEntry = null,
  onConsumeReviewEntry,
  onCompleteExam,
  onGoToPractice,
}: MockExamProps) {
  const [phase, setPhase] = useState<'setup' | 'running' | 'results'>('setup');
  const [setupTab, setSetupTab] = useState<'simulate' | 'mistakes' | 'tutor'>('simulate');
  const [standaloneQId, setStandaloneQId] = useState<string | null>(questions[0]?.id ?? null);

  const [mode, setMode] = useState<ExamModeType>('full');
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [fullPart, setFullPart] = useState<1 | 2>(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeSpentByQ, setTimeSpentByQ] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(3600);
  const [confirmFinish, setConfirmFinish] = useState(false);

  const [completedEntry, setCompletedEntry] = useState<ExamHistoryEntry | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'mistakes'>('all');
  const [tutorQuestion, setTutorQuestion] = useState<{
    question: Question;
    selectedIndex: number | null;
    action: TutorActionMode;
  } | null>(null);

  const lastTickRef = useRef<number>(Date.now());
  const examStartRef = useRef<number>(Date.now());

  const recordActiveQuestionElapsed = (currentQId: string | undefined) => {
    if (!currentQId) return;
    const now = Date.now();
    const deltaSec = Math.max(0, Math.round((now - lastTickRef.current) / 1000));
    lastTickRef.current = now;
    if (deltaSec > 0) {
      setTimeSpentByQ((prev) => ({
        ...prev,
        [currentQId]: (prev[currentQId] ?? 0) + deltaSec,
      }));
    }
  };

  const startExam = (chosenMode: ExamModeType) => {
    const mathQs = questions.filter((q) => q.section === 'Mathematics');
    const ctQs = questions.filter((q) => q.section === 'Critical Thinking & Problem Solving');

    let selectedQs: Question[] = [];
    let initialSeconds = 3600;

    if (chosenMode === 'full') {
      selectedQs = [...mathQs, ...ctQs];
      initialSeconds = 60 * 60;
    } else if (chosenMode === 'quick') {
      selectedQs = [...mathQs, ...ctQs];
      initialSeconds = 10 * 60;
    } else {
      selectedQs = [mathQs[0], ctQs[0], mathQs[1], ctQs[1], mathQs[2]].filter(Boolean);
      initialSeconds = 5 * 60;
    }

    setMode(chosenMode);
    setExamQuestions(selectedQs);
    setFullPart(1);
    setCurrentIndex(0);
    setAnswers({});
    setFlagged({});
    setTimeSpentByQ({});
    setSecondsLeft(initialSeconds);
    setConfirmFinish(false);
    setTutorQuestion(null);
    lastTickRef.current = Date.now();
    examStartRef.current = Date.now();
    setPhase('running');
  };

  useEffect(() => {
    if (autoStartMode) {
      startExam(autoStartMode);
      onConsumeAutoStart?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartMode]);

  useEffect(() => {
    if (initialReviewEntry) {
      setCompletedEntry(initialReviewEntry);
      setReviewFilter('all');
      setTutorQuestion(null);
      setPhase('results');
      onConsumeReviewEntry?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReviewEntry]);

  const visibleQuestions = useMemo(() => {
    if (mode !== 'full') return examQuestions;
    return examQuestions.filter((q) =>
      fullPart === 1
        ? q.section === 'Mathematics'
        : q.section === 'Critical Thinking & Problem Solving'
    );
  }, [examQuestions, mode, fullPart]);

  const finishExam = () => {
    const activeQ = visibleQuestions[currentIndex];
    const now = Date.now();
    const extraSec = Math.max(0, Math.round((now - lastTickRef.current) / 1000));
    const finalTimes = { ...timeSpentByQ };
    if (activeQ && extraSec > 0) {
      finalTimes[activeQ.id] = (finalTimes[activeQ.id] ?? 0) + extraSec;
    }

    const results: ExamQuestionResult[] = examQuestions.map((q) => {
      const sel = answers[q.id] ?? null;
      return {
        questionId: q.id,
        selectedIndex: sel,
        isCorrect: sel !== null && sel === q.correctIndex,
        timeSpentSeconds: finalTimes[q.id] ?? 0,
        flagged: Boolean(flagged[q.id]),
      };
    });

    const mathResults = results.filter((r) => {
      const q = examQuestions.find((item) => item.id === r.questionId);
      return q?.section === 'Mathematics';
    });
    const ctResults = results.filter((r) => {
      const q = examQuestions.find((item) => item.id === r.questionId);
      return q?.section === 'Critical Thinking & Problem Solving';
    });

    const mathCorrect = mathResults.filter((r) => r.isCorrect).length;
    const ctCorrect = ctResults.filter((r) => r.isCorrect).length;
    const mathTotal = mathResults.length;
    const ctTotal = ctResults.length;

    const mathScore = mathTotal > 0 ? Math.round((mathCorrect / mathTotal) * 120) : 0;
    const ctScore = ctTotal > 0 ? Math.round((ctCorrect / ctTotal) * 120) : 0;
    const predictedScore = mathScore + ctScore;

    const totalDurationSeconds = Math.max(
      1,
      Math.round((now - examStartRef.current) / 1000)
    );
    const totalTrackedSeconds = results.reduce((acc, r) => acc + r.timeSpentSeconds, 0);
    const averageTimeSeconds = Math.round(
      (totalTrackedSeconds > 0 ? totalTrackedSeconds : totalDurationSeconds) /
        Math.max(1, results.length)
    );

    const modeLabels: Record<ExamModeType, string> = {
      full: 'Full Exam',
      quick: 'Quick Mock',
      sprint: 'Daily Sprint',
    };

    const entry: ExamHistoryEntry = {
      id: `exam-${Date.now()}`,
      mode,
      modeLabel: modeLabels[mode],
      completedAt: new Date().toISOString(),
      totalQuestions: results.length,
      correctCount: mathCorrect + ctCorrect,
      mathCorrect,
      mathTotal,
      ctCorrect,
      ctTotal,
      predictedScore,
      mathScore,
      ctScore,
      averageTimeSeconds,
      totalDurationSeconds,
      results,
    };

    setCompletedEntry(entry);
    setReviewFilter('all');
    setPhase('results');
    onCompleteExam(entry);
  };

  useEffect(() => {
    if (phase !== 'running') return;
    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'running' || secondsLeft > 0) return;

    if (mode === 'full' && fullPart === 1) {
      recordActiveQuestionElapsed(visibleQuestions[currentIndex]?.id);
      setFullPart(2);
      setCurrentIndex(0);
      setSecondsLeft(60 * 60);
      setConfirmFinish(false);
    } else {
      finishExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase]);

  const jumpToQuestion = (nextIdx: number) => {
    recordActiveQuestionElapsed(visibleQuestions[currentIndex]?.id);
    setCurrentIndex(nextIdx);
  };

  const transitionToPart2 = () => {
    recordActiveQuestionElapsed(visibleQuestions[currentIndex]?.id);
    setFullPart(2);
    setCurrentIndex(0);
    setSecondsLeft(60 * 60);
    setConfirmFinish(false);
  };

  if (phase === 'setup') {
    const modes: Array<{
      id: ExamModeType;
      title: string;
      spec: string;
      topBorder: string;
      hoverBorder: string;
    }> = [
      {
        id: 'full',
        title: 'Full Exam',
        spec: '120 min · Math + Critical Thinking',
        topBorder: 'border-t-[#E11D48]',
        hoverBorder: 'hover:border-[#E11D48]',
      },
      {
        id: 'quick',
        title: 'Quick Mock',
        spec: '10 min · 12 Questions',
        topBorder: 'border-t-[#2563EB]',
        hoverBorder: 'hover:border-[#2563EB]',
      },
      {
        id: 'sprint',
        title: 'Daily Sprint',
        spec: '5 min · 5 Questions',
        topBorder: 'border-t-[#D97706]',
        hoverBorder: 'hover:border-[#D97706]',
      },
    ];

    const standaloneQuestion =
      questions.find((q) => q.id === standaloneQId) ?? null;

    return (
      <div className="space-y-8">
        <header className="pb-5 border-b border-black/15 dark:border-white/15 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <h1 className="font-serif text-4xl sm:text-5xl leading-none tracking-tight text-[#0A0A0A] dark:text-white">
            {setupTab === 'simulate'
              ? 'Mock Exam'
              : setupTab === 'mistakes'
                ? 'Mistake Archive'
                : 'AI Tutor'}
          </h1>

          <div className="flex items-center border border-black/15 dark:border-white/15 bg-white dark:bg-[#0A0A0A] divide-x divide-black/15 dark:divide-white/15 shrink-0">
            <button
              type="button"
              onClick={() => setSetupTab('simulate')}
              className={`px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                setupTab === 'simulate'
                  ? 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]'
                  : 'text-black/60 dark:text-white/60 hover:text-[#0A0A0A] dark:hover:text-white'
              }`}
            >
              Simulate
            </button>
            <button
              type="button"
              onClick={() => setSetupTab('mistakes')}
              className={`px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                setupTab === 'mistakes'
                  ? 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]'
                  : 'text-black/60 dark:text-white/60 hover:text-[#0A0A0A] dark:hover:text-white'
              }`}
            >
              Mistakes
            </button>
            <button
              type="button"
              onClick={() => setSetupTab('tutor')}
              className={`px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                setupTab === 'tutor'
                  ? 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]'
                  : 'text-black/60 dark:text-white/60 hover:text-[#0A0A0A] dark:hover:text-white'
              }`}
            >
              AI Tutor
            </button>
          </div>
        </header>

        {setupTab === 'simulate' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => startExam(m.id)}
                className={`group bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 ${m.topBorder} ${m.hoverBorder} hover:-translate-y-0.5 p-6 sm:p-8 text-left flex flex-col justify-between gap-10 transition-all duration-200`}
              >
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-[#0A0A0A] dark:text-white">
                    {m.title}
                  </h2>
                  <p className="font-mono text-xs text-black/55 dark:text-white/55">
                    {m.spec}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10 text-xs font-medium text-[#0A0A0A] dark:text-white">
                  <span>Start</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        )}

        {setupTab === 'mistakes' && (
          <MistakeArchive
            questions={questions}
            progress={progress}
            onGoToPractice={onGoToPractice}
          />
        )}

        {setupTab === 'tutor' && (
          <AITutorPanel
            standalone
            question={standaloneQuestion}
            selectedOptionIndex={
              standaloneQuestion
                ? progress.attempts[standaloneQuestion.id]?.selectedIndex ?? null
                : null
            }
            allQuestions={questions}
            onSelectQuestion={setStandaloneQId}
          />
        )}
      </div>
    );
  }

  if (phase === 'results' && completedEntry) {
    const accuracy = Math.round(
      (completedEntry.correctCount / completedEntry.totalQuestions) * 100
    );

    const isPass = completedEntry.predictedScore >= 120;
    const statusLabel =
      completedEntry.predictedScore >= 130
        ? 'Direct Pass (130+)'
        : completedEntry.predictedScore >= 120
          ? 'Foundation Pass (120+)'
          : 'Below Threshold';

    const reviewItems = completedEntry.results.filter((r) =>
      reviewFilter === 'mistakes' ? !r.isCorrect : true
    );

    return (
      <div className="space-y-8">
        <header className="pb-5 border-b border-black/15 dark:border-white/15 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-black/55 dark:text-white/55">
              {completedEntry.modeLabel}
            </p>
            <h1 className="mt-1 font-serif text-4xl leading-none text-[#0A0A0A] dark:text-white">
              Results
            </h1>
          </div>

          <button
            type="button"
            onClick={() => {
              setCompletedEntry(null);
              setTutorQuestion(null);
              setPhase('setup');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-black/20 dark:border-white/20 text-xs font-medium hover:border-[#0A0A0A] dark:hover:border-white transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>New Exam</span>
          </button>
        </header>

        {/* Summary Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 ${
              isPass ? 'border-t-[#059669]' : 'border-t-[#E11D48]'
            } p-5 space-y-2`}
          >
            <p className="text-xs text-black/55 dark:text-white/55">Score</p>
            <p className="font-serif text-5xl leading-none tabular-nums text-[#0A0A0A] dark:text-white">
              {completedEntry.predictedScore}{' '}
              <span className="font-mono text-xs text-black/45 dark:text-white/45">
                /240
              </span>
            </p>
            <p
              className={`text-xs font-medium ${
                isPass ? 'text-[#059669]' : 'text-[#E11D48]'
              }`}
            >
              {statusLabel}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 border-t-[#2563EB] p-5 space-y-2">
            <p className="text-xs text-black/55 dark:text-white/55">Sections</p>
            <dl className="space-y-1.5 font-mono text-xs tabular-nums pt-1">
              <div className="flex justify-between">
                <dt className="text-black/55 dark:text-white/55">Math</dt>
                <dd className="font-semibold">
                  {completedEntry.mathScore}/120 ({completedEntry.mathCorrect}/
                  {completedEntry.mathTotal})
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-black/55 dark:text-white/55">CT</dt>
                <dd className="font-semibold">
                  {completedEntry.ctScore}/120 ({completedEntry.ctCorrect}/
                  {completedEntry.ctTotal})
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 border-t-[#059669] p-5 space-y-2">
            <p className="text-xs text-black/55 dark:text-white/55">Accuracy</p>
            <p className="font-serif text-5xl leading-none tabular-nums text-[#0A0A0A] dark:text-white">
              {accuracy}%
            </p>
            <p className="font-mono text-xs text-black/55 dark:text-white/55 tabular-nums">
              {completedEntry.correctCount}/{completedEntry.totalQuestions}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 border-t-[#D97706] p-5 space-y-2">
            <p className="text-xs text-black/55 dark:text-white/55">Avg Pace</p>
            <p className="font-serif text-5xl leading-none tabular-nums text-[#0A0A0A] dark:text-white">
              {completedEntry.averageTimeSeconds}s
            </p>
            <p className="font-mono text-xs text-black/55 dark:text-white/55 tabular-nums">
              {formatTimer(completedEntry.totalDurationSeconds)} total
            </p>
          </div>
        </section>

        {/* Review Filter */}
        <div className="flex items-center border border-black/15 dark:border-white/15 bg-white dark:bg-[#0A0A0A] w-fit divide-x divide-black/15 dark:divide-white/15">
          <button
            type="button"
            onClick={() => setReviewFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
              reviewFilter === 'all'
                ? 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]'
                : 'text-black/60 dark:text-white/60 hover:text-[#0A0A0A] dark:hover:text-white'
            }`}
          >
            All ({completedEntry.results.length})
          </button>
          <button
            type="button"
            onClick={() => setReviewFilter('mistakes')}
            className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
              reviewFilter === 'mistakes'
                ? 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]'
                : 'text-black/60 dark:text-white/60 hover:text-[#0A0A0A] dark:hover:text-white'
            }`}
          >
            Mistakes ({completedEntry.results.filter((r) => !r.isCorrect).length})
          </button>
        </div>

        {/* Mistake Review */}
        <div
          className={`grid gap-6 items-start ${
            tutorQuestion ? 'grid-cols-1 xl:grid-cols-12' : 'grid-cols-1'
          }`}
        >
          <div className={`space-y-4 ${tutorQuestion ? 'xl:col-span-7' : ''}`}>
            {reviewItems.length === 0 ? (
              <div className="bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 p-8 text-center">
                <p className="text-sm text-black/65 dark:text-white/65">Zero mistakes.</p>
              </div>
            ) : (
              reviewItems.map((res, idx) => {
                const q = questions.find((item) => item.id === res.questionId);
                if (!q) return null;

                const userChoiceText =
                  res.selectedIndex !== null
                    ? `${OPTION_LETTERS[res.selectedIndex]}) ${q.options[res.selectedIndex]}`
                    : 'Skipped';
                const correctChoiceText = `${OPTION_LETTERS[q.correctIndex]}) ${q.options[q.correctIndex]}`;

                return (
                  <article
                    key={q.id}
                    className={`bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 ${
                      res.isCorrect ? 'border-t-[#059669]' : 'border-t-[#E11D48]'
                    } p-6 space-y-4`}
                  >
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10 text-xs">
                      <div className="flex items-center gap-2 text-black/55 dark:text-white/55">
                        <span className="font-mono font-semibold text-[#0A0A0A] dark:text-white">
                          #{idx + 1}
                        </span>
                        <span>·</span>
                        <span>{q.subtopic}</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">{res.timeSpentSeconds}s</span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          res.isCorrect ? 'text-[#059669]' : 'text-[#E11D48]'
                        }`}
                      >
                        {res.isCorrect ? (
                          <Check className="w-3.5 h-3.5" strokeWidth={2} />
                        ) : (
                          <X className="w-3.5 h-3.5" strokeWidth={2} />
                        )}
                        <span>{res.isCorrect ? 'Correct' : 'Wrong'}</span>
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed text-[#0A0A0A] dark:text-white whitespace-pre-line max-w-[68ch]">
                      {q.prompt}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div
                        className={`p-3 border ${
                          res.isCorrect ? 'border-[#059669]' : 'border-[#E11D48]'
                        }`}
                      >
                        <p className="text-black/55 dark:text-white/55 mb-1">Yours</p>
                        <p className="font-medium">{userChoiceText}</p>
                      </div>

                      <div className="p-3 border border-[#059669]">
                        <p className="text-black/55 dark:text-white/55 mb-1">Correct</p>
                        <p className="font-medium">{correctChoiceText}</p>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-black/75 dark:text-white/75 bg-[#F8F8F8] dark:bg-[#111111] p-4 border border-black/10 dark:border-white/10">
                      {q.explanation}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setTutorQuestion({
                          question: q,
                          selectedIndex: res.selectedIndex,
                          action: res.isCorrect ? 'wrong_options' : 'explain_mistake',
                        })
                      }
                      className="group inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#0A0A0A] dark:border-white text-xs font-medium hover:border-[#2563EB] hover:bg-[#2563EB] hover:text-white transition-colors duration-200"
                    >
                      <span>{res.isCorrect ? 'Wrong Options' : 'Explain Mistake'}</span>
                      <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                  </article>
                );
              })
            )}
          </div>

          {tutorQuestion && (
            <div className="xl:col-span-5 xl:sticky xl:top-6">
              <AITutorPanel
                question={tutorQuestion.question}
                selectedOptionIndex={tutorQuestion.selectedIndex}
                initialAction={tutorQuestion.action}
                onClose={() => setTutorQuestion(null)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Running Exam UI
  const activeQ = visibleQuestions[currentIndex];
  const answeredCount = visibleQuestions.filter((q) => answers[q.id] !== undefined).length;
  const timerWarning = secondsLeft <= 120;

  return (
    <div className="space-y-6">
      {/* Top Timer Bar */}
      <div className="bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 border-t-[#E11D48] px-5 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs">
          <span className="font-semibold text-[#0A0A0A] dark:text-white">
            {mode === 'full'
              ? `Part ${fullPart}/2 · ${fullPart === 1 ? 'Math' : 'Critical Thinking'}`
              : mode === 'quick'
                ? 'Quick Mock'
                : 'Daily Sprint'}
          </span>
          <span className="font-mono text-black/55 dark:text-white/55 tabular-nums">
            {answeredCount}/{visibleQuestions.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 border font-mono text-sm font-semibold tabular-nums whitespace-nowrap ${
              timerWarning
                ? 'border-[#E11D48] text-[#E11D48]'
                : 'border-black/20 dark:border-white/20 text-[#0A0A0A] dark:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
            <span>{formatTimer(secondsLeft)}</span>
          </div>

          {mode === 'full' && fullPart === 1 ? (
            <button
              type="button"
              onClick={transitionToPart2}
              className="px-4 py-2 border border-[#0A0A0A] dark:border-white bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:border-[#D97706] hover:bg-[#D97706] hover:text-white text-xs font-medium transition-colors whitespace-nowrap"
            >
              Next Section
            </button>
          ) : !confirmFinish ? (
            <button
              type="button"
              onClick={() => setConfirmFinish(true)}
              className="px-4 py-2 border border-[#0A0A0A] dark:border-white bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:border-[#E11D48] hover:bg-[#E11D48] hover:text-white text-xs font-medium transition-colors whitespace-nowrap"
            >
              Submit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={finishExam}
                className="px-3.5 py-2 border border-[#059669] bg-[#059669] text-white text-xs font-medium whitespace-nowrap"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmFinish(false)}
                className="px-3 py-2 border border-black/20 dark:border-white/20 text-xs whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {activeQ && (
          <article
            className={`lg:col-span-8 bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 ${
              activeQ.section === 'Mathematics' ? 'border-t-[#2563EB]' : 'border-t-[#D97706]'
            } p-6 sm:p-8 space-y-7`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs text-black/55 dark:text-white/55">
                <span className="font-mono font-semibold text-[#0A0A0A] dark:text-white tabular-nums">
                  {currentIndex + 1}/{visibleQuestions.length}
                </span>
                <span>·</span>
                <span>{activeQ.subtopic}</span>
              </div>

              <div className="flex items-center gap-2">
                {activeQ.section === 'Mathematics' && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[#2563EB] text-[#2563EB] text-xs font-medium whitespace-nowrap">
                    <Calculator className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                    <span>No Calculator</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setFlagged((prev) => ({ ...prev, [activeQ.id]: !prev[activeQ.id] }))
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1 border text-xs font-medium transition-colors whitespace-nowrap ${
                    flagged[activeQ.id]
                      ? 'border-[#D97706] text-[#D97706]'
                      : 'border-black/15 dark:border-white/15 text-black/60 dark:text-white/60 hover:border-[#D97706]'
                  }`}
                >
                  <Flag className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                  <span>{flagged[activeQ.id] ? 'Flagged' : 'Flag'}</span>
                </button>
              </div>
            </div>

            <div className="text-[15px] sm:text-base leading-[1.7] text-[#0A0A0A] dark:text-white whitespace-pre-line max-w-[68ch]">
              {activeQ.prompt}
            </div>

            <div className="space-y-2.5">
              {activeQ.options.map((optText, idx) => {
                const letter = OPTION_LETTERS[idx];
                const isSelected = answers[activeQ.id] === idx;
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [activeQ.id]: idx }))
                    }
                    className={`w-full min-h-[50px] px-4 py-3 border text-left flex items-start gap-3.5 transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] dark:bg-white dark:text-[#0A0A0A] dark:border-white'
                        : 'bg-white dark:bg-[#0A0A0A] border-black/15 dark:border-white/15 text-[#0A0A0A] dark:text-white hover:border-[#0A0A0A] dark:hover:border-white hover:-translate-y-0.5'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 border font-mono text-xs font-semibold flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-white/40 dark:border-black/40'
                          : 'border-black/20 dark:border-white/20'
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-sm sm:text-[15px] leading-snug pt-0.5">
                      {optText}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-5 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-4">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => jumpToQuestion(Math.max(0, currentIndex - 1))}
                className="group inline-flex items-center gap-1.5 px-3.5 py-2 border border-black/20 dark:border-white/20 text-xs font-medium hover:border-[#0A0A0A] dark:hover:border-white disabled:opacity-30 transition-colors whitespace-nowrap"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                disabled={currentIndex >= visibleQuestions.length - 1}
                onClick={() =>
                  jumpToQuestion(Math.min(visibleQuestions.length - 1, currentIndex + 1))
                }
                className="group inline-flex items-center gap-1.5 px-3.5 py-2 border border-black/20 dark:border-white/20 text-xs font-medium hover:border-[#0A0A0A] dark:hover:border-white disabled:opacity-30 transition-colors whitespace-nowrap"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          </article>
        )}

        {/* Question Grid */}
        <aside className="lg:col-span-4 bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#0A0A0A] dark:text-white">
            Questions
          </h2>

          <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-4 gap-2">
            {visibleQuestions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isFlagged = Boolean(flagged[q.id]);
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => jumpToQuestion(idx)}
                  className={`relative h-10 border font-mono text-xs tabular-nums flex items-center justify-center transition-colors ${
                    isCurrent
                      ? 'ring-2 ring-[#0A0A0A] dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-[#0A0A0A] '
                      : ''
                  }${
                    isAnswered
                      ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] dark:bg-white dark:text-[#0A0A0A] dark:border-white font-semibold'
                      : 'border-black/15 dark:border-white/15 text-[#0A0A0A] dark:text-white hover:border-[#0A0A0A] dark:hover:border-white'
                  }`}
                >
                  <span>{idx + 1}</span>
                  {isFlagged && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#D97706]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-2 text-xs text-black/60 dark:text-white/60">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#0A0A0A] dark:bg-white inline-block" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 border border-black/25 dark:border-white/25 inline-block" />
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 border border-[#D97706] bg-[#D97706]/20 inline-block" />
              <span>Flagged</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
