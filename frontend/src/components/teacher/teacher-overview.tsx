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
  Plus,
} from 'lucide-react';

interface TeacherOverviewProps {
  onSelectClass: (cls: ClassData) => void;
  teacherName?: string;
  classes?: ClassData[];
  onCreateClass?: () => void;
}

export default function TeacherOverview({
  onSelectClass,
  teacherName = 'Prof. Sarah Connor',
  classes,
  onCreateClass,
}: TeacherOverviewProps) {
  const activeClasses = classes && classes.length > 0 ? classes : MOCK_CLASSES;

  // Aggregate Stats dynamically from active classes
  const totalClasses = activeClasses.length;
  const totalStudents = activeClasses.reduce(
    (acc, c) => acc + (c.studentCount || 0),
    0
  );
  const avgMastery =
    totalClasses > 0
      ? Math.round(
          activeClasses.reduce((acc, c) => acc + (c.overallMastery || 80), 0) /
            totalClasses
        )
      : 80;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-white">
      {/* 1. Personalized Welcome Banner in Dark Neumorphic Card */}
      <div className="relative overflow-hidden neu-card-raised p-7 sm:p-9">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full neu-inset-sm text-white text-xs font-bold tracking-wide border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-[#00d2ff]" />
            Live Supabase Postgres Telemetry Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Good morning, {teacherName}
          </h1>
          <p className="text-[#9e9e9e] text-sm leading-relaxed max-w-xl">
            You are managing <span className="text-white font-bold">{totalClasses} active sections</span>. 
            Deterministic mastery engines and continuous student telemetry are evaluating learning gaps.
          </p>
        </div>

        {/* Ambient Subtle Glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
      </div>

      {/* 2. Quick Summary Cards (Soft Extruded Neumorphic) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Active Classes */}
        <div className="neu-card p-6 flex items-center justify-between text-white">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#757575]">
              Total Active Classes
            </p>
            <p className="text-3xl font-black text-white">{totalClasses}</p>
            <p className="text-xs text-[#9e9e9e] flex items-center gap-1 font-medium pt-1">
              <Clock className="w-3.5 h-3.5 text-white" />
              All cohorts scheduled
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl neu-inset text-white flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Total Students Managed */}
        <div className="neu-card p-6 flex items-center justify-between text-white">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#757575]">
              Students Managed
            </p>
            <p className="text-3xl font-black text-white">{totalStudents}</p>
            <p className="text-xs text-[#00d2ff] flex items-center gap-1 font-bold pt-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#00d2ff]" />
              Live enrolled learners
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl neu-inset text-white flex items-center justify-center">
            <Users className="w-7 h-7 text-[#00d2ff]" />
          </div>
        </div>

        {/* Overall Mastery Avg */}
        <div className="neu-card p-6 flex items-center justify-between text-white">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[#757575]">
              Overall Mastery Avg
            </p>
            <p className="text-3xl font-black text-white">{avgMastery}%</p>
            <p className="text-xs text-[#9e9e9e] flex items-center gap-1 font-medium pt-1">
              <Award className="w-3.5 h-3.5 text-white" />
              High institutional benchmark
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl neu-inset text-white flex items-center justify-center">
            <Target className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* 3. Class Selection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">
              Managed Cohorts &amp; Classes
            </h2>
            <p className="text-xs text-[#9e9e9e] font-medium">
              Click any class to enter its live workspace, analytics, AI quizzes, and student roster.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onCreateClass && (
              <button
                type="button"
                onClick={onCreateClass}
                className="neu-btn-accent px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer text-[#0a0f1d]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Subject Offering
              </button>
            )}
            <span className="text-xs font-bold text-white neu-inset-sm px-3 py-1">
              {totalClasses} Cohorts
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeClasses.map((cls) => {
            const ringColor =
              cls.overallMastery >= 80
                ? '#00d2ff'
                : cls.overallMastery >= 65
                ? '#ffffff'
                : '#f59e0b';

            return (
              <div
                key={cls.id}
                onClick={() => onSelectClass(cls)}
                className="group text-left neu-card hover:shadow-[10px_10px_24px_rgba(0,0,0,0.55),-5px_-5px_15px_rgba(255,255,255,0.04)] hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[220px] p-6"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectClass(cls);
                }}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="px-3 py-1 rounded-full neu-inset-sm text-white text-xs font-bold font-mono">
                      {cls.code}
                    </span>
                    <div className="w-8 h-8 rounded-full neu-btn flex items-center justify-center group-hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-xl font-black text-white group-hover:text-white transition-colors">
                      {cls.name}
                    </h3>
                    <p className="text-xs font-medium text-[#9e9e9e] mt-0.5">
                      {cls.section} &bull; {cls.room}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#9e9e9e] font-semibold">
                    <Users className="w-4 h-4 text-white" />
                    <span>{cls.studentCount} Students Enrolled</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          stroke="#181818"
                          strokeWidth="3.5"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          stroke={ringColor}
                          strokeDasharray={`${cls.overallMastery || 80}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-[11px] font-black text-white">
                        {cls.overallMastery || 80}%
                      </span>
                    </div>

                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] uppercase font-bold text-[#757575] block">
                        Mastery
                      </span>
                      <span className="text-xs font-bold text-[#9e9e9e]">
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
