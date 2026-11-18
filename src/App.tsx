import React, { useEffect, useMemo, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { MockExam } from './components/MockExam';
import { PracticeMode } from './components/PracticeMode';
import { Sidebar } from './components/Sidebar';
import { QUESTION_BANK } from './data/questionBank';
import {
  ExamHistoryEntry,
  ExamModeType,
  NavigationTab,
  Section,
  Subtopic,
  UserProgress,
} from './types/nuet';
import {
  computePredictedScore,
  getDefaultProgress,
  loadProgress,
  recordExamCompletion,
  recordPracticeAttempt,
  saveProgress,
} from './utils/storage';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  const [practiceInitialSection, setPracticeInitialSection] = useState<'All' | Section>('All');
  const [practiceInitialSubtopic, setPracticeInitialSubtopic] = useState<'All' | Subtopic>('All');
  const [autoStartMockMode, setAutoStartMockMode] = useState<ExamModeType | null>(null);
  const [reviewExamEntry, setReviewExamEntry] = useState<ExamHistoryEntry | null>(null);
  const [mockSessionKey, setMockSessionKey] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (progress.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    saveProgress(progress);
  }, [progress]);

  const scoreSummary = useMemo(
    () => computePredictedScore(progress, QUESTION_BANK),
    [progress]
  );

  const handleToggleTheme = () => {
    setProgress((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const handleRecordPracticeAttempt = (
    questionId: string,
    selectedIndex: number,
    isCorrect: boolean
  ) => {
    setProgress((prev) =>
      recordPracticeAttempt(prev, {
        questionId,
        selectedIndex,
        isCorrect,
        answeredAt: new Date().toISOString(),
      })
    );
  };

  const handleCompleteExam = (entry: ExamHistoryEntry) => {
    setProgress((prev) => recordExamCompletion(prev, entry));
  };

  const handleResetProgress = () => {
    const fresh = {
      ...getDefaultProgress(),
      theme: progress.theme,
    };
    setProgress(fresh);
    saveProgress(fresh);
  };

  const handlePracticeSubtopic = (section: Section, subtopic: Subtopic) => {
    setPracticeInitialSection(section);
    setPracticeInitialSubtopic(subtopic);
    setActiveTab(section === 'Mathematics' ? 'math' : 'ct');
  };

  const handleSelectSidebarTab = (tab: NavigationTab) => {
    if (tab === 'math') {
      setPracticeInitialSection('Mathematics');
      setPracticeInitialSubtopic('All');
      setActiveTab('math');
      return;
    }
    if (tab === 'ct') {
      setPracticeInitialSection('Critical Thinking & Problem Solving');
      setPracticeInitialSubtopic('All');
      setActiveTab('ct');
      return;
    }
    if (tab === 'sprint') {
      setReviewExamEntry(null);
      setAutoStartMockMode('sprint');
      setMockSessionKey((k) => k + 1);
      setActiveTab('sprint');
      return;
    }
    if (tab === 'mock') {
      setReviewExamEntry(null);
      setAutoStartMockMode(null);
      setMockSessionKey((k) => k + 1);
      setActiveTab('mock');
      return;
    }
    setActiveTab(tab);
  };

  const handleStartSprint = () => {
    setReviewExamEntry(null);
    setAutoStartMockMode('sprint');
    setMockSessionKey((k) => k + 1);
    setActiveTab('sprint');
  };

  const handleStartFullMock = () => {
    setReviewExamEntry(null);
    setAutoStartMockMode('full');
    setMockSessionKey((k) => k + 1);
    setActiveTab('mock');
  };

  const handleReviewExam = (entry: ExamHistoryEntry) => {
    setAutoStartMockMode(null);
    setReviewExamEntry(entry);
    setMockSessionKey((k) => k + 1);
    setActiveTab('mock');
  };

  const isPracticeView = activeTab === 'math' || activeTab === 'ct';
  const isMockView = activeTab === 'mock' || activeTab === 'sprint';

  return (
    <div className="min-h-screen bg-[#F8F8F8] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white flex flex-col lg:flex-row">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleSelectSidebarTab}
        predictedScore={scoreSummary.predictedTotalScore}
        hasScoreData={scoreSummary.hasAnyData}
        theme={progress.theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="flex-1 min-w-0 px-4 sm:px-8 lg:px-12 py-8 sm:py-10">
        <div className="max-w-[1100px] mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              progress={progress}
              questions={QUESTION_BANK}
              onStartSprint={handleStartSprint}
              onStartFullMock={handleStartFullMock}
              onPracticeSubtopic={handlePracticeSubtopic}
              onReviewExam={handleReviewExam}
              onResetProgress={handleResetProgress}
            />
          )}

          {isPracticeView && (
            <PracticeMode
              questions={QUESTION_BANK}
              attempts={progress.attempts}
              initialSection={practiceInitialSection}
              initialSubtopic={practiceInitialSubtopic}
              onRecordAttempt={handleRecordPracticeAttempt}
            />
          )}

          {isMockView && (
            <MockExam
              key={mockSessionKey}
              questions={QUESTION_BANK}
              progress={progress}
              autoStartMode={autoStartMockMode}
              onConsumeAutoStart={() => setAutoStartMockMode(null)}
              initialReviewEntry={reviewExamEntry}
              onConsumeReviewEntry={() => setReviewExamEntry(null)}
              onCompleteExam={handleCompleteExam}
              onGoToPractice={() => handleSelectSidebarTab('math')}
            />
          )}
        </div>
      </main>
    </div>
  );
}
