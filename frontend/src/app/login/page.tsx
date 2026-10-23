'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AcademicLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    const targetEmail = email.trim().toLowerCase();
    const targetPassword = password;

    if (!targetEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!targetPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: targetPassword,
      });

      if (error || !data?.user) {
        setLoading(false);
        setErrorMessage(error?.message || 'Invalid email or password.');
        return;
      }

      // Determine user role from Supabase user_metadata or profiles table
      let role = data.user.user_metadata?.role as string;
      if (!role) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        role = profile?.role || 'student';
      }

      // Clear legacy demo cookies and set authenticated role cookie
      document.cookie = 'thinkfirst_demo_admin=; Max-Age=0; path=/;';
      document.cookie = `thinkfirst_user_role=${role}; path=/; max-age=86400; SameSite=Lax`;

      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'teacher') {
        router.push('/teacher');
      } else {
        router.push('/student');
      }

      router.refresh();
    } catch (err: unknown) {
      setLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Sign in failed.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#1e1e1e] text-white px-4 py-8 sm:py-12 relative font-sans">
      <div className="w-full max-w-[490px] mx-auto my-auto relative z-10">
        {/* Branding & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full neu-card-sm border border-white/10 shadow-md mb-4">
            <div className="w-7 h-7 rounded-lg neu-inset text-white flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">
              Edu<span className="text-white">Analytics</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Academic Portal Login
          </h1>
          <p className="text-[#9e9e9e] text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
            Faculty &amp; Student Learning Intelligence Portal
          </p>
        </div>

        {/* Neumorphic Raised Login Form Card */}
        <div className="neu-card-raised p-7 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in leading-relaxed shadow-inner">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-[#9e9e9e]"
                >
                  Email Address <span className="text-white">*</span>
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu or teacher@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 neu-input placeholder:text-[#666666] text-xs sm:text-sm font-medium text-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#9e9e9e]"
                >
                  Password <span className="text-white">*</span>
                </label>
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
                    <EyeOff className="w-4 h-4 text-white" />
                  ) : (
                    <Eye className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-[#222222] text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-[#9e9e9e]">Remember my session</span>
              </label>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 neu-btn-primary font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0a0f1d]" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Academic Portal
                  <ArrowRight className="w-4 h-4 text-[#0a0f1d]" />
                </>
              )}
            </button>
          </form>

          {/* Dedicated Link to Admin Portal Login */}
          <div className="pt-2 text-center border-t border-white/5">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9e9e9e] hover:text-white transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
              Institutional Administrator? Sign in to Admin Portal &rarr;
            </Link>
          </div>
        </div>

        {/* Footer Security Note */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-xs text-[#757575] font-medium">
            Protected by Institutional Role-Based Access Control (RBAC).
          </p>
          <p className="text-[11px] text-[#555555]">
            ThinkFirst &copy; 2026 &bull; Real-time Agentic AI &amp; Deterministic Mastery
          </p>
        </div>
      </div>
    </div>
  );
}
