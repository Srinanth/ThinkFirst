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
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 text-white">
      {/* 1. Proctored Anti-Cheat Header Banner */}
      <div className="neu-card-raised p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl neu-inset text-white flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wide uppercase text-white">
                PROCTORED ASSESSMENT ACTIVE
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-500/30 uppercase">
                AI Tutor Disabled
              </span>
            </div>
            <p className="text-xs text-[#9e9e9e] font-medium mt-0.5">
              Anti-Cheat Policy: Socratic AI Tutor &amp; external assistants are strictly locked during this test.
            </p>
          </div>
        </div>

        {/* Live Timer */}
        <div className="flex items-center gap-2 neu-inset px-4 py-2 self-start sm:self-auto shrink-0">
          <Clock className="w-4 h-4 text-white" />
          <span className="text-xs font-bold text-[#757575] uppercase tracking-wider">Time Left:</span>
          <span className="text-sm font-black text-white font-mono">
            {formatTimer(timeLeft)}
          </span>
        </div>
      </div>

      {/* 2. Assessment Body Container */}
      <div className="neu-card-raised overflow-hidden">
        {/* Assessment Title Header */}
        <div className="p-6 bg-[#232323] border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold neu-card-sm text-white">
                {quiz.number}
              </span>
              <span className="text-xs text-[#9e9e9e] font-medium">CS-204: Data Structures &amp; Algorithms</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {quiz.title}
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#757575] font-medium block">Questions</span>
            <span className="text-lg font-black text-white">
              {currentIdx + 1} of {SAMPLE_QUESTIONS.length}
            </span>
          </div>
        </div>

        {!isSubmitted ? (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Question Prompt */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#757575]">
                Question {currentIdx + 1}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {currentQ.prompt}
              </h3>
            </div>

            {/* Multiple Choice Options (Neumorphic Inset / Raised States) */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentIdx] === optIdx;
                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-4 rounded-2xl text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'neu-card border border-cyan-500/50 shadow-[0_0_20px_rgba(0,210,255,0.18)] text-white ring-1 ring-cyan-500/30'
                        : 'neu-inset text-[#9e9e9e] hover:text-white hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                          isSelected
                            ? 'bg-[#00d2ff] text-[#0a0f1d] shadow-[0_0_10px_rgba(0,210,255,0.4)]'
                            : 'neu-card-sm text-[#757575]'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-[#00d2ff] shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stepper Navigation & Submit Footer */}
            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-bold text-[#757575] hover:text-white cursor-pointer"
              >
                Exit Assessment
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => prev - 1)}
                  className="px-4 py-2 neu-btn disabled:opacity-40 text-xs font-bold text-[#9e9e9e] hover:text-white cursor-pointer"
                >
                  Previous
                </button>

                {currentIdx < SAMPLE_QUESTIONS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    className="px-5 py-2 neu-btn-white text-xs font-bold flex items-center gap-1.5 cursor-pointer text-black"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2.5 neu-btn-accent text-xs font-black cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-[#0a0f1d]" />
                    <span>Submit Assessment</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Submission Results View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl neu-inset text-white flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">
                Assessment Completed &amp; Evaluated!
              </h3>
              <p className="text-sm text-[#9e9e9e] font-medium">
                Your deterministic score has been saved to your student record.
              </p>
            </div>

            <div className="max-w-xs mx-auto p-5 neu-inset text-center border border-white/10">
              <p className="text-xs font-bold uppercase tracking-wider text-[#757575]">Alex&apos;s Score</p>
              <p className="text-4xl font-black text-white mt-1">{calculatedScore}%</p>
              <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold neu-badge-cyan">
                Mastery Confirmed
              </span>
            </div>

            <div className="text-xs text-[#9e9e9e]">
              AI Tutor is now re-enabled for post-quiz review and concept reinforcement.
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => onFinishQuiz(calculatedScore)}
                className="px-6 py-3 neu-btn-white text-xs font-bold tracking-wide cursor-pointer text-black"
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
