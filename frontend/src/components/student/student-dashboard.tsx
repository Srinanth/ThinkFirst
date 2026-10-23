'use client';

import React from 'react';
import {
  BookOpen,
  ArrowRight,
  TrendingUp,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

export interface CourseItem {
  id: string;
  code: string;
  title: string;
  instructor: string;
  location: string;
  grade: string;
  percentage: number;
  credits: number;
  color: string;
}

export const ENROLLED_COURSES: CourseItem[] = [
  {
    id: 'cs-204',
    code: 'CS-204',
    title: 'Data Structures & Algorithms',
    instructor: 'Prof. Dr. Sharma',
    location: 'Room 302B',
    grade: 'A',
    percentage: 91.4,
    credits: 4,
    color: '#2563eb', // Primary Blue
  },
  {
    id: 'cs-206',
    code: 'CS-206',
    title: 'Database Management Systems',
    instructor: 'Prof. Rachel Gomez',
    location: 'Lab 4A',
    grade: 'B+',
    percentage: 86.2,
    credits: 4,
    color: '#0ea5e9', // Sky Blue
  },
  {
    id: 'cs-208',
    code: 'CS-208',
    title: 'Computer Networks & Protocols',
    instructor: 'Prof. Marcus Sterling',
    location: 'Room 114',
    grade: 'A-',
    percentage: 88.7,
    credits: 4,
    color: '#4f46e5', // Indigo
  },
  {
    id: 'ma-202',
    code: 'MA-202',
    title: 'Discrete Mathematics & Logic',
    instructor: 'Prof. Arthur Pendleton',
    location: 'Hall C',
    grade: 'B',
    percentage: 82.0,
    credits: 4,
    color: '#06b6d4', // Cyan
  },
];

// Weekly quiz performance trend Weeks 1 to 9
const WEEKLY_TREND_DATA = [
  { week: 'W1', score: 82, target: 80 },
  { week: 'W2', score: 85, target: 80 },
  { week: 'W3', score: 76, target: 80 }, // Lowest
  { week: 'W4', score: 81, target: 80 },
  { week: 'W5', score: 84, target: 80 },
  { week: 'W6', score: 88, target: 80 },
  { week: 'W7', score: 86, target: 80 },
  { week: 'W8', score: 95, target: 80 }, // Peak
  { week: 'W9', score: 92, target: 80 },
];

interface StudentDashboardProps {
  onSelectCourse: (course: CourseItem) => void;
  onOpenAddModal?: (type: 'student' | 'teacher') => void;
}

export default function StudentDashboard({
  onSelectCourse,
  onOpenAddModal,
}: StudentDashboardProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-slate-800">
      {/* Top Workspace Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase text-slate-800">
            WORKSPACE 1: PERFORMANCE &amp; ACADEMIC OVERVIEW
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {onOpenAddModal && (
            <button
              onClick={() => onOpenAddModal('student')}
              className="text-[11px] font-bold text-slate-700 hover:text-blue-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              Admissions Protocol
            </button>
          )}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Live Telemetry
          </span>
        </div>
      </div>

      {/* Student Bio Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl shadow-xs shrink-0 ring-2 ring-blue-500/20 border border-blue-200">
            AJ
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Alex Johnson
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Active Student
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              B.S. in Computer Science &bull; Semester 3 &bull; Academic Year 2026–27
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1 flex-wrap">
              <span>Student ID: <strong className="text-slate-800">CS-8841</strong></span>
              <span>&bull;</span>
              <span>Advisor: <strong className="text-slate-800">Dr. Eleanor Vance</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Academic Standing</p>
            <p className="text-sm font-black text-blue-600">Dean&apos;s Honor List</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Credits</p>
            <p className="text-sm font-black text-slate-900">48 / 120 Units</p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Enrolled Classes (4 Active Courses) - 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Enrolled Classes
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Fall Semester &bull; 4 active courses
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              16 Credit Hours
            </span>
          </div>

          {/* Class Cards 1 to 4 */}
          <div className="space-y-3.5">
            {ENROLLED_COURSES.map((course) => (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                        {course.code}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {course.credits} Credits &bull; {course.location}
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h4>

                    <p className="text-xs text-slate-500 font-medium">
                      Instructor: <span className="text-slate-800 font-semibold">{course.instructor}</span>
                    </p>
                  </div>

                  {/* Grade Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                      Current Grade
                    </span>
                    <span className="text-xl font-black text-blue-600">
                      {course.grade}{' '}
                      <span className="text-xs font-bold text-slate-500">
                        ({course.percentage}%)
                      </span>
                    </span>
                  </div>
                </div>

                {/* Card Footer Link */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    Assessments &amp; Syllabus
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-bold text-blue-600 group-hover:text-blue-800 transition-colors"
                  >
                    <span>Manage Quizzes</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Analytics & Progress - 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Quiz Performance Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5 text-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Average score of quizzes attended
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Cumulative quiz performance across all current semester subjects
              </p>
            </div>

            {/* Circular Progress & Trend Badge */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-4">
                {/* SVG Progress Ring */}
                <div className="relative w-18 h-18 flex items-center justify-center">
                  <svg className="w-18 h-18 -rotate-90 transform" viewBox="0 0 36 36">
                    <path
                      stroke="#f1f5f9"
                      strokeWidth="3.2"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      stroke="#2563eb"
                      strokeDasharray="84.5, 100"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-base font-black text-slate-900">84.5%</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Avg</p>
                  <p className="text-sm font-extrabold text-slate-900">High Proficiency</p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  &uarr; +32% vs prev term
                </span>
              </div>
            </div>

            {/* Breakdown List with Color Indicators */}
            <div className="space-y-2.5 pt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Course-by-Course Quiz Breakdown
              </p>
              {ENROLLED_COURSES.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                    <span className="font-bold text-slate-900">{course.code}:</span>
                    <span className="text-slate-600 truncate max-w-[170px]">
                      {course.title}
                    </span>
                  </div>
                  <span className="font-black text-blue-600">
                    {course.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Academic Progress Graph Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4 text-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Academic progress graph
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Weekly quiz performance trend Weeks 1 to 9
                </p>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                Target: 80%
              </span>
            </div>

            {/* Recharts Line Chart */}
            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={WEEKLY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[65, 100]}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      color: '#0f172a',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      fontWeight: 600,
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value: unknown, name: unknown) => [
                      `${String(value)}%`,
                      String(name) === 'score' ? "Alex's Score" : 'Benchmark Target',
                    ]}
                  />
                  <ReferenceLine
                    y={80}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label={{ value: 'Target 80%', fill: '#64748b', fontSize: 10, position: 'insideTopRight' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ fill: '#ffffff', r: 4, strokeWidth: 2, stroke: '#2563eb' }}
                    activeDot={{ r: 6, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Performance Callouts */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lowest</p>
                <p className="text-xs font-black text-rose-600">76% in W3</p>
              </div>
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Peak</p>
                <p className="text-xs font-black text-blue-700">95% in W8</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Projected</p>
                <p className="text-xs font-black text-slate-900">87.5% (A)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
