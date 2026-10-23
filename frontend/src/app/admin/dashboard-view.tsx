'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { authApi, AdminStats, UserProfile } from '@/lib/api';
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
  BookOpen,
  Loader2,
  Mail,
} from 'lucide-react';

interface DashboardViewProps {
  adminName: string;
  adminEmail: string;
  collegeName: string;
}

export default function DashboardView({
  adminName: initialAdminName,
  adminEmail: initialAdminEmail,
  collegeName: initialCollegeName,
}: DashboardViewProps) {
  const router = useRouter();
  const supabase = createClient();

  // Dynamic Profile & Stats State from Backend
  const [adminName, setAdminName] = useState(initialAdminName);
  const [adminEmail, setAdminEmail] = useState(initialAdminEmail);
  const [collegeName, setCollegeName] = useState(initialCollegeName);
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalSubjects: 0,
    totalQuizzes: 0,
    totalMaterials: 0,
  });
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  const generateRandomId = (prefix: 'STD' | 'TCR') =>
    `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  // Student Form State
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentId, setStudentId] = useState(() =>
    generateRandomId('STD')
  );
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  // Teacher Form State
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherId, setTeacherId] = useState(() =>
    generateRandomId('TCR')
  );
  const [teacherPassword, setTeacherPassword] = useState('');
  const [showTeacherPassword, setShowTeacherPassword] = useState(false);

  // Notification / Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const loadBackendData = async () => {
    try {
      setLoading(true);
      // 1. Fetch current profile
      try {
        const me = await authApi.getMe();
        if (me) {
          setAdminName(me.full_name || initialAdminName);
          if (me.college) setCollegeName(me.college);
        }
      } catch {
        // Fallback to initial props
      }

      // 2. Fetch system statistics
      try {
        const statsData = await authApi.getStats();
        setStats(statsData);
      } catch (err) {
        console.warn('Could not fetch admin stats:', err);
      }

      // 3. Fetch active profiles
      try {
        const profilesData = await authApi.listProfiles();
        setProfiles(profilesData || []);
      } catch (err) {
        console.warn('Could not list profiles:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  const handleSignOut = async () => {
    document.cookie = 'thinkfirst_demo_admin=; Max-Age=0; path=/;';
    document.cookie = 'thinkfirst_user_role=; Max-Age=0; path=/;';
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const handleAddStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentId) return;

    const email =
      studentEmail.trim() ||
      `${studentId.toLowerCase().replace(/[^a-z0-9]/g, '')}@institution.edu`;

    setSubmitting(true);
    try {
      await authApi.createUser({
        email,
        fullName: studentName,
        role: 'student',
        password: studentPassword || 'Student@2026',
        college: collegeName,
        loginId: studentId,
      });

      setToastMessage(`Student "${studentName}" (${studentId}) enrolled in Supabase!`);
      setIsStudentModalOpen(false);
      setStudentName('');
      setStudentEmail('');
      setStudentId('STD-2026-');
      setStudentPassword('');
      setShowStudentPassword(false);
      await loadBackendData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Enrollment failed';
      setToastMessage(`Error: ${msg}`);
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleAddTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || !teacherId) return;

    const email =
      teacherEmail.trim() ||
      `${teacherId.toLowerCase().replace(/[^a-z0-9]/g, '')}@institution.edu`;

    setSubmitting(true);
    try {
      await authApi.createUser({
        email,
        fullName: teacherName,
        role: 'teacher',
        password: teacherPassword || 'Teacher@2026',
        college: collegeName,
        loginId: teacherId,
      });

      setToastMessage(`Faculty "${teacherName}" (${teacherId}) registered in Supabase!`);
      setIsTeacherModalOpen(false);
      setTeacherName('');
      setTeacherEmail('');
      setTeacherId('TCR-2026-');
      setTeacherPassword('');
      setShowTeacherPassword(false);
      await loadBackendData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setToastMessage(`Error: ${msg}`);
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
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

      {/* 1. Top Navigation Bar */}
      <header className="bg-[#252525]/95 border-b border-white/5 sticky top-0 z-30 shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl neu-card-sm text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-white uppercase">
                ADMIN PORTAL &bull; LIVE TELEMETRY
              </p>
              <h1 className="text-base font-black text-white tracking-tight leading-none">
                Admin Gateway
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={loadBackendData}
              className="relative p-2.5 rounded-xl neu-btn text-[#9e9e9e] hover:text-white transition-colors cursor-pointer"
              title="Refresh Telemetry"
              aria-label="Refresh Telemetry"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00d2ff] shadow-[0_0_6px_#00d2ff]" />
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
        {/* 2. Hero Banner Card */}
        <div className="neu-card-raised p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 text-white">
          <div className="space-y-3 z-10 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full neu-inset-sm text-xs font-bold text-white border border-white/10">
                &bull; Live Postgres &amp; Auth Synchronized
              </span>
              <span className="px-3 py-1 rounded-full neu-inset-sm text-xs font-bold text-[#00d2ff]">
                {collegeName}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {adminName}
            </h2>
            <p className="text-[#9e9e9e] text-sm leading-relaxed">
              Campus operations and deterministic mastery models are actively operating.
            </p>
          </div>

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
              Live Enrollment Actions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Action Card 1: ADD STUDENT */}
            <button
              type="button"
              onClick={() => {
                setStudentId(generateRandomId('STD'));
                setIsStudentModalOpen(true);
              }}
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
                  Enroll new learner into Supabase Auth &amp; Profiles
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs text-[#757575] font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-[#00d2ff] shadow-[0_0_6px_#00d2ff]" />
                &bull; Admissions Protocol Open
              </div>
            </button>

            {/* Action Card 2: ADD TEACHER */}
            <button
              type="button"
              onClick={() => {
                setTeacherId(generateRandomId('TCR'));
                setIsTeacherModalOpen(true);
              }}
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
                  Onboard faculty instructor with curriculum management rights
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs text-[#757575] font-semibold">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                &bull; Staff Portal
              </div>
            </button>
          </div>
        </section>

        {/* 4. Live Backend Metrics: CAMPUS PULSE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black tracking-wider text-[#757575] uppercase">
              CAMPUS PULSE &bull; BACKEND TELEMETRY
            </h3>
            <span className="text-xs font-semibold text-[#00d2ff] uppercase tracking-wider">
              Live Database State
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1: Total Students */}
            <div className="neu-card p-6 flex items-center justify-between text-white">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#757575] uppercase tracking-wide">
                  Enrolled Students
                </span>
                <div className="text-3xl font-black text-white tracking-tight">
                  {loading ? '...' : stats.totalStudents}
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-white pt-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#00d2ff]" />
                  Active in database
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl neu-inset text-white flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-[#00d2ff]" />
              </div>
            </div>

            {/* Metric 2: Faculty */}
            <div className="neu-card p-6 flex items-center justify-between text-white">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#757575] uppercase tracking-wide">
                  Faculty &amp; Staff
                </span>
                <div className="text-3xl font-black text-white tracking-tight">
                  {loading ? '...' : stats.totalTeachers}
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#9e9e9e] pt-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                  Instructors
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl neu-inset text-white flex items-center justify-center">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
            </div>

            {/* Metric 3: Active Subjects */}
            <div className="neu-card p-6 flex items-center justify-between text-white">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#757575] uppercase tracking-wide">
                  Class Offerings
                </span>
                <div className="text-3xl font-black text-white tracking-tight">
                  {loading ? '...' : stats.totalSubjects}
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#9e9e9e] pt-1">
                  Cohorts active
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl neu-inset text-white flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#8b5cf6]" />
              </div>
            </div>

            {/* Metric 4: Evaluator Quizzes */}
            <div className="neu-card p-6 flex items-center justify-between text-white">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#757575] uppercase tracking-wide">
                  Published Quizzes
                </span>
                <div className="text-3xl font-black text-white tracking-tight">
                  {loading ? '...' : stats.totalQuizzes}
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#9e9e9e] pt-1">
                  AI Evaluated
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl neu-inset text-white flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#00d2ff]" />
              </div>
            </div>
          </div>
        </section>

        {/* 5. Live Profiles Roster Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black tracking-wider text-[#757575] uppercase">
              REGISTERED CAMPUS DIRECTORY &bull; LIVE POSTGRES
            </h3>
            <span className="text-xs font-semibold text-[#9e9e9e]">
              {profiles.length} Total Users
            </span>
          </div>

          <div className="neu-card overflow-hidden">
            {profiles.length === 0 ? (
              <div className="p-8 text-center text-[#9e9e9e] text-sm">
                No user profiles retrieved yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#202020] text-[#757575] font-black uppercase tracking-wider border-b border-white/5">
                    <tr>
                      <th className="py-3.5 px-6">Roll / Staff ID</th>
                      <th className="py-3.5 px-6">Name</th>
                      <th className="py-3.5 px-6">Role</th>
                      <th className="py-3.5 px-6">Email Address</th>
                      <th className="py-3.5 px-6">College Affiliation</th>
                      <th className="py-3.5 px-6">Enrolled Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[#d0d0d0]">
                    {profiles.map((p) => {
                      const displayId =
                        p.login_id ||
                        (p.role === 'student'
                          ? `STD-${p.id.slice(0, 4).toUpperCase()}`
                          : p.role === 'teacher'
                          ? `TCR-${p.id.slice(0, 4).toUpperCase()}`
                          : `ADM-${p.id.slice(0, 4).toUpperCase()}`);

                      return (
                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-6 font-mono font-bold">
                            <span className="px-2.5 py-1 rounded-lg neu-inset-sm text-xs text-[#00d2ff] border border-[#00d2ff]/20">
                              {displayId}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 font-bold text-white flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg neu-inset text-white flex items-center justify-center font-bold text-[10px]">
                              {p.full_name?.slice(0, 2).toUpperCase() || 'U'}
                            </div>
                            <span>{p.full_name}</span>
                          </td>
                          <td className="py-3.5 px-6">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                p.role === 'admin'
                                  ? 'bg-[#00d2ff]/10 text-[#00d2ff] border border-[#00d2ff]/30'
                                  : p.role === 'teacher'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              }`}
                            >
                              {p.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-[#9e9e9e] font-mono">
                            {p.email || `${p.role}.${p.id.slice(0, 6)}@institution.edu`}
                          </td>
                          <td className="py-3.5 px-6 text-[#9e9e9e]">
                            {p.college || 'ThinkFirst Institute'}
                          </td>
                          <td className="py-3.5 px-6 text-[#757575]">
                            {new Date(p.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* POPUP A: Add Student Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-3xl neu-card-raised border border-white/5 shadow-[0_24px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-150 text-white"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6 border-b border-white/5 relative bg-[#232323]">
              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg neu-btn text-[#9e9e9e] hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-black tracking-tight text-white">
                ADD STUDENT
              </h3>
              <p className="text-[#9e9e9e] text-xs mt-1 font-medium">
                Enrolls a student directly into Supabase Auth and Profiles table.
              </p>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
                  FULL NAME
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
                    placeholder="e.g. Maya Chen"
                    className="w-full pl-10 pr-4 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
                  EMAIL ADDRESS (OPTIONAL)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="maya.chen@institution.edu"
                    className="w-full pl-10 pr-4 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white"
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
                  PASSWORD (OPTIONAL, DEFAULTS TO Student@2026)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type={showStudentPassword ? 'text' : 'password'}
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="Student@2026"
                    className="w-full pl-10 pr-11 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStudentPassword(!showStudentPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#757575] hover:text-white focus:outline-none cursor-pointer"
                  >
                    {showStudentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

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
                  disabled={submitting}
                  className="px-5 py-2.5 neu-btn-accent text-[#0a0f1d] font-bold text-xs tracking-wide flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0a0f1d]" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-[#0a0f1d]" />
                  )}
                  ENROLL STUDENT
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
            <div className="p-6 border-b border-white/5 relative bg-[#232323]">
              <button
                type="button"
                onClick={() => setIsTeacherModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg neu-btn text-[#9e9e9e] hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-black tracking-tight text-white">
                ADD TEACHER
              </h3>
              <p className="text-[#9e9e9e] text-xs mt-1 font-medium">
                Registers new faculty with curriculum management permissions.
              </p>
            </div>

            <form onSubmit={handleAddTeacherSubmit} className="p-6 space-y-4">
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

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
                  EMAIL ADDRESS (OPTIONAL)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type="email"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    placeholder="faculty@institution.edu"
                    className="w-full pl-10 pr-4 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white"
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
                  PASSWORD (OPTIONAL, DEFAULTS TO Teacher@2026)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <input
                    type={showTeacherPassword ? 'text' : 'password'}
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="Teacher@2026"
                    className="w-full pl-10 pr-11 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#757575] hover:text-white focus:outline-none cursor-pointer"
                  >
                    {showTeacherPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

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
                  disabled={submitting}
                  className="px-5 py-2.5 neu-btn-accent text-[#0a0f1d] font-bold text-xs tracking-wide flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0a0f1d]" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-[#0a0f1d]" />
                  )}
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
