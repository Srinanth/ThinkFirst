'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { OpenQuiz } from './course-drilldown';

interface QuizTakerProps {
  quiz: OpenQuiz;
  onFinishQuiz: (finalScore: number) => void;
  onCancel: () => void;
}

interface Question {
  id: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    prompt:
      'In an AVL Tree, if an insertion causes node X to have a balance factor of +2 and its left child has a balance factor of -1, which rotation sequence must be performed to restore balance?',
    options: [
      'Single Left Rotation (LL)',
      'Single Right Rotation (RR)',
      'Double Left-Right Rotation (LR)',
      'Double Right-Left Rotation (RL)',
    ],
    correctIndex: 2,
    explanation:
      'A Left-Right (LR) rotation is triggered when a node is left-heavy (+2) but its left child is right-heavy (-1).',
  },
  {
    id: 2,
    prompt:
      'What is the maximum permissible absolute balance factor |height(left) - height(right)| for every node in a valid AVL Tree?',
    options: ['0 only', '1', '2', 'log₂(n)'],
    correctIndex: 1,
    explanation:
      'By definition, in an AVL tree the balance factor must satisfy |BF| ≤ 1 (i.e. -1, 0, or +1).',
  },
  {
    id: 3,
    prompt:
      'What is the strict worst-case time complexity for lookup, insertion, and deletion operations in an AVL tree with n nodes?',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(√n)'],
    correctIndex: 1,
    explanation:
      'Because the tree is strictly height-balanced with height h ≤ 1.44 log₂(n), all basic operations take O(log n).',
  },
];

export default function QuizTaker({
  quiz,
  onFinishQuiz,
  onCancel,
}: QuizTakerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIndex,
    }));
  };

  const handleSubmit = () => {
    let score = 0;
    SAMPLE_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });

    const percent = Math.round((score / SAMPLE_QUESTIONS.length) * 100);
    setCalculatedScore(percent);
    setIsSubmitted(true);
  };

  const currentQ = SAMPLE_QUESTIONS[currentIdx];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 text-slate-800">
      {/* 1. Proctored Anti-Cheat Header Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide uppercase text-slate-900">
                PROCTORED ASSESSMENT ACTIVE
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                AI Tutor Disabled
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Anti-Cheat Policy: Socratic AI Tutor &amp; external assistants are strictly locked during this test.
            </p>
          </div>
        </div>

        {/* Live Timer */}
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 shadow-2xs self-start sm:self-auto shrink-0">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time Left:</span>
          <span className="text-sm font-black text-blue-700 font-mono">
            {formatTimer(timeLeft)}
          </span>
        </div>
      </div>

      {/* 2. Assessment Body Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
        {/* Assessment Title Header */}
        <div className="p-6 bg-slate-50 text-slate-900 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {quiz.number}
              </span>
              <span className="text-xs text-slate-500 font-medium">CS-204: Data Structures &amp; Algorithms</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {quiz.title}
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium block">Questions</span>
            <span className="text-lg font-black text-blue-600">
              {currentIdx + 1} of {SAMPLE_QUESTIONS.length}
            </span>
          </div>
        </div>

        {!isSubmitted ? (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Question Prompt */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Question {currentIdx + 1}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {currentQ.prompt}
              </h3>
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentIdx] === optIdx;
                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-4 rounded-2xl border text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 text-slate-900 shadow-xs ring-1 ring-blue-500/20'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-blue-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stepper Navigation & Submit Footer */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Exit Assessment
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Previous
                </button>

                {currentIdx < SAMPLE_QUESTIONS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-black text-white shadow-sm transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Submit Assessment</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Submission Results View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm border border-blue-100">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900">
                Assessment Completed &amp; Evaluated!
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Your deterministic score has been saved to your student record.
              </p>
            </div>

            <div className="max-w-xs mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-2xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Alex&apos;s Score</p>
              <p className="text-4xl font-black text-blue-600 mt-1">{calculatedScore}%</p>
              <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Mastery Confirmed
              </span>
            </div>

            <div className="text-xs text-slate-500">
              AI Tutor is now re-enabled for post-quiz review and concept reinforcement.
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => onFinishQuiz(calculatedScore)}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-sm transition-all cursor-pointer"
              >
                Return to CS-204 Course Page &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
