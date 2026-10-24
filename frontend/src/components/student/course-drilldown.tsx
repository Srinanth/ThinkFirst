'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Download,
  Bell,
  Award,
  ChevronRight,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { CourseItem } from './student-dashboard';
import { quizzesApi, masteryApi } from '@/lib/api';

export interface CompletedQuiz {
  id: string;
  number: string;
  title: string;
  date: string;
  duration: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface OpenQuiz {
  id: string;
  number: string;
  title: string;
  dueDate: string;
  isDueToday?: boolean;
  timeLimit: string;
  questionCount: number;
  topics: string[];
}

export interface UpcomingQuiz {
  id: string;
  number: string;
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  topics: string[];
}

interface CourseDrilldownProps {
  course: CourseItem;
  onBack: () => void;
  onStartQuiz: (quiz: OpenQuiz) => void;
  onReviewQuiz: (quiz: CompletedQuiz) => void;
}

export default function CourseDrilldown({
  course,
  onBack,
  onStartQuiz,
  onReviewQuiz,
}: CourseDrilldownProps) {
  const [openQuizzes, setOpenQuizzes] = useState<OpenQuiz[]>([]);
  const [completedQuizzes, setCompletedQuizzes] = useState<CompletedQuiz[]>([]);
  const [masteryData, setMasteryData] = useState<{
    overallMastery: number;
    topics: Array<{ title: string; masteryScore: number; tier: string }>;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (course.id) {
      quizzesApi
        .listQuizzes(course.id)
        .then((quizzes) => {
          if (isMounted) {
            if (quizzes && quizzes.length > 0) {
              const open: OpenQuiz[] = [];
              const completed: CompletedQuiz[] = [];

              quizzes.forEach((q, idx) => {
                const userAttempt = (q as any).userAttempt;
                const isCompleted =
                  userAttempt &&
                  (userAttempt.status === 'submitted' || userAttempt.status === 'graded');

                if (isCompleted) {
                  completed.push({
                    id: q.id,
                    number: `Quiz ${idx + 1}`,
                    title: q.title,
                    date: userAttempt.submitted_at
                      ? new Date(userAttempt.submitted_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Completed',
                    duration: `${q.exam_duration || 20} mins`,
                    score: Number(userAttempt.score) || 0,
                    maxScore: Number(userAttempt.max_score) || 1,
                    percentage: 0,
                  });
                } else {
                  open.push({
                    id: q.id,
                    number: `Quiz ${idx + 1}`,
                    title: q.title,
                    dueDate: 'Active Assessment',
                    isDueToday: true,
                    timeLimit: `${q.exam_duration || 20} mins`,
                    questionCount: q.question_count || 3,
                    topics: q.curriculum_topics ? [q.curriculum_topics.title] : ['Course Material'],
                  });
                }
              });

              setOpenQuizzes(open);
              setCompletedQuizzes(completed);
            } else {
              setOpenQuizzes([]);
              setCompletedQuizzes([]);
            }
          }
        })
        .catch(() => {
          if (isMounted) {
            setOpenQuizzes([]);
            setCompletedQuizzes([]);
          }
        });

      masteryApi
        .getStudentMastery(course.id)
        .then((data) => {
          if (isMounted && data) {
            setMasteryData(data);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [course.id]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-white">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-white neu-btn px-3.5 py-2 transition-all cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-1 transition-transform" />
          <span>Back to Performance Overview</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-[#757575]">
          <span>Home</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Courses</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-white">{course.code}</span>
        </div>
      </div>

      {/* Course Detail Banner Card */}
      <div className="neu-card-raised p-6 sm:p-7 relative overflow-hidden text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold neu-inset-sm text-white font-mono">
                {course.code}
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold neu-badge-white">
                Fall Semester 2026
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold neu-inset-sm text-[#9e9e9e]">
                {course.credits} Credits &bull; {course.location}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#9e9e9e] font-medium">
              Instructor: <strong className="text-white">{course.instructor}</strong> &bull; Office Hours: Mon, Wed 02:00 PM
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl neu-inset text-center min-w-[140px]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#757575]">Course Status</p>
              <p className="text-sm font-black text-white flex items-center justify-center gap-1.5 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
                Enrolled
              </p>
              <p className="text-[10px] font-bold text-[#9e9e9e]">Curriculum Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Drilldown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Attended Quizzes with Scores List */}
        <div className="lg:col-span-7 neu-card p-5 sm:p-6 space-y-4 text-white">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Attended Quizzes &amp; Mastery History
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold neu-badge-white">
                  {completedQuizzes.length} Completed
                </span>
              </div>
              <p className="text-xs text-[#9e9e9e] font-medium mt-0.5">
                Evaluated assessments and solution analysis
              </p>
            </div>
          </div>

          {/* Scrollable List Items */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {completedQuizzes.length === 0 ? (
              <div className="p-8 text-center neu-inset rounded-2xl text-xs text-[#9e9e9e] space-y-1.5 border border-white/5">
                <p className="font-bold text-white text-sm">No Completed Assessments</p>
                <p>You haven&apos;t taken any quizzes for this subject yet.</p>
              </div>
            ) : (
              completedQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="p-4 rounded-xl neu-inset hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold neu-card-sm text-white">
                        {quiz.number}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-white/80 transition-colors">
                        {quiz.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#757575] font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-white" />
                        {quiz.date}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#757575]" />
                        Time Taken: {quiz.duration}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold neu-badge-white">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                        Completed &amp; Evaluated
                      </span>
                    </div>

                    <button
                      onClick={() => onReviewQuiz(quiz)}
                      className="px-3 py-1.5 neu-btn text-xs font-bold text-white hover:text-white/80 cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-[#757575] font-medium">
              Showing recent completed quizzes in {course.code}
            </span>
            <span className="text-white font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              Deterministic Mastery Engine Active
            </span>
          </div>
        </div>

        {/* Right Section: Quizzes to Attempt + Upcoming Quizzes */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quizzes to Attempt */}
          <div className="neu-card p-5 sm:p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-white" />
                <h3 className="text-base font-black text-white tracking-tight">
                  Quizzes to Attempt
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black neu-badge-white">
                {openQuizzes.length} Action Needed
              </span>
            </div>

            <div className="space-y-3.5">
              {openQuizzes.length === 0 ? (
                <div className="p-8 text-center neu-inset rounded-2xl text-xs text-[#9e9e9e] space-y-1.5 border border-white/5">
                  <p className="font-bold text-white text-sm">No Quizzes Scheduled</p>
                  <p>There are no pending quizzes to attempt for this course.</p>
                </div>
              ) : (
                openQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="p-4 sm:p-5 rounded-2xl neu-card-sm border border-white/10 space-y-3 hover:border-white/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold neu-inset-sm text-white font-mono">
                            {quiz.number}
                          </span>
                          {quiz.isDueToday && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold neu-badge-white animate-pulse">
                              Due Today
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-black text-white">
                          {quiz.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#9e9e9e] font-medium flex-wrap">
                      <span className="flex items-center gap-1 text-white font-bold">
                        <Clock className="w-3 h-3 text-white" />
                        {quiz.dueDate}
                      </span>
                      <span>&bull;</span>
                      <span>Limit: {quiz.timeLimit}</span>
                      <span>&bull;</span>
                      <span>{quiz.questionCount} Questions</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1 flex-wrap">
                        {quiz.topics.map((t) => (
                          <span key={t} className="text-[10px] text-[#757575] font-semibold neu-inset-sm px-2 py-0.5">
                            {t}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => onStartQuiz(quiz)}
                        className="neu-btn-white px-4 py-2 text-xs font-black tracking-wide text-black flex items-center gap-1.5 cursor-pointer shadow-md rounded-xl"
                      >
                        <span>Start Assessment</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Quizzes */}
          <div className="neu-card p-5 sm:p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-base font-black text-white tracking-tight">
                Upcoming Quizzes
              </h3>
              <span className="text-xs font-bold text-[#757575]">
                Calendar Sync
              </span>
            </div>

            <div className="space-y-3">
              {openQuizzes.length === 0 ? (
                <div className="p-4 text-center neu-inset rounded-xl text-xs text-[#9e9e9e]">
                  No upcoming quizzes on calendar
                </div>
              ) : (
                openQuizzes.slice(0, 3).map((quiz) => (
                  <div key={quiz.id} className="p-3.5 rounded-xl neu-inset flex items-center justify-between gap-3 text-white">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold neu-card-sm px-1.5 py-0.5 text-white">
                          {quiz.number}
                        </span>
                        <h4 className="text-xs font-bold text-white">{quiz.title}</h4>
                      </div>
                      <p className="text-[11px] text-[#757575] font-medium">
                        {quiz.dueDate} &bull; {quiz.timeLimit}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
