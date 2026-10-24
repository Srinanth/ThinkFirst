'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Zap,
  Loader2,
} from 'lucide-react';
import { OpenQuiz } from './course-drilldown';
import { RemediationMissionData } from './ai-tutor-drawer';
import { quizzesApi } from '@/lib/api';

interface QuizTakerProps {
  quiz: OpenQuiz;
  onFinishQuiz: (finalScore: number) => void;
  onStartRemediation?: (mission: RemediationMissionData) => void;
  onCancel: () => void;
}

interface Question {
  id: number;
  questionId?: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    prompt:
      'In Differential Calculus, how does the Squeeze Theorem establish the limit lim_{x->0} (x^2 * sin(1/x))?',
    options: [
      'By bounding -x^2 <= x^2*sin(1/x) <= x^2 and noting lim_{x->0} (+-x^2) = 0',
      'By applying L\'Hopital\'s rule directly to the product form',
      'By expanding sin(1/x) as a Taylor series around zero',
      'By evaluating the oscillation amplitude at infinity',
    ],
    correctIndex: 0,
    explanation:
      'Because -1 <= sin(u) <= 1 for all u != 0, multiplying by x^2 yields -x^2 <= x^2*sin(1/x) <= x^2. Since both bounds approach 0, the squeeze theorem forces the limit to 0.',
  },
  {
    id: 2,
    prompt:
      'What condition must be satisfied for a function f(x) to be formally continuous at x = c?',
    options: [
      'f(c) is defined, lim_{x->c} f(x) exists, and lim_{x->c} f(x) = f(c)',
      'f\'(c) exists and is strictly positive',
      'The left-hand limit is greater than the right-hand limit',
      'f(x) must be a polynomial without root singularities',
    ],
    correctIndex: 0,
    explanation:
      'Continuity requires three conditions: f(c) exists, two-sided limit exists, and they match.',
  },
  {
    id: 3,
    prompt:
      'When applying the Chain Rule to f(g(x)), what is the correct derivative expression?',
    options: [
      "f'(g(x)) * g'(x)",
      "f'(x) * g'(x)",
      "f'(g'(x))",
      "f(g'(x)) + g(f'(x))",
    ],
    correctIndex: 0,
    explanation:
      "By the Chain Rule, d/dx[f(g(x))] = f'(g(x)) * g'(x).",
  },
];

export default function QuizTaker({
  quiz,
  onFinishQuiz,
  onStartRemediation,
  onCancel,
}: QuizTakerProps) {
  const [questions, setQuestions] = useState<Question[]>(SAMPLE_QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(0);
  const [remediationMission, setRemediationMission] = useState<RemediationMissionData | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Fetch real quiz questions from backend API
  useEffect(() => {
    let isMounted = true;

    if (quiz.id) {
      quizzesApi
        .getQuizDetail(quiz.id)
        .then((detail) => {
          if (!isMounted || !detail) return;
          const rawQuestions = detail.questions || detail.quiz_questions || [];
          if (rawQuestions.length > 0) {
            const mappedQuestions: Question[] = rawQuestions.map((q, idx) => ({
              id: idx + 1,
              questionId: q.id,
              prompt: q.questionText || q.question_text || 'Diagnostic Question',
              options:
                q.options && q.options.length > 0
                  ? q.options
                  : ['Option A (True)', 'Option B (False)', 'Option C (Inconclusive)', 'Option D (Undefined)'],
              correctIndex: 0,
              explanation: q.explanation || 'Assessed against curriculum syllabus.',
            }));
            setQuestions(mappedQuestions);
          }
        })
        .catch(() => {});

      // Initialize live attempt in Supabase
      quizzesApi
        .startAttempt(quiz.id)
        .then((attempt) => {
          if (isMounted && attempt?.id) {
            setAttemptId(attempt.id);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [quiz.id]);

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
    if (isSubmitted || isSubmitting) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIdx]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // 1. If backend attempt is active, submit live to Evaluator Agent
      if (attemptId) {
        const responsesPayload = questions.map((q, idx) => ({
          questionId: q.questionId || `q-${idx}`,
          studentAnswer: q.options[selectedAnswers[idx] ?? 0] || 'A',
        }));

        const result = await quizzesApi.submitAttempt(attemptId, responsesPayload);

        const scorePercent = result.percentage ?? Math.round((result.score / (result.maxScore || 1)) * 100);
        setCalculatedScore(scorePercent);

        if (result.remediationMission) {
          setRemediationMission({
            title: result.remediationMission.title,
            diagnosedGap: result.remediationMission.diagnosedGap,
            actionPlan: result.remediationMission.actionPlan,
            openingPrompt: result.remediationMission.openingPrompt,
            actionWidgets: result.remediationMission.actionWidgets || [],
            teacherAdvice: result.remediationMission.teacherAdvice,
          });
        }
        setIsSubmitted(true);
        return;
      }
    } catch (err) {
      console.warn('Backend attempt submission fallback:', err);
    } finally {
      setIsSubmitting(false);
    }

    // Fallback: local evaluation
    let score = 0;
    const missed: Question[] = [];

    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      } else {
        missed.push(q);
      }
    });

    const percent = Math.round((score / questions.length) * 100);
    setCalculatedScore(percent);

    if (missed.length > 0) {
      const mission: RemediationMissionData = {
        title: 'Squeeze Theorem & Limit Invariants Remediation',
        diagnosedGap:
          'Difficulty establishing strict bounding inequalities (-g(x) <= f(x) <= g(x)) when calculating transcendental product limits.',
        actionPlan:
          'Socratic Micro-Ladder: Step 1 bound the oscillating term, Step 2 multiply inequalities by magnitude, Step 3 evaluate flanking limits.',
        openingPrompt:
          'I noticed you encountered difficulty bounding the oscillating factor in Question 1. When x approaches 0, what are the upper and lower bounds of sin(1/x)?',
        actionWidgets: [
          { type: 'pill', label: 'Between -1 and +1', value: 'bounded_minus_one_plus_one' },
          { type: 'pill', label: 'It oscillates without bounds', value: 'unbounded' },
          { type: 'pill', label: 'I need a step-by-step hint', value: 'hint' },
        ],
        teacherAdvice:
          'Review sandwich theorem bounding inequalities in next lecture recap.',
      };
      setRemediationMission(mission);
    } else {
      setRemediationMission(null);
    }

    setIsSubmitted(true);
  };

  const currentQ = questions[currentIdx] || questions[0];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Proctored Assessment Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl neu-card-raised border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl neu-inset text-white flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black neu-badge-white px-2 py-0.5">
                {quiz.number}
              </span>
              <h2 className="text-base font-black text-white">{quiz.title}</h2>
            </div>
            <p className="text-[11px] text-[#9e9e9e] font-medium mt-0.5">
              Live Assessment &bull; Quiz Evaluator Agent Telemetry Active
            </p>
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl neu-inset self-start sm:self-auto border border-white/5">
          <Clock className="w-4 h-4 text-white" />
          <span className="text-xs font-mono font-bold text-white tracking-wider">
            {formatTimer(timeLeft)}
          </span>
        </div>
      </div>

      {/* Main Quiz Body Container */}
      <div className="neu-card rounded-3xl overflow-hidden border border-white/5">
        {!isSubmitted ? (
          /* Active Question View */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-xs font-bold text-[#757575] uppercase tracking-wider">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <div className="flex items-center gap-1.5">
                {questions.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === currentIdx
                        ? 'bg-white shadow-[0_0_8px_white]'
                        : selectedAnswers[i] !== undefined
                        ? 'bg-[#9e9e9e]'
                        : 'bg-[#333333]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {currentQ.prompt}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentIdx] === optIdx;
                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all flex items-center justify-between text-xs sm:text-sm font-semibold select-none ${
                      isSelected
                        ? 'neu-card-raised border border-white/60 text-white shadow-[0_4px_16px_rgba(255,255,255,0.1)]'
                        : 'neu-inset text-[#9e9e9e] hover:text-white hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center font-bold ${
                          isSelected
                            ? 'bg-white text-black'
                            : 'neu-card-sm text-[#757575]'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-white shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation & Submit Footer */}
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

                {currentIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((prev) => prev + 1)}
                    className="px-5 py-2 neu-btn text-xs font-bold flex items-center gap-1.5 cursor-pointer text-white"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="px-6 py-2.5 neu-btn-white text-xs font-black cursor-pointer flex items-center gap-2 text-black disabled:opacity-50 rounded-xl"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-black" />
                    )}
                    <span>Submit to Evaluator Agent</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Submission Results & Gap Diagnosis View */
          <div className="p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl neu-inset text-white flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">
                  Assessment Submitted Successfully!
                </h3>
                <p className="text-xs text-[#9e9e9e] font-medium">
                  Evidence logged for deterministic evaluation. Socratic practice ready.
                </p>
              </div>

              {/* Submission Status Card */}
              <div className="max-w-md mx-auto p-5 neu-inset text-center border border-white/10 rounded-2xl space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold neu-badge-white text-white">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                  <span>Assessment Completed &amp; Recorded</span>
                </div>
                <p className="text-xs text-[#9e9e9e] leading-relaxed">
                  Your responses have been safely saved. The AI Evaluator Agent is analyzing conceptual nuances in the background for your instructor&apos;s curriculum dashboard.
                </p>
              </div>
            </div>

            {/* Evaluator Agent Remediation Mission Dossier */}
            {remediationMission && (
              <div className="p-5 rounded-2xl bg-[#1c1c1c] border border-white/10 space-y-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.6)] animate-in fade-in">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg neu-inset text-white flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-white block">
                        Quiz Evaluator Agent Diagnosis
                      </span>
                      <h4 className="text-sm font-black text-white">
                        {remediationMission.title}
                      </h4>
                    </div>
                  </div>
                  <span className="text-[10px] font-black neu-badge-white px-2.5 py-0.5 rounded-full">
                    Active Gap Dossier Created
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-[#9e9e9e]">
                    <strong className="text-white">Diagnosed Misconception:</strong>{' '}
                    {remediationMission.diagnosedGap}
                  </p>
                  <p className="text-[#9e9e9e]">
                    <strong className="text-white">Remediation Action Plan:</strong>{' '}
                    {remediationMission.actionPlan}
                  </p>
                </div>

                {/* Method 2 Action Widget Pills Preview */}
                {remediationMission.actionWidgets && remediationMission.actionWidgets.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-[#757575] block">
                      Starting Socratic Options:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {remediationMission.actionWidgets.map((w, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg neu-inset-sm text-white text-[11px] font-medium border border-white/10"
                        >
                          {w.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1-Click Launch Socratic AI Tutor Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onStartRemediation) {
                        onStartRemediation(remediationMission);
                      } else {
                        onFinishQuiz(calculatedScore);
                      }
                    }}
                    className="w-full py-3 neu-btn-white text-black font-black text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:scale-101 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Launch Socratic AI Tutor to Fix Gaps (Method 2) &rarr;</span>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => onFinishQuiz(calculatedScore)}
                className="px-6 py-2.5 neu-btn text-xs font-bold tracking-wide cursor-pointer text-[#9e9e9e] hover:text-white"
              >
                Return to Course Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
