'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  GraduationCap,
  Users,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export default function AcademicLoginPage() {
  const router = useRouter();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic Role Badge Detection based on User ID prefix (Teacher vs Student)
  const trimmedUpper = userId.trim().toUpperCase();
  let detectedRole: 'teacher' | 'student' | 'admin_redirect' | null = null;

  if (trimmedUpper.startsWith('TCR-') || trimmedUpper.startsWith('TCR')) {
    detectedRole = 'teacher';
  } else if (trimmedUpper.startsWith('STD-') || trimmedUpper.startsWith('STD')) {
    detectedRole = 'student';
  } else if (trimmedUpper.startsWith('ADM-') || trimmedUpper.startsWith('ADM')) {
    detectedRole = 'admin_redirect';
  }

  const handleLogin = (targetId?: string) => {
    setErrorMessage(null);
    const finalId = (targetId ?? userId).trim().toUpperCase();

    if (!finalId) {
      setErrorMessage('Please enter your Institutional ID (e.g. TCR-1042 for Faculty or STD-8821 for Student).');
      return;
    }

    // If an administrator tries to log in here, guide them to the dedicated Admin Portal
    if (finalId.startsWith('ADM-') || finalId.startsWith('ADM')) {
      setErrorMessage('Administrative ID detected. Please sign in via the dedicated Admin Portal at /admin/login.');
      return;
    }

    setLoading(true);

    // ID-based role routing for Faculty and Students
    setTimeout(() => {
      if (finalId.startsWith('TCR-') || finalId.startsWith('TCR')) {
        document.cookie = 'thinkfirst_user_role=teacher; path=/; max-age=86400; SameSite=Lax';
        router.push('/teacher');
      } else if (finalId.startsWith('STD-') || finalId.startsWith('STD')) {
        document.cookie = 'thinkfirst_user_role=student; path=/; max-age=86400; SameSite=Lax';
        router.push('/student');
      } else {
        setLoading(false);
        setErrorMessage(
          'Unrecognized ID format. Academic portal IDs must begin with TCR- (Faculty / Teacher) or STD- (Student Learner).'
        );
      }
    }, 250);
  };

  const handleDemoTeacher = () => {
    setUserId('TCR-1042');
    setPassword('Teacher@2026');
    handleLogin('TCR-1042');
  };

  const handleDemoStudent = () => {
    setUserId('STD-8821');
    setPassword('Student@2026');
    handleLogin('STD-8821');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100 text-slate-800 px-4 py-8 sm:py-12 relative font-sans">
      {/* Background ambient soft blue glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="w-full max-w-[490px] mx-auto my-auto relative z-10">
        {/* Branding & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-2xl bg-white border border-blue-100 shadow-sm mb-4">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900">
              Edu<span className="text-blue-600">Analytics</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-2">
            Academic Portal Login
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
            Faculty &amp; Student Learning Intelligence Portal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/95 rounded-3xl border border-slate-200/80 shadow-xl shadow-blue-500/5 p-7 sm:p-8 space-y-5 backdrop-blur-md">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                {errorMessage}
                {detectedRole === 'admin_redirect' && (
                  <div className="mt-2">
                    <Link
                      href="/admin/login"
                      className="inline-flex items-center gap-1.5 font-bold text-blue-600 underline decoration-blue-600 hover:text-blue-800"
                    >
                      Go to Admin Portal Login &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            {/* User ID Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="userId"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Academic ID <span className="text-blue-600">*</span>
                </label>

                {/* Dynamic Role Badge Indicator */}
                {detectedRole === 'teacher' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 animate-in fade-in">
                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                    Faculty Account
                  </span>
                )}
                {detectedRole === 'student' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-50 text-sky-700 border border-sky-200 animate-in fade-in">
                    <CheckCircle2 className="w-3 h-3 text-sky-600" />
                    Student Account
                  </span>
                )}
                {detectedRole === 'admin_redirect' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 animate-in fade-in">
                    <ShieldAlert className="w-3 h-3 text-amber-600" />
                    Admin ID (Use Admin Portal)
                  </span>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <input
                  id="userId"
                  type="text"
                  required
                  disabled={loading}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter ID (e.g., TCR-1042 or STD-8821)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                />
              </div>

              {/* Dynamic validation hint when no prefix is matched yet */}
              {!detectedRole && userId.length > 0 && (
                <p className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1">
                  Prefix required: Start with <strong className="text-slate-800">TCR-</strong> (Faculty) or <strong className="text-slate-800">STD-</strong> (Student).
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Password <span className="text-blue-600">*</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setErrorMessage('Please use the one-click demo login buttons below for instant testing.');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Forgot Credentials?
                </a>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-blue-600" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded bg-white focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 text-xs font-medium text-slate-600 cursor-pointer select-none"
              >
                Remember Me
              </label>
            </div>

            {/* Primary Action Button (Blue) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Academic Portal
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Divider: ONE-CLICK DEMO LOGIN */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                ONE-CLICK DEMO TESTING
              </span>
            </div>
          </div>

          {/* One-Click Demo Login Switches */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleDemoTeacher}
              className="p-3 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-blue-50/60 hover:border-blue-300 text-slate-800 transition-all text-left flex flex-col justify-between cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between w-full">
                <Users className="w-4 h-4 text-blue-600" />
                <ArrowRight className="w-3 h-3 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="mt-2">
                <span className="font-bold text-xs block text-slate-900 group-hover:text-blue-700">Demo as Teacher</span>
                <span className="text-[10px] text-slate-500 font-mono font-semibold">TCR-1042</span>
              </div>
            </button>

            <button
              type="button"
              onClick={handleDemoStudent}
              className="p-3 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-sky-50/60 hover:border-sky-300 text-slate-800 transition-all text-left flex flex-col justify-between cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center justify-between w-full">
                <GraduationCap className="w-4 h-4 text-sky-600" />
                <ArrowRight className="w-3 h-3 text-sky-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="mt-2">
                <span className="font-bold text-xs block text-slate-900 group-hover:text-sky-700">Demo as Student</span>
                <span className="text-[10px] text-slate-500 font-mono font-semibold">STD-8821</span>
              </div>
            </button>
          </div>

          {/* Dedicated Link to Admin Portal Login */}
          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
              Institutional Administrator? Sign in to Admin Portal &rarr;
            </Link>
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-xs text-slate-500 font-medium">
            Protected by Institutional Role-Based Access Control (RBAC).
          </p>
          <p className="text-[11px] text-slate-400">
            EduAnalytics &copy; 2026 &bull; Real-time AI learning telemetry
          </p>
        </div>
      </div>
    </div>
  );
}
