import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Loader2,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  Question,
  TutorActionMode,
  TutorLanguage,
  TutorMessage,
} from '../types/nuet';

interface AITutorPanelProps {
  question?: Question | null;
  selectedOptionIndex?: number | null;
  initialAction?: TutorActionMode | null;
  onActionHandled?: () => void;
  onClose?: () => void;
  allQuestions?: Question[];
  onSelectQuestion?: (questionId: string | null) => void;
  standalone?: boolean;
}

const LANGUAGE_OPTIONS: Array<{ id: TutorLanguage; label: string }> = [
  { id: 'en', label: 'EN' },
  { id: 'ru', label: 'RU' },
  { id: 'kk', label: 'KK' },
];

function renderFormattedText(text: string): React.ReactNode {
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        const formatInline = (str: string) => {
          const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
          return parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={idx} className="font-semibold text-[#0A0A0A] dark:text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code
                  key={idx}
                  className="font-mono text-xs px-1 py-0.5 border border-black/15 dark:border-white/15 bg-white dark:bg-[#0A0A0A]"
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return <React.Fragment key={idx}>{part}</React.Fragment>;
          });
        };

        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-2 pl-1">
              <span className="text-black/40 dark:text-white/40">—</span>
              <span>{formatInline(trimmed.slice(2))}</span>
            </div>
          );
        }

        return <p key={i}>{formatInline(trimmed)}</p>;
      })}
    </div>
  );
}

export function AITutorPanel({
  question = null,
  selectedOptionIndex = null,
  initialAction = null,
  onActionHandled,
  onClose,
  allQuestions,
  onSelectQuestion,
  standalone = false,
}: AITutorPanelProps) {
  const [language, setLanguage] = useState<TutorLanguage>('en');
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [question?.id]);

  const sendTutorRequest = async (mode: TutorActionMode, customMessage?: string) => {
    if (isLoading) return;

    const actionLabels: Record<TutorActionMode, string> = {
      hint: 'Socratic Hint',
      wrong_options: 'Wrong Options',
      explain_mistake: 'Explain Mistake',
      chat: customMessage || 'Question',
    };

    const userDisplayText = mode === 'chat' ? customMessage || '' : actionLabels[mode];
    if (!userDisplayText.trim()) return;

    const userMsg: TutorMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: userDisplayText,
      actionLabel: mode !== 'chat' ? actionLabels[mode] : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setError(null);
    setIsLoading(true);
    if (mode === 'chat') {
      setInput('');
    }

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          question: question
            ? {
                id: question.id,
                section: question.section,
                subtopic: question.subtopic,
                prompt: question.prompt,
                options: question.options,
                correctIndex: question.correctIndex,
                explanation: question.explanation,
              }
            : undefined,
          selectedOptionIndex,
          language,
          userMessage: customMessage,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'Unable to reach AI Tutor.');
      }

      const assistantMsg: TutorMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: data.reply,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error calling AI Tutor.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialAction) {
      void sendTutorRequest(initialAction);
      onActionHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    void sendTutorRequest('chat', trimmed);
  };

  const hasWrongAnswer =
    question &&
    typeof selectedOptionIndex === 'number' &&
    selectedOptionIndex !== question.correctIndex;

  return (
    <section
      aria-label="AI Tutor"
      className="bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 border-t-2 border-t-[#2563EB] flex flex-col"
    >
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-black/15 dark:border-white/15 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-semibold text-[#0A0A0A] dark:text-white">
            AI Tutor
          </h3>
          {question && (
            <span className="text-xs text-black/50 dark:text-white/50">
              {question.subtopic}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center border border-black/15 dark:border-white/15 divide-x divide-black/15 dark:divide-white/15"
            role="group"
            aria-label="Term explanation language"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setLanguage(opt.id)}
                className={`px-2 py-1 text-[11px] font-medium transition-colors duration-200 ${
                  language === opt.id
                    ? 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]'
                    : 'text-black/60 dark:text-white/60 hover:text-[#0A0A0A] dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setError(null);
              }}
              className="p-1.5 border border-black/15 dark:border-white/15 text-black/60 dark:text-white/60 hover:border-[#0A0A0A] dark:hover:border-white hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
              aria-label="Clear"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 border border-black/15 dark:border-white/15 text-black/60 dark:text-white/60 hover:border-[#0A0A0A] dark:hover:border-white hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* Standalone Question Picker */}
      {standalone && allQuestions && onSelectQuestion && (
        <div className="px-5 py-3 border-b border-black/15 dark:border-white/15 bg-[#F8F8F8] dark:bg-[#111111]">
          <select
            aria-label="Select question"
            value={question?.id ?? ''}
            onChange={(e) => onSelectQuestion(e.target.value || null)}
            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 text-[#0A0A0A] dark:text-white rounded-none focus:outline-none focus:border-[#2563EB]"
          >
            <option value="">General NUET Help</option>
            {allQuestions.map((q, idx) => (
              <option key={q.id} value={q.id}>
                {idx + 1}. {q.subtopic} — {q.prompt.slice(0, 60)}...
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Action Buttons */}
      {question && (
        <div className="px-5 py-3 border-b border-black/15 dark:border-white/15 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => void sendTutorRequest('hint')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-black/20 dark:border-white/20 text-xs font-medium text-[#0A0A0A] dark:text-white hover:border-[#2563EB] hover:text-[#2563EB] dark:hover:border-[#2563EB] dark:hover:text-[#60A5FA] transition-colors duration-200 disabled:opacity-40 whitespace-nowrap"
          >
            <Lightbulb className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Socratic Hint</span>
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={() => void sendTutorRequest('wrong_options')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-black/20 dark:border-white/20 text-xs font-medium text-[#0A0A0A] dark:text-white hover:border-[#0A0A0A] dark:hover:border-white transition-colors duration-200 disabled:opacity-40 whitespace-nowrap"
          >
            <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Wrong Options</span>
          </button>

          {hasWrongAnswer && (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => void sendTutorRequest('explain_mistake')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E11D48] text-xs font-medium text-[#E11D48] hover:bg-[#E11D48] hover:text-white transition-colors duration-200 disabled:opacity-40 whitespace-nowrap"
            >
              <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Explain Mistake</span>
            </button>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
        {messages.length === 0 && !isLoading && !error && (
          <p className="py-6 text-center text-xs text-black/50 dark:text-white/50">
            {language === 'en'
              ? 'Choose a prompt above or ask a question.'
              : language === 'ru'
                ? 'Terms explained in Russian.'
                : 'Terms explained in Kazakh.'}
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] px-4 py-3 border ${
                msg.role === 'user'
                  ? 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] border-[#0A0A0A] dark:border-white text-xs font-medium'
                  : 'bg-[#F8F8F8] dark:bg-[#141414] border-black/15 dark:border-white/15 text-black/85 dark:text-white/85'
              }`}
            >
              {msg.role === 'user' ? <p>{msg.text}</p> : renderFormattedText(msg.text)}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-black/55 dark:text-white/55 py-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
            <span>Thinking...</span>
          </div>
        )}

        {error && (
          <div className="p-3 border border-[#E11D48] text-[#E11D48] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-black/15 dark:border-white/15 bg-[#F8F8F8] dark:bg-[#111111] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 min-w-0 px-3 py-2 text-xs bg-white dark:bg-[#0A0A0A] border border-black/15 dark:border-white/15 text-[#0A0A0A] dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 rounded-none focus:outline-none focus:border-[#0A0A0A] dark:focus:border-white"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="group inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#0A0A0A] dark:border-white bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:bg-white hover:text-[#0A0A0A] dark:hover:bg-[#0A0A0A] dark:hover:text-white text-xs font-medium disabled:opacity-35 transition-colors duration-200 whitespace-nowrap shrink-0"
        >
          <span>Send</span>
          <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </form>
    </section>
  );
}
