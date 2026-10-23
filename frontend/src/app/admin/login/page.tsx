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
  GraduationCap,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();

  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    const finalEmail = adminEmail.trim().toLowerCase();
    const finalPassword = password;

    if (!finalEmail) {
      setErrorMessage('Please enter your Administrator Email.');
      return;
    }

    if (!finalPassword) {
      setErrorMessage('Please enter your administrative password.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: finalEmail,
          password: finalPassword,
        });

      if (authError || !authData?.user) {
        setLoading(false);
        setErrorMessage(authError?.message || 'Invalid administrator credentials.');
        return;
      }

      // Check role
      let role = authData.user.user_metadata?.role as string;
      if (!role) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();
        role = profile?.role || 'admin';
      }

      if (role !== 'admin') {
        setLoading(false);
        setErrorMessage('Access denied. This console is restricted to administrators.');
        await supabase.auth.signOut();
        return;
      }

      document.cookie = 'thinkfirst_demo_admin=; Max-Age=0; path=/;';
      document.cookie = 'thinkfirst_user_role=admin; path=/; max-age=86400; SameSite=Lax';
      window.location.href = '/admin';
    } catch (err: unknown) {
      setLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Authentication failed.');
    }
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

          <form onSubmit={handleAdminLogin} className="space-y-4">
            {/* Admin Email Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="adminEmail"
                  className="block text-xs font-bold uppercase tracking-wider text-[#9e9e9e]"
                >
                  Administrator Email <span className="text-white">*</span>
                </label>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <input
                  id="adminEmail"
                  type="email"
                  required
                  disabled={loading}
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@institution.edu"
                  className="w-full pl-10 pr-4 py-2.5 neu-input placeholder:text-[#666666] text-xs sm:text-sm font-medium text-white"
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

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-[#222222] text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-[#9e9e9e]">Remember console session</span>
              </label>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 neu-btn-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 rounded-xl"
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

          {/* Back to Academic Portal Link */}
          <div className="pt-2 text-center border-t border-white/5">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9e9e9e] hover:text-white transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-white" />
              Not an Admin? Go to Faculty &amp; Student Login &rarr;
            </Link>
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
