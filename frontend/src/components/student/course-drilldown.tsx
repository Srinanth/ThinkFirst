'use client';

import React from 'react';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Download,
  Bell,
  Award,
  ChevronRight,
} from 'lucide-react';
import { CourseItem } from './student-dashboard';

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

const ATTENDED_QUIZZES: CompletedQuiz[] = [
  {
    id: 'cq-1',
    number: 'Quiz 1',
    title: 'Array Manipulation & Pointers',
    date: 'Sep 04, 2026',
    duration: '22 mins',
    score: 20,
    maxScore: 20,
    percentage: 100,
  },
  {
    id: 'cq-2',
    number: 'Quiz 2',
    title: 'Singly & Doubly Linked Lists',
    date: 'Sep 11, 2026',
    duration: '28 mins',
    score: 18,
    maxScore: 20,
    percentage: 90,
  },
  {
    id: 'cq-3',
    number: 'Quiz 3',
    title: 'Stack Applications & Infix/Postfix Evaluation',
    date: 'Sep 18, 2026',
    duration: '25 mins',
    score: 17,
    maxScore: 20,
    percentage: 85,
  },
  {
    id: 'cq-4',
    number: 'Quiz 4',
    title: 'Queue Implementations & Priority Queues',
    date: 'Sep 25, 2026',
    duration: '29 mins',
    score: 19,
    maxScore: 20,
    percentage: 95,
  },
  {
    id: 'cq-5',
    number: 'Quiz 5',
    title: 'Recursion & Backtracking Principles',
    date: 'Oct 02, 2026',
    duration: '30 mins',
    score: 16,
    maxScore: 20,
    percentage: 80,
  },
  {
    id: 'cq-6',
    number: 'Quiz 6',
    title: 'Binary Trees & Tree Traversals (In/Pre/Post)',
    date: 'Oct 09, 2026',
    duration: '27 mins',
    score: 18,
    maxScore: 20,
    percentage: 90,
  },
  {
    id: 'cq-7',
    number: 'Quiz 7-A',
    title: 'Binary Search Trees - Search & Insertion Logic',
    date: 'Oct 16, 2026',
    duration: '24 mins',
    score: 19,
    maxScore: 20,
    percentage: 95,
  },
];

const OPEN_QUIZZES: OpenQuiz[] = [
  {
    id: 'oq-8',
    number: 'Quiz 8',
    title: 'AVL Trees & Tree Rotations',
    dueDate: 'Tonight, 11:59 PM',
    isDueToday: true,
    timeLimit: '30 mins',
    questionCount: 15,
    topics: ['AVL Trees', 'Single & Double Rotations', 'Balance Factors'],
  },
  {
    id: 'oq-7b',
    number: 'Quiz 7-B',
    title: 'Binary Search Trees - Practice & Deletion',
    dueDate: 'Oct 26, 11:59 PM',
    isDueToday: false,
    timeLimit: '25 mins',
    questionCount: 12,
    topics: ['BST Deletion Cases', 'In-order Successor'],
  },
];

const UPCOMING_QUIZZES: UpcomingQuiz[] = [
  {
    id: 'uq-9',
    number: 'Quiz 9',
    title: 'Graph Representation & BFS Traversal',
    scheduledDate: 'Oct 28, 2026',
    scheduledTime: 'Starts 09:00 AM',
    topics: ['Adjacency Matrix/List', 'Queue-based BFS'],
  },
  {
    id: 'uq-10',
    number: 'Quiz 10',
    title: 'DFS & Topological Sorting',
    scheduledDate: 'Nov 04, 2026',
    scheduledTime: 'Starts 10:00 AM',
    topics: ['Recursion Stack', 'DAG Cycle Detection'],
  },
];

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
  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-white">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-white neu-btn px-3.5 py-2 transition-all cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-white" />
          <span>Back to Academic Overview</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#757575] font-medium">
          <span>Student Portal</span>
          <span>/</span>
          <span>Enrolled Courses</span>
          <span>/</span>
          <span className="font-bold text-white">{course.code}</span>
        </div>
      </div>

      {/* Top Hero Header Card (Dark Neumorphic Raised with Crisp White Contrast) */}
      <div className="neu-card-raised p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full neu-badge-white text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_white] animate-pulse" />
              ACTIVE ASSESSMENT COURSE &bull; {course.credits} Credit Units
            </div>

            {/* Course Title */}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {course.code}: {course.title}
            </h1>

            {/* Subtitle Metadata */}
            <p className="text-[#9e9e9e] text-xs sm:text-sm font-medium leading-relaxed">
              Lead Instructor: <strong className="text-white">{course.instructor}</strong> &bull; Department of Computer Science &bull; Fall Term
            </p>
          </div>

          {/* Right-side Metric Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3 rounded-2xl neu-inset text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#757575]">Class Avg</p>
              <p className="text-2xl font-black text-white">81.2%</p>
              <span className="text-[10px] text-[#9e9e9e] font-medium">Cohort of 42</span>
            </div>

            <div className="px-5 py-3 rounded-2xl neu-inset text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#757575]">Alex&apos;s Avg</p>
              <p className="text-2xl font-black text-white">89.4%</p>
              <span className="text-[10px] text-white font-bold">Grade A Tier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Drilldown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Attended Quizzes with Scores List (7 cols) */}
        <div className="lg:col-span-7 neu-card p-5 sm:p-6 space-y-4 text-white">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  Attended quizzes with scores as list
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold neu-badge-white">
                  7 Completed
                </span>
              </div>
              <p className="text-xs text-[#9e9e9e] font-medium mt-0.5">
                History of evaluated assessments and solution keys
              </p>
            </div>
          </div>

          {/* Scrollable List Items */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {ATTENDED_QUIZZES.map((quiz) => (
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
                  {/* Score Badge */}
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold neu-badge-white">
                      <Award className="w-3.5 h-3.5 text-white" />
                      {quiz.score} / {quiz.maxScore} ({quiz.percentage}%)
                    </span>
                  </div>

                  {/* Secondary Review Button */}
                  <button
                    onClick={() => onReviewQuiz(quiz)}
                    className="px-3 py-1.5 neu-btn text-xs font-bold text-white hover:text-white/80 cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Text & Download Link */}
          <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-[#757575] font-medium">
              Showing recent completed quizzes in {course.code}
            </span>
            <button
              onClick={() => alert(`Downloading official solution keys for ${course.code}...`)}
              className="inline-flex items-center gap-1.5 font-bold text-white hover:text-[#9e9e9e] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Download All Solution Keys (PDF)</span>
            </button>
          </div>
        </div>

        {/* Right Section: Quizzes to Attempt + Upcoming Quizzes (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Right Section Top: List of Quizzes to Attempt (Action Required) */}
          <div className="neu-card p-5 sm:p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">
                  List of quizzes to attempt
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/60 text-rose-300 border border-rose-500/30 uppercase">
                  ACTION REQUIRED
                </span>
              </div>
              <span className="text-xs font-bold text-white neu-inset-sm px-2.5 py-0.5">
                2 Open
              </span>
            </div>

            {/* Active Assessment Cards */}
            <div className="space-y-3.5">
              {OPEN_QUIZZES.map((quiz) => (
                <div
                  key={quiz.id}
                  className={`rounded-2xl p-4.5 transition-all ${
                    quiz.isDueToday
                      ? 'neu-card-raised border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                      : 'neu-inset'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold neu-card-sm text-white">
                          {quiz.number}
                        </span>
                        {quiz.isDueToday ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#00d2ff] text-[#0a0f1d] uppercase shadow-[0_0_8px_rgba(0,210,255,0.4)]">
                            DUE TODAY ({quiz.dueDate})
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-[#9e9e9e]">
                            Due {quiz.dueDate}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white mt-1.5">
                        {quiz.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#757575] font-medium mt-2">
                    <span>{quiz.questionCount} Questions</span>
                    <span>&bull;</span>
                    <span>{quiz.timeLimit} Limit</span>
                    <span>&bull;</span>
                    <span>1 Attempt Allowed</span>
                  </div>

                  {/* Requirements / Topics */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {quiz.topics.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md neu-inset-sm text-[10px] font-semibold text-[#9e9e9e]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Action Button: Strategic CTA */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-[#757575] font-medium">
                      Proctored Environment
                    </span>
                    <button
                      onClick={() => onStartQuiz(quiz)}
                      className="px-4 py-2 neu-btn-accent text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Start Quiz</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#0a0f1d]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section Bottom: Upcoming Quizzes */}
          <div className="neu-card p-5 sm:p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div>
                <h3 className="text-base font-black text-white tracking-tight">
                  Upcoming quizzes
                </h3>
                <p className="text-xs text-[#9e9e9e] font-medium mt-0.5">
                  Scheduled class tests on syllabus calendar
                </p>
              </div>
              <button
                onClick={() => alert('Opening syllabus assessment calendar...')}
                className="text-xs font-bold text-white hover:underline cursor-pointer"
              >
                Calendar
              </button>
            </div>

            {/* Scheduled List Items */}
            <div className="space-y-3">
              {UPCOMING_QUIZZES.map((quiz) => (
                <div
                  key={quiz.id}
                  className="p-3.5 rounded-xl neu-inset flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold neu-card-sm text-white">
                        {quiz.number}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate max-w-[190px]">
                        {quiz.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#757575] font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-white" />
                      {quiz.scheduledDate} &bull; {quiz.scheduledTime}
                    </p>
                  </div>

                  <button
                    onClick={() => alert(`Reminder set for ${quiz.title} on ${quiz.scheduledDate}`)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-white hover:text-[#9e9e9e] neu-btn px-2.5 py-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Bell className="w-3 h-3 text-white" />
                    <span>Set Reminder</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Footer Examination Schedule Link */}
            <div className="pt-2 border-t border-white/5 text-center">
              <button
                onClick={() => alert('Navigating to full semester exam schedule...')}
                className="text-xs font-semibold text-[#757575] hover:text-white inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View complete semester examination schedule</span>
                <ChevronRight className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
