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
    <div className="space-y-6 animate-in fade-in duration-200 text-slate-800">
      {/* Back Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-blue-600" />
          <span>Back to Academic Overview</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>Student Portal</span>
          <span>/</span>
          <span>Enrolled Courses</span>
          <span>/</span>
          <span className="font-bold text-slate-900">{course.code}</span>
        </div>
      </div>

      {/* Top Hero Header Card (Rich Blue Gradient) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/25 text-white text-xs font-bold tracking-wide uppercase backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-sky-300 animate-pulse" />
              ACTIVE ASSESSMENT COURSE &bull; {course.credits} Credit Units
            </div>

            {/* Course Title */}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {course.code}: {course.title}
            </h1>

            {/* Subtitle Metadata */}
            <p className="text-blue-100 text-xs sm:text-sm font-medium leading-relaxed">
              Lead Instructor: <strong className="text-white">{course.instructor}</strong> &bull; Department of Computer Science &bull; Fall Term
            </p>
          </div>

          {/* Right-side Metric Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-center backdrop-blur-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">Class Avg</p>
              <p className="text-2xl font-black text-white">81.2%</p>
              <span className="text-[10px] text-blue-200 font-medium">Cohort of 42</span>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-white/15 border border-white/30 text-center backdrop-blur-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-sky-200">Alex&apos;s Avg</p>
              <p className="text-2xl font-black text-white">89.4%</p>
              <span className="text-[10px] text-white font-bold">Grade A Tier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Drilldown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Attended Quizzes with Scores List (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 text-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Attended quizzes with scores as list
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  7 Completed
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                History of evaluated assessments and solution keys
              </p>
            </div>
          </div>

          {/* Scrollable List Items */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {ATTENDED_QUIZZES.map((quiz) => (
              <div
                key={quiz.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/60 hover:bg-blue-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {quiz.number}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      {quiz.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      {quiz.date}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Time Taken: {quiz.duration}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {/* Score Badge */}
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      {quiz.score} / {quiz.maxScore} ({quiz.percentage}%)
                    </span>
                  </div>

                  {/* Secondary Review Button */}
                  <button
                    onClick={() => onReviewQuiz(quiz)}
                    className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors shadow-2xs cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Text & Download Link */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 font-medium">
              Showing recent completed quizzes in {course.code}
            </span>
            <button
              onClick={() => alert(`Downloading official solution keys for ${course.code}...`)}
              className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download All Solution Keys (PDF)</span>
            </button>
          </div>
        </div>

        {/* Right Section: Quizzes to Attempt + Upcoming Quizzes (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Right Section Top: List of Quizzes to Attempt (Action Required) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  List of quizzes to attempt
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                  ACTION REQUIRED
                </span>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                2 Open
              </span>
            </div>

            {/* Active Assessment Cards */}
            <div className="space-y-3.5">
              {OPEN_QUIZZES.map((quiz) => (
                <div
                  key={quiz.id}
                  className={`rounded-2xl p-4.5 border transition-all ${
                    quiz.isDueToday
                      ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-500/20'
                      : 'bg-slate-50/60 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-700">
                          {quiz.number}
                        </span>
                        {quiz.isDueToday ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white uppercase">
                            DUE TODAY ({quiz.dueDate})
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500">
                            Due {quiz.dueDate}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mt-1.5">
                        {quiz.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-2">
                    <span>{quiz.questionCount} Questions</span>
                    <span>&bull;</span>
                    <span>{quiz.timeLimit} Limit</span>
                    <span>&bull;</span>
                    <span>1 Attempt Allowed</span>
                  </div>

                  {/* Requirements / Topics */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {quiz.topics.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Proctored Environment
                    </span>
                    <button
                      onClick={() => onStartQuiz(quiz)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span>Start Quiz</span>
                      <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Section Bottom: Upcoming Quizzes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Upcoming quizzes
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Scheduled class tests on syllabus calendar
                </p>
              </div>
              <button
                onClick={() => alert('Opening syllabus assessment calendar...')}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Calendar
              </button>
            </div>

            {/* Scheduled List Items */}
            <div className="space-y-3">
              {UPCOMING_QUIZZES.map((quiz) => (
                <div
                  key={quiz.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {quiz.number}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[190px]">
                        {quiz.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      {quiz.scheduledDate} &bull; {quiz.scheduledTime}
                    </p>
                  </div>

                  <button
                    onClick={() => alert(`Reminder set for ${quiz.title} on ${quiz.scheduledDate}`)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    <Bell className="w-3 h-3 text-blue-600" />
                    <span>Set Reminder</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Footer Examination Schedule Link */}
            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                onClick={() => alert('Navigating to full semester exam schedule...')}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View complete semester examination schedule</span>
                <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
