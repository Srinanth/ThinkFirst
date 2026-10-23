'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
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
import { API_BASE_URL } from '@/lib/api';

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
      setErrorMessage('Please enter your institutional email address.');
      return;
    }

    if (!targetPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate via server-side bcrypt endpoint
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setLoading(false);
        setErrorMessage(json.error?.message || 'Invalid email or password.');
        return;
      }

      const { user, session } = json.data;

      // 2. Synchronize Supabase browser client session
      if (session?.access_token && session?.refresh_token) {
        try {
          const supabase = createClient();
          await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          });
        } catch (sessErr) {
          console.warn('Session hydration warning:', sessErr);
        }
      }

      // 3. Set authenticated role cookie
      document.cookie = 'thinkfirst_demo_admin=; Max-Age=0; path=/;';
      document.cookie = `thinkfirst_user_role=${user.role}; path=/; max-age=86400; SameSite=Lax`;

      const targetPath =
        user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student';
      window.location.href = targetPath;
    } catch (err: unknown) {
      setLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Sign in failed.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">
      {/* ═══════════════════════════════════════════════════════════════
          LEFT SIDE — Login Form (Dark Sleek Theme from dev/antony)
          ═══════════════════════════════════════════════════════════════ */}
      <div
        className="w-full lg:w-1/2 min-h-screen flex flex-col justify-between items-center px-6 sm:px-10 lg:px-12 py-8 sm:py-10"
        style={{ background: '#0a0a0a' }}
      >
        {/* Top: Brand Logo */}
        <div className="w-full flex items-center justify-start">
          <span className="font-extrabold text-3xl tracking-tight text-white">
            Think<span className="text-[#a1a1aa]" style={{ color: '#3A86FF' }}>First</span>
          </span>
        </div>

        {/* Middle: Login Form */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1.5">
              Welcome back
            </h1>
            <p className="text-[#a1a1aa] text-sm">
              Please enter your institutional credentials to sign in.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              className="mb-5 p-3.5 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed"
              style={{
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid rgba(220, 38, 38, 0.25)',
                color: '#fca5a5',
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider"
                >
                  Institutional Email
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-[#52525b]" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-[#3f3f46] transition-all duration-200 outline-none"
                  style={{
                    background: '#18181b',
                    border: '1px solid #27272a',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#52525b';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.05)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#27272a';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider"
                >
                  Password
                </label>
                <span className="text-xs font-medium text-[#52525b]">
                  Protected by RBAC
                </span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-[#52525b]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder:text-[#3f3f46] transition-all duration-200 outline-none"
                  style={{
                    background: '#18181b',
                    border: '1px solid #27272a',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#52525b';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.05)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#27272a';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#52525b] hover:text-white focus:outline-none cursor-pointer transition-colors"
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

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#27272a] bg-[#18181b] text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-[#a1a1aa]">Remember my session</span>
              </label>
            </div>

            {/* Primary Sign In Button — High contrast tactile white */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all duration-200 active:scale-[0.98]"
              style={{
                background: '#ffffff',
                color: '#0a0a0a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e4e4e7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>

          {/* Admin link */}
          <div className="mt-6 text-center">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#52525b] hover:text-white transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Administrator? Sign in to Admin Portal &rarr;
            </Link>
          </div>
        </div>

        {/* Bottom: Footer */}
        <div className="w-full max-w-[420px] text-center space-y-1">
          <p className="text-[11px] text-[#52525b]">
            Protected by Institutional Role-Based Access Control (RBAC).
          </p>
          <p className="text-[11px] text-[#3f3f46]">
            ThinkFirst &copy; 2026 &bull; AI-Powered Learning Intelligence
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          RIGHT SIDE — Fitted Image from dev/antony
          ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block w-1/2 min-h-screen relative overflow-hidden bg-black">
        <img
          src="/images/knowledge-illuminated.jpg"
          alt="ThinkFirst — Knowledge Illuminated"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>
    </div>
  );
}
