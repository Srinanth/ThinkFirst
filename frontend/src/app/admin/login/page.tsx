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
import { createClient } from '@/lib/supabase/client';

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

  const handleAdminLogin = async (targetId?: string, targetPassword?: string) => {
    setErrorMessage(null);
    const finalId = (targetId ?? adminId).trim();
    const finalPassword = targetPassword ?? password;

    if (!finalId) {
      setErrorMessage('Please enter your Institutional Administrator ID (e.g. ADM-89421).');
      return;
    }

    if (!finalPassword) {
      setErrorMessage('Please enter your administrative password.');
      return;
    }

    if (finalId.toUpperCase().startsWith('TCR-') || finalId.toUpperCase().startsWith('STD-')) {
      setErrorMessage(
        'Faculty and Student IDs must use the Academic Portal login at /login. This console is restricted to administrators.'
      );
      return;
    }

    if (!finalId.toUpperCase().startsWith('ADM') && !finalId.includes('@')) {
      setErrorMessage('Invalid Administrator ID. Administrator IDs must begin with ADM- (e.g., ADM-89421).');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const resolvedEmail = finalId.includes('@')
        ? finalId
        : 'admin@institution.edu';

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: resolvedEmail,
          password: finalPassword,
        });

      if (authError || !authData?.session) {
        setLoading(false);
        setErrorMessage(authError?.message || 'Invalid administrator credentials.');
        return;
      }

      document.cookie = 'thinkfirst_demo_admin=true; path=/; max-age=86400; SameSite=Lax';
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Authentication failed.');
    }
  };

  const handleDemoAdmin = () => {
    setAdminId('ADM-89421');
    setPassword('Admin2026!');
    handleAdminLogin('ADM-89421', 'Admin2026!');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#1e1e1e] text-white px-4 py-8 sm:py-12 relative font-sans">
      <div className="w-full max-w-[490px] mx-auto my-auto relative z-10">
        {/* Admin Console Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full neu-card-sm border border-white/10 mb-4">
            <div className="w-7 h-7 rounded-lg neu-inset text-white flex items-center justify-center font-black">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-xs uppercase tracking-wider text-white">
              Institutional Admin Console
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Admin Gateway
          </h1>
          <p className="text-[#9e9e9e] text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
            Restricted Access — Institutional Officers, Deans &amp; Campus Directors
          </p>
        </div>

        {/* Neumorphic Raised Form Card */}
        <div className="neu-card-raised p-7 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in leading-relaxed shadow-inner">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">
                {errorMessage}
                {(errorMessage.includes('/login') || errorMessage.includes('Academic Portal')) && (
                  <div className="mt-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 font-bold text-white underline hover:text-[#9e9e9e]"
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
                  className="block text-xs font-bold uppercase tracking-wider text-[#9e9e9e]"
                >
                  Administrator ID <span className="text-white">*</span>
                </label>

                {isAdminFormat && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black neu-badge-white animate-in fade-in">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    Root Admin Role
                  </span>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <input
                  id="adminId"
                  type="text"
                  required
                  disabled={loading}
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter Admin ID (e.g., ADM-89421)"
                  className="w-full pl-10 pr-4 py-2.5 neu-input placeholder:text-[#666666] text-xs sm:text-sm font-medium font-mono text-white"
                />
              </div>
            </div>

            {/* Admin Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#9e9e9e]"
                >
                  Master Password <span className="text-white">*</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setErrorMessage('For instant evaluation, click "Quick Demo Sign-In as Admin" below.');
                  }}
                  className="text-xs font-semibold text-white hover:underline"
                >
                  Need Credentials?
                </a>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#757575] hover:text-white focus:outline-none cursor-pointer"
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
                className="w-4 h-4 accent-white rounded bg-[#181818] border border-white/10 cursor-pointer"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 text-xs font-medium text-[#9e9e9e] cursor-pointer select-none"
              >
                Keep Active Admin Session
              </label>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 neu-btn-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0a0f1d]" />
                  Authorizing Console...
                </>
              ) : (
                <>
                  Authenticate Admin Console
                  <ArrowRight className="w-4 h-4 text-[#0a0f1d]" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Sign-In as Admin */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="w-full p-3.5 neu-btn text-left flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl neu-inset flex items-center justify-center text-white">
                  <KeyRound className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-xs block text-white group-hover:text-white transition-colors">
                    Quick Demo Sign-In as Admin
                  </span>
                  <span className="text-[10px] text-[#9e9e9e] font-mono">
                    ID: ADM-89421 &bull; Faculty of Engineering
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#757575] group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            {/* Back to Academic Portal Link */}
            <div className="text-center pt-1">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9e9e9e] hover:text-white transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5 text-white" />
                Not an Admin? Go to Faculty &amp; Student Login &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-xs text-[#757575] font-medium">
            System activity is cryptographically signed and logged.
          </p>
          <p className="text-[11px] text-[#555555]">
            ThinkFirst Admin Core &copy; 2026 &bull; Higher Education Division
          </p>
        </div>
      </div>
    </div>
  );
}
