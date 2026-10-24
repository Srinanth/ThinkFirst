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

// Weekly quiz performance trend Weeks 1 to 9
const WEEKLY_TREND_DATA = [
  { week: 'W1', score: 82, target: 80 },
  { week: 'W2', score: 85, target: 80 },
  { week: 'W3', score: 76, target: 80 },
  { week: 'W4', score: 81, target: 80 },
  { week: 'W5', score: 84, target: 80 },
  { week: 'W6', score: 88, target: 80 },
  { week: 'W7', score: 86, target: 80 },
  { week: 'W8', score: 95, target: 80 },
  { week: 'W9', score: 92, target: 80 },
];

interface StudentDashboardProps {
  onSelectCourse: (course: CourseItem) => void;
  onOpenAddModal?: (type: 'student' | 'teacher') => void;
  courses?: CourseItem[];
  studentName?: string;
  collegeName?: string;
}

export default function StudentDashboard({
  onSelectCourse,
  onOpenAddModal,
  courses = [],
  studentName = 'Enrolled Student',
  collegeName = 'Faculty of Engineering',
}: StudentDashboardProps) {
  const activeCourses = courses || [];
  const initials = (studentName || 'ST')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-white">
      {/* Top Workspace Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_white]" />
          <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase text-white">
            WORKSPACE 1: PERFORMANCE &amp; ACADEMIC OVERVIEW
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {onOpenAddModal && (
            <button
              onClick={() => onOpenAddModal('student')}
              className="text-[11px] font-bold text-[#9e9e9e] hover:text-white neu-btn px-3 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Admissions Protocol
            </button>
          )}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold neu-badge-white">
            Live Telemetry
          </span>
        </div>
      </div>

      {/* Student Bio Header Card */}
      <div className="neu-card-raised p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#222222] to-[#2e2e2e] border border-white/10 text-white flex items-center justify-center font-black text-xl shadow-[inset_2px_2px_5px_rgba(0,0,0,0.6)] shrink-0">
            {initials || 'ST'}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {studentName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold neu-badge-white">
                Active Student
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#9e9e9e] font-medium mt-0.5">
              {collegeName}
            </p>
            <div className="flex items-center gap-3 text-xs text-[#757575] font-medium mt-1 flex-wrap">
              <span>Status: <strong className="text-white">Enrolled &bull; Live Telemetry</strong></span>
              <span>&bull;</span>
              <span>Mastery Engine: <strong className="text-white">Active</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl neu-inset text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#757575]">Academic Standing</p>
            <p className="text-sm font-black text-white">
              {activeCourses.length > 0 ? "Dean's Honor List" : "Enrolled"}
            </p>
          </div>
          <div className="px-4 py-2.5 rounded-xl neu-inset text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#757575]">Active Courses</p>
            <p className="text-sm font-black text-white">{activeCourses.length} Cohorts</p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Enrolled Classes */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white tracking-tight">
                Enrolled Classes
              </h3>
              <p className="text-xs text-[#9e9e9e] font-medium">
                {activeCourses.length} active courses &bull; Click to enter Socratic Tutor &amp; Quizzes
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold neu-badge text-white">
              <Layers className="w-3.5 h-3.5 text-white" />
              {activeCourses.length * 4} Credit Hours
            </span>
          </div>

          {/* Class Cards */}
          {activeCourses.length === 0 ? (
            <div className="neu-card p-10 text-center rounded-3xl space-y-3 border border-white/5">
              <div className="w-14 h-14 mx-auto rounded-2xl neu-inset flex items-center justify-center text-[#00d2ff]">
                <BookOpen className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-white">No Enrolled Courses Found</h4>
              <p className="text-xs text-[#9e9e9e] max-w-sm mx-auto leading-relaxed">
                You are not currently enrolled in any classes. Share your Student / Roll ID with your faculty instructor so they can add you to their class roster.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {activeCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => onSelectCourse(course)}
                  className="neu-card p-5 hover:shadow-[10px_10px_24px_rgba(0,0,0,0.55),-5px_-5px_15px_rgba(255,255,255,0.04)] hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold neu-inset-sm text-[#00d2ff] font-mono">
                          {course.code}
                        </span>
                        <span className="text-xs text-[#757575] font-medium">
                          {course.credits} Credits &bull; {course.location}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-white group-hover:text-white transition-colors">
                        {course.title}
                      </h4>

                      <p className="text-xs text-[#9e9e9e] font-medium">
                        Instructor: <span className="text-white font-semibold">{course.instructor}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between self-stretch">
                      <div className="w-8 h-8 rounded-full neu-btn flex items-center justify-center text-[#757575] group-hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold neu-badge-white text-white">
                          Enrolled &bull; Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Mini Analytics */}
        <div className="lg:col-span-5 space-y-5">
          <div className="neu-card p-5 sm:p-6 space-y-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white tracking-tight">
                  Academic Learning Journey
                </h3>
                <p className="text-xs text-[#9e9e9e] font-medium mt-0.5">
                  Live cohort standing and syllabus engagement
                </p>
              </div>
              <span className="text-xs font-bold text-white neu-inset-sm px-2.5 py-1">
                Active
              </span>
            </div>

            {activeCourses.length === 0 ? (
              <p className="text-xs text-[#757575] py-4 text-center">
                Awaiting course enrollment to visualize your academic learning journey.
              </p>
            ) : (
              <div className="space-y-2 pt-1">
                {activeCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-[#202020] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_6px_white]" />
                      <span className="font-bold text-white">{course.code}:</span>
                      <span className="text-[#9e9e9e] truncate max-w-[170px]">
                        {course.title}
                      </span>
                    </div>
                    <span className="font-bold text-xs text-neutral-300 px-2.5 py-0.5 rounded-full neu-inset-sm">
                      On Track
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academic progress graph */}
          <div className="neu-card p-5 sm:p-6 space-y-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white tracking-tight">
                  Study Engagement Trend
                </h3>
                <p className="text-xs text-[#9e9e9e] font-medium mt-0.5">
                  Consistent weekly practice and learning activity
                </p>
              </div>
              <span className="text-[11px] font-bold text-white neu-inset-sm px-2.5 py-1">
                Active Streak
              </span>
            </div>

            <div className="neu-inset p-3 rounded-2xl h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={WEEKLY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: '#757575', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[60, 100]}
                    tick={{ fill: '#757575', fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    hide
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#262626',
                      borderRadius: '14px',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.12)',
                      fontSize: '12px',
                      fontWeight: 600,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    }}
                    formatter={(value: unknown, name: unknown) => [
                      'Consistent Engagement',
                      'Weekly Socratic Activity',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    dot={{ fill: '#1e1e1e', r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#ffffff', stroke: '#222222', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Performance Callouts */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/5 text-center">
              <div className="p-2.5 rounded-xl neu-inset">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#757575]">Learning Pace</p>
                <p className="text-xs font-black text-white/90">Steady &bull; Active</p>
              </div>
              <div className="p-2.5 rounded-xl neu-card-sm border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white">Focus</p>
                <p className="text-xs font-black text-white">Consistent</p>
              </div>
              <div className="p-2.5 rounded-xl neu-inset">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#757575]">Curriculum</p>
                <p className="text-xs font-black text-white">On Track</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
