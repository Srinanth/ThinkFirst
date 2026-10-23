'use client';

import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Award,
  MessageSquare,
  LogOut,
} from 'lucide-react';

interface StudentPortalProps {
  studentName?: string;
  studentId?: string;
  onSignOut: () => void;
}

export default function StudentPortal({
  studentName = 'Alex Rivera',
  studentId = 'STD-8821',
  onSignOut,
}: StudentPortalProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Student Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-7 sm:p-9 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Active Learner Account &bull; {studentId}
            </div>
            <button
              onClick={onSignOut}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer bg-white/10 px-3 py-1 rounded-xl"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {studentName}
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
            You are enrolled in <span className="text-white font-semibold">3 active subjects</span>. Your sub-topic mastery is trending at <span className="text-emerald-400 font-bold">94% (Mastered tier)</span>.
          </p>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Overall Mastery
            </p>
            <p className="text-3xl font-black text-slate-900">94%</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Mastered Tier
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Award className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quizzes Completed
            </p>
            <p className="text-3xl font-black text-slate-900">14 / 15</p>
            <p className="text-xs text-indigo-600 font-bold mt-1">
              93.3% On-time Rate
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              AI Tutor Sessions
            </p>
            <p className="text-3xl font-black text-slate-900">28</p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Socratic learning dialogues
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center border border-cyan-100">
            <MessageSquare className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* 3. Enrolled Subjects & Upcoming Quizzes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enrolled Classes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              My Enrolled Subjects
            </h3>
            <span className="text-xs font-bold text-slate-400">Term 2026</span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  Computer Science - 10A
                </p>
                <p className="text-xs text-slate-500">Prof. Sarah Connor &bull; Lab 302</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                94%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  Advanced Algorithms - 12B
                </p>
                <p className="text-xs text-slate-500">Prof. Sarah Connor &bull; Hall 405</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                88%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  Database Systems - 11A
                </p>
                <p className="text-xs text-slate-500">Prof. Alistair Vance &bull; Sem 204</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800">
                76%
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Quizzes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Upcoming Assessments
            </h3>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              2 Scheduled
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-indigo-900">
                  Quiz #07: Dynamic Programming Prelim
                </span>
                <span className="text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                  Oct 28, 2026
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Topics: Memoization, Overlapping Subproblems, Top-Down Table Allocation.
              </p>
              <button
                disabled
                className="w-full mt-2 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-not-allowed opacity-90 shadow-sm"
              >
                Assessment Opens in 5 Days
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">
                  Quiz #05: BCNF Schema Normalization
                </span>
                <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  Nov 02, 2026
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Topics: Functional dependencies, Armstrong axioms, 3NF vs BCNF.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
