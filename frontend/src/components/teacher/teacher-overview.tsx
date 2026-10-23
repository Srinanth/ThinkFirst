'use client';

import React from 'react';
import { ClassData, MOCK_CLASSES } from '@/data/mock-data';
import {
  GraduationCap,
  Users,
  Target,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';

interface TeacherOverviewProps {
  onSelectClass: (cls: ClassData) => void;
  teacherName?: string;
}

export default function TeacherOverview({
  onSelectClass,
  teacherName = 'Prof. Sarah Connor',
}: TeacherOverviewProps) {
  // Aggregate Stats
  const totalClasses = MOCK_CLASSES.length;
  const totalStudents = MOCK_CLASSES.reduce(
    (acc, c) => acc + c.studentCount,
    0
  );
  const avgMastery = Math.round(
    MOCK_CLASSES.reduce((acc, c) => acc + c.overallMastery, 0) / totalClasses
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-800">
      {/* 1. Personalized Welcome Banner in Blue Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-7 sm:p-9 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 border border-white/25 text-white text-xs font-bold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            Fall Term 2026 &bull; Live Telemetry Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Good morning, {teacherName}
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed max-w-xl">
            You are managing <span className="text-white font-bold">{totalClasses} active sections</span>. 
            Recent quiz submissions show a <span className="text-white font-black underline decoration-sky-300 decoration-2 underline-offset-2">+6.4% performance leap</span> in Graph Traversals.
          </p>
        </div>

        {/* Ambient Decorative Accents */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
      </div>

      {/* 2. Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Active Classes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between text-slate-800">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Active Classes
            </p>
            <p className="text-3xl font-black text-slate-900">{totalClasses}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1 font-medium pt-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              All cohorts scheduled
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <GraduationCap className="w-7 h-7 text-blue-600" />
          </div>
        </div>

        {/* Total Students Managed */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between text-slate-800">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Students Managed
            </p>
            <p className="text-3xl font-black text-slate-900">{totalStudents}</p>
            <p className="text-xs text-blue-600 flex items-center gap-1 font-bold pt-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              98.2% Active engagement
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Users className="w-7 h-7 text-indigo-600" />
          </div>
        </div>

        {/* Overall Mastery Avg */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between text-slate-800">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Overall Mastery Avg
            </p>
            <p className="text-3xl font-black text-slate-900">{avgMastery}%</p>
            <p className="text-xs text-slate-500 flex items-center gap-1 font-medium pt-1">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              High institutional benchmark
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
            <Target className="w-7 h-7 text-sky-600" />
          </div>
        </div>
      </div>

      {/* 3. Class Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Managed Cohorts &amp; Classes
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Click any class to enter its detailed workspace, analytics, quizzes, and student roster.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {totalClasses} Cohorts Assigned
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_CLASSES.map((cls) => {
            const ringColor =
              cls.overallMastery >= 80
                ? '#2563eb' // Blue-600 (High Mastery)
                : cls.overallMastery >= 65
                ? '#0ea5e9' // Sky-500 (Proficient)
                : '#f59e0b'; // Amber-500 (Intervention)

            return (
              <div
                key={cls.id}
                onClick={() => onSelectClass(cls)}
                className="group text-left bg-white rounded-3xl border border-slate-200 hover:border-blue-400 p-6 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 hover:-translate-y-1 cursor-pointer flex flex-col justify-between min-h-[220px]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectClass(cls);
                }}
              >
                <div>
                  {/* Top Bar with Badge & Action Indicator */}
                  <div className="flex items-start justify-between">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold font-mono">
                      {cls.code}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white text-slate-400 flex items-center justify-center transition-all border border-slate-200 group-hover:border-blue-600">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Class Name & Section */}
                  <div className="mt-3">
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {cls.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {cls.section} &bull; {cls.room}
                    </p>
                  </div>
                </div>

                {/* Bottom Metrics Bar */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{cls.studentCount} Students Enrolled</span>
                  </div>

                  {/* Quick Performance Metric: Mini Progress Ring */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      {/* SVG Mini Donut Ring */}
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        {/* Background track */}
                        <path
                          stroke="#f1f5f9"
                          strokeWidth="3.5"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        {/* Progress arc */}
                        <path
                          stroke={ringColor}
                          strokeDasharray={`${cls.overallMastery}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-[11px] font-black text-slate-900">
                        {cls.overallMastery}%
                      </span>
                    </div>

                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Mastery
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        Class Avg
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
