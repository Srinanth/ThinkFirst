'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Loader2 } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      router.push('/admin/login');
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loggingOut}
      className="inline-flex items-center gap-2 px-3.5 py-2 neu-btn text-[#9e9e9e] hover:text-rose-400 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
    >
      {loggingOut ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <LogOut className="w-3.5 h-3.5" />
      )}
      Sign Out
    </button>
  );
}
