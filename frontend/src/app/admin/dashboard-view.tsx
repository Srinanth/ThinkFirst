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
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col font-sans">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 neu-card-raised border border-white/20 text-white px-5 py-3 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.7)] flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 shrink-0 text-white" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75 cursor-pointer text-[#9e9e9e] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Top Navigation Bar (Neumorphic Soft Bar) */}
      <header className="bg-[#252525]/95 border-b border-white/5 sticky top-0 z-30 shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Institutional badge icon and text hierarchy */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-card-sm text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-white uppercase">
                ADMIN PORTAL
              </p>
              <h1 className="text-base font-black text-white tracking-tight leading-none">
                Admin Home
              </h1>
            </div>
          </div>

          {/* Right: Notification bell and Administrator profile avatar */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative p-2.5 rounded-xl neu-btn text-[#9e9e9e] hover:text-white transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_white]" />
            </button>

            {/* Profile Avatar / Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full neu-btn transition-all cursor-pointer"
              >
                <span className="text-xs font-bold text-white hidden sm:inline-block">
                  {adminName}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#252525] to-[#333333] border border-white/10 text-white flex items-center justify-center text-xs font-bold">
                  {adminName.slice(0, 2).toUpperCase()}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#9e9e9e]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#262626] border border-white/5 shadow-[0_16px_36px_rgba(0,0,0,0.65)] py-2 z-50 animate-in fade-in text-white">
                  <div className="px-4 py-2.5 border-b border-white/5">
                    <p className="text-xs font-bold text-white truncate">
                      {adminName}
                    </p>
                    <p className="text-[11px] text-[#9e9e9e] truncate">
                      {adminEmail}
                    </p>
                    <span className="inline-block mt-1.5 text-[10px] font-semibold text-white neu-inset-sm px-2.5 py-0.5">
                      {collegeName}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
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
        {/* 2. Hero Banner Card (Dark Neumorphic Raised) */}
        <div className="neu-card-raised p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
          <div className="space-y-3 z-10 max-w-xl">
            {/* Top tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full neu-inset-sm text-xs font-bold text-white border border-white/10">
                &bull; Fall 2026 Term
              </span>
              <span className="px-3 py-1 rounded-full neu-inset-sm text-xs font-bold text-[#9e9e9e]">
                Week 4
              </span>
            </div>

            {/* Greeting & Subtext */}
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, Admin
            </h2>
            <p className="text-[#9e9e9e] text-sm leading-relaxed">
              Campus operations are running smoothly. System telemetry active and synchronized.
            </p>
          </div>

          {/* Right side: Building / Institution Icon graphic */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl neu-inset flex items-center justify-center text-white shrink-0 self-start md:self-auto">
            <Building2 className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* 3. Primary Directives Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black tracking-wider text-[#757575] uppercase">
              PRIMARY DIRECTIVES
            </h3>
            <span className="text-xs font-semibold text-[#757575] cursor-default">
              Instant Actions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Action Card 1: ADD STUDENT */}
            <button
              type="button"
              onClick={() => setIsStudentModalOpen(true)}
              className="text-left w-full neu-card hover:shadow-[10px_10px_24px_rgba(0,0,0,0.55),-5px_-5px_15px_rgba(255,255,255,0.04)] hover:-translate-y-1 p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[175px] group text-white"
            >
              <div className="flex items-start justify-between w-full">
                <div className="w-12 h-12 rounded-xl neu-inset flex items-center justify-center text-white">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div className="w-9 h-9 rounded-full neu-btn flex items-center justify-center text-[#757575] group-hover:text-white group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xl font-black tracking-wide text-white group-hover:text-white transition-colors">
                  ADD STUDENT
                </h4>
                <p className="text-[#9e9e9e] text-xs mt-0.5">
                  Enroll new learner
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs text-[#757575] font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-white shadow-[0_0_6px_white]" />
                &bull; Admissions Protocol Open
              </div>
            </button>

            {/* Action Card 2: ADD TEACHER */}
            <button
              type="button"
              onClick={() => setIsTeacherModalOpen(true)}
              className="text-left w-full neu-card hover:shadow-[10px_10px_24px_rgba(0,0,0,0.55),-5px_-5px_15px_rgba(255,255,255,0.04)] hover:-translate-y-1 p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[175px] group text-white"
            >
              <div className="flex items-start justify-between w-full">
                <div className="w-12 h-12 rounded-xl neu-inset flex items-center justify-center text-white">
                  <BadgeCheck className="w-6 h-6 text-white" />
                </div>
                <div className="w-9 h-9 rounded-full neu-btn flex items-center justify-center text-[#757575] group-hover:text-white group-hover:translate-x-1 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xl font-black tracking-wide text-white group-hover:text-white transition-colors">
                  ADD TEACHER
                </h4>
                <p className="text-[#9e9e9e] text-xs mt-0.5">
                  Onboard faculty staff
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs text-[#757575] font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-white shadow-[0_0_6px_white]" />
                &bull; Staff Portal
              </div>
            </button>
          </div>
        </section>

        {/* 4. Campus Pulse Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black tracking-wider text-[#757575] uppercase">
              CAMPUS PULSE
            </h3>
            <span className="text-xs font-semibold text-[#757575] uppercase tracking-wider">
              Real-time
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Metric Card 1: Total Students */}
            <div className="neu-card p-6 flex items-center justify-between text-white">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#757575] uppercase tracking-wide">
                  Total Students
                </span>
                <div className="text-3xl font-black text-white tracking-tight">
                  1,248
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-white pt-1">
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                  ↗ +32 this term
                </div>
              </div>

              <div className="w-14 h-14 rounded-2xl neu-inset text-white flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
            </div>

            {/* Metric Card 2: Faculty & Staff */}
            <div className="neu-card p-6 flex items-center justify-between text-white">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#757575] uppercase tracking-wide">
                  Faculty &amp; Staff
                </span>
                <div className="text-3xl font-black text-white tracking-tight">
                  84
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#9e9e9e] pt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  &bull; All active roster
                </div>
              </div>

              <div className="w-14 h-14 rounded-2xl neu-inset text-white flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-3xl neu-card-raised border border-white/5 shadow-[0_24px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-150 text-white"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 relative bg-[#232323]">
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="absolute top-6 right-6 p-1.5 rounded-lg text-[#9e9e9e] hover:text-white neu-btn cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-inset-sm text-white text-[10px] font-black tracking-wider uppercase mb-2">
                <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_white] animate-pulse" /> ADMISSIONS PROTOCOL
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">
                ADD STUDENT
              </h3>
              <p className="text-[#9e9e9e] text-xs mt-1 font-medium">
                Fill in institutional profile details to complete registration.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddStudentSubmit} className="p-6 space-y-4">
              {/* Field 1: Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
                  NAME
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Full Student Name"
                    className="w-full pl-10 pr-4 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white"
                  />
                </div>
              </div>

              {/* Field 2: Student ID */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
                  STUDENT ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="STD-2026-XXXX"
                    className="w-full pl-10 pr-4 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white font-mono"
                  />
                </div>
              </div>

              {/* Field 3: Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type={showStudentPassword ? 'text' : 'password'}
                    required
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-11 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#757575] hover:text-white focus:outline-none cursor-pointer"
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
              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2.5 neu-btn text-[#9e9e9e] hover:text-white font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 neu-btn-accent text-[#0a0f1d] font-bold text-xs tracking-wide flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-[#0a0f1d]" />
                  ADD STUDENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP B: Add Teacher Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-3xl neu-card-raised border border-white/5 shadow-[0_24px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-150 text-white"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 relative bg-[#232323]">
              <button
                type="button"
                onClick={() => setIsTeacherModalOpen(false)}
                className="absolute top-6 right-6 p-1.5 rounded-lg text-[#9e9e9e] hover:text-white neu-btn cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-inset-sm text-white text-[10px] font-black tracking-wider uppercase mb-2">
                <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_white] animate-pulse" /> ADMISSIONS PROTOCOL
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">
                ADD TEACHER
              </h3>
              <p className="text-[#9e9e9e] text-xs mt-1 font-medium">
                Fill in institutional profile details to complete registration.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddTeacherSubmit} className="p-6 space-y-4">
              {/* Field 1: Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
                  NAME
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type="text"
                    required
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="Full Faculty Name"
                    className="w-full pl-10 pr-4 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white"
                  />
                </div>
              </div>

              {/* Field 2: Teacher ID */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
                  TEACHER ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type="text"
                    required
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    placeholder="TCR-2026-XXXX"
                    className="w-full pl-10 pr-4 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white font-mono"
                  />
                </div>
              </div>

              {/* Field 3: Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type={showTeacherPassword ? 'text' : 'password'}
                    required
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-11 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#757575] hover:text-white focus:outline-none cursor-pointer"
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
              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2.5 neu-btn text-[#9e9e9e] hover:text-white font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 neu-btn-accent text-[#0a0f1d] font-bold text-xs tracking-wide flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-[#0a0f1d]" />
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
