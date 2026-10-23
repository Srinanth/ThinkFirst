'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  GraduationCap,
  Building2,
  Users,
  UserPlus,
  BadgeCheck,
  TrendingUp,
  LogOut,
  Bell,
  ChevronDown,
  X,
  CheckCircle,
  Eye,
  EyeOff,
  User,
  CreditCard,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface DashboardViewProps {
  adminName: string;
  adminEmail: string;
  collegeName: string;
}

export default function DashboardView({
  adminName,
  adminEmail,
  collegeName,
}: DashboardViewProps) {
  const router = useRouter();
  const supabase = createClient();

  // Modal State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  // Student Form State
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('STD-2026-');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Teacher Form State
  const [teacherName, setTeacherName] = useState('');
  const [teacherId, setTeacherId] = useState('TCR-2026-');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);

  // Notification / Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    document.cookie = 'thinkfirst_demo_admin=; Max-Age=0; path=/;';
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentId || !studentPassword) return;

    setToastMessage(`Student "${studentName}" (${studentId}) enrolled successfully!`);
    setIsStudentModalOpen(false);
    setStudentName('');
    setStudentId('STD-2026-');
    setStudentPassword('');
    setShowStudentPassword(false);

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleAddTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || !teacherId || !teacherPassword) return;

    setToastMessage(`Teacher "${teacherName}" (${teacherId}) added to faculty!`);
    setIsTeacherModalOpen(false);
    setTeacherName('');
    setTeacherId('TCR-2026-');
    setTeacherPassword('');
    setShowTeacherPassword(false);

    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4 border border-white/20">
          <CheckCircle className="w-4 h-4 shrink-0 text-white" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75 cursor-pointer text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Top Navigation Bar */}
      <header className="bg-white/95 border-b border-slate-200 sticky top-0 z-30 shadow-2xs backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Institutional badge icon and text hierarchy */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-blue-600 uppercase">
                ADMIN PORTAL
              </p>
              <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
                Admin Home
              </h1>
            </div>
          </div>

          {/* Right: Notification bell and Administrator profile avatar */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>

            {/* Profile Avatar / Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-800 hidden sm:inline-block">
                  {adminName}
                </span>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold ring-2 ring-blue-500/20">
                  {adminName.slice(0, 2).toUpperCase()}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in text-slate-800">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {adminName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {adminEmail}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {collegeName}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 w-full">
        {/* 2. Hero Banner Card (Rich Royal Blue gradient) */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
          <div className="space-y-3 z-10 max-w-xl">
            {/* Top tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/20 border border-white/25 text-white text-xs font-bold backdrop-blur-xs">
                • Fall 2026 Term
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 border border-white/25 text-white text-xs font-bold backdrop-blur-xs">
                Week 4
              </span>
            </div>

            {/* Greeting & Subtext */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, Admin
            </h2>
            <p className="text-blue-100 text-sm leading-relaxed">
              Campus operations are running smoothly. System telemetry active and synchronized.
            </p>
          </div>

          {/* Right side: Building / Institution Icon graphic */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner shrink-0 self-start md:self-auto backdrop-blur-xs">
            <Building2 className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* 3. Primary Directives Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase">
              PRIMARY DIRECTIVES
            </h3>
            <span className="text-xs font-semibold text-slate-400 cursor-default">
              Instant Actions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Action Card 1: ADD STUDENT */}
            <button
              type="button"
              onClick={() => setIsStudentModalOpen(true)}
              className="text-left w-full rounded-2xl p-6 bg-white hover:bg-blue-50/40 text-slate-900 border border-slate-200 hover:border-blue-300 shadow-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between min-h-[175px] group"
            >
              <div className="flex items-start justify-between w-full">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xl font-black tracking-wide text-slate-900 group-hover:text-blue-600 transition-colors">
                  ADD STUDENT
                </h4>
                <p className="text-slate-500 text-xs mt-0.5">
                  Enroll new learner
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />
                &bull; Admissions Protocol Open
              </div>
            </button>

            {/* Action Card 2: ADD TEACHER */}
            <button
              type="button"
              onClick={() => setIsTeacherModalOpen(true)}
              className="text-left w-full rounded-2xl p-6 bg-white hover:bg-indigo-50/40 text-slate-900 border border-slate-200 hover:border-indigo-300 shadow-sm transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between min-h-[175px] group"
            >
              <div className="flex items-start justify-between w-full">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <BadgeCheck className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xl font-black tracking-wide text-slate-900 group-hover:text-indigo-600 transition-colors">
                  ADD TEACHER
                </h4>
                <p className="text-slate-500 text-xs mt-0.5">
                  Onboard faculty staff
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600" />
                &bull; Staff Portal
              </div>
            </button>
          </div>
        </section>

        {/* 4. Campus Pulse Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase">
              CAMPUS PULSE
            </h3>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Real-time
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Metric Card 1: Total Students */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between text-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Total Students
                </span>
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  1,248
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 pt-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  ↗ +32 this term
                </div>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <GraduationCap className="w-7 h-7 text-blue-600" />
              </div>
            </div>

            {/* Metric Card 2: Faculty & Staff */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between text-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Faculty &amp; Staff
                </span>
                <div className="text-3xl font-black text-slate-900 tracking-tight">
                  84
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 pt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  &bull; All active roster
                </div>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <Users className="w-7 h-7 text-indigo-600" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ============================================================== */}
      {/* 5. MODAL POPUPS                                                */}
      {/* ============================================================== */}

      {/* POPUP A: Add Student Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-900"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 relative">
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="absolute top-6 right-6 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black tracking-wider uppercase mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> ADMISSIONS PROTOCOL
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">
                ADD STUDENT
              </h3>
              <p className="text-slate-500 text-xs mt-1 font-medium">
                Fill in institutional profile details to complete registration.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddStudentSubmit} className="p-6 space-y-4">
              {/* Field 1: Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  NAME
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Full Student Name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Student ID */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  STUDENT ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="STD-2026-XXXX"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Field 3: Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-blue-600" />
                  </div>
                  <input
                    type={showStudentPassword ? 'text' : 'password'}
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showStudentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                  ADD STUDENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP B: Add Teacher Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-900"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 relative">
              <button
                type="button"
                onClick={() => setIsTeacherModalOpen(false)}
                className="absolute top-6 right-6 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black tracking-wider uppercase mb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" /> ADMISSIONS PROTOCOL
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">
                ADD TEACHER
              </h3>
              <p className="text-slate-500 text-xs mt-1 font-medium">
                Fill in institutional profile details to complete registration.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddTeacherSubmit} className="p-6 space-y-4">
              {/* Field 1: Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  NAME
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  <input
                    type="text"
                    required
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="Full Faculty Name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Teacher ID */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  TEACHER ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                  </div>
                  <input
                    type="text"
                    required
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    placeholder="TCR-2026-XXXX"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Field 3: Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-indigo-600" />
                  </div>
                  <input
                    type={showTeacherPassword ? 'text' : 'password'}
                    required
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showTeacherPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                  ADD TEACHER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
