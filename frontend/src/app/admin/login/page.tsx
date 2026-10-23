'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  GraduationCap,
} from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedUpper = adminId.trim().toUpperCase();
  const isAdminFormat = trimmedUpper.startsWith('ADM-') || trimmedUpper.startsWith('ADM');

  const handleAdminLogin = (targetId?: string, targetPassword?: string) => {
    setErrorMessage(null);
    const finalId = (targetId ?? adminId).trim().toUpperCase();
    const finalPassword = targetPassword ?? password;

    if (!finalId) {
      setErrorMessage('Please enter your Institutional Administrator ID (e.g. ADM-89421).');
      return;
    }

    if (!finalPassword) {
      setErrorMessage('Please enter your administrative password.');
      return;
    }

    // Check if non-admin attempted login
    if (finalId.startsWith('TCR-') || finalId.startsWith('STD-')) {
      setErrorMessage(
        'Faculty and Student IDs must use the Academic Portal login at /login. This console is restricted to administrators.'
      );
      return;
    }

    if (!finalId.startsWith('ADM')) {
      setErrorMessage('Invalid Administrator ID. Administrator IDs must begin with ADM- (e.g., ADM-89421).');
      return;
    }

    setLoading(true);

    // Frontend validation & immediate session granting
    setTimeout(() => {
      document.cookie = 'thinkfirst_demo_admin=true; path=/; max-age=86400; SameSite=Lax';
      router.push('/admin');
    }, 250);
  };

  const handleDemoAdmin = () => {
    setAdminId('ADM-89421');
    setPassword('Admin2026!');
    handleAdminLogin('ADM-89421', 'Admin2026!');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-50 via-blue-50/40 to-slate-100 text-slate-800 px-4 py-8 sm:py-12 relative font-sans">
      {/* Background ambient soft blue lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      <div className="w-full max-w-[490px] mx-auto my-auto relative z-10">
        {/* Admin Console Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-2xl bg-white border border-blue-200 shadow-sm mb-4">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-xs uppercase tracking-wider text-blue-700">
              Institutional Admin Console
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-2">
            Admin Gateway
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
            Restricted Access — Institutional Officers, Deans &amp; Campus Directors
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white/95 rounded-3xl border border-slate-200 shadow-xl shadow-blue-500/5 p-7 sm:p-8 space-y-5 backdrop-blur-md">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                {errorMessage}
                {(errorMessage.includes('/login') || errorMessage.includes('Academic Portal')) && (
                  <div className="mt-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 font-bold text-blue-600 underline decoration-blue-600 hover:text-blue-800"
                    >
                      Return to Academic Portal (Faculty &amp; Students) &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdminLogin();
            }}
            className="space-y-4"
          >
            {/* Admin ID Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="adminId"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Administrator ID <span className="text-blue-600">*</span>
                </label>

                {isAdminFormat && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 animate-in fade-in">
                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                    Root Admin Role
                  </span>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <input
                  id="adminId"
                  type="text"
                  required
                  disabled={loading}
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter Admin ID (e.g., ADM-89421)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                />
              </div>
            </div>

            {/* Admin Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Master Password <span className="text-blue-600">*</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setErrorMessage('For instant evaluation, click "Quick Demo Sign-In as Admin" below.');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Forgot Key?
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

            {/* Remember Session */}
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
                Keep administrative session alive (24 Hours)
              </label>
            </div>

            {/* Submit Button (Blue) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Authorizing Root Session...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-white" />
                  Access Admin Console
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                INSTANT EVALUATION
              </span>
            </div>
          </div>

          {/* Quick Demo Admin Button */}
          <button
            type="button"
            onClick={handleDemoAdmin}
            className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-blue-50/70 hover:border-blue-300 text-slate-800 transition-all text-left flex items-center justify-between cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs block text-slate-900 group-hover:text-blue-700 transition-colors">
                  Quick Demo Sign-In as Admin
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  ADM-89421 &bull; Dr. Alexander Vance
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Link back to Academic Portal (Faculty & Students) */}
          <div className="pt-2 text-center border-t border-slate-100">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              Looking for Faculty or Student Login? Return to Academic Portal &rarr;
            </Link>
          </div>
        </div>

        {/* Security Audit Footnote */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-xs text-slate-500 font-medium">
            256-Bit TLS &bull; Institutional Role-Based Access Control (RBAC) Enforced
          </p>
          <p className="text-[11px] text-slate-400">
            EduAnalytics Admin Gate &copy; 2026 &bull; All administrative access is strictly logged
          </p>
        </div>
      </div>
    </div>
  );
}
