'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bell,
  LogOut,
  ChevronDown,
  CheckCircle2,
  X,
  BookOpen,
} from 'lucide-react';

interface NavbarProps {
  role: 'teacher' | 'student';
  userName: string;
  userEmail: string;
  avatarText: string;
  onBrandClick: () => void;
  onSignOut: () => void;
}

export default function Navbar({
  role,
  userName,
  userEmail,
  avatarText,
  onBrandClick,
  onSignOut,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#252525]/95 backdrop-blur-md border-b border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.5)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Platform Branding / Logo */}
        <button
          onClick={onBrandClick}
          className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl neu-card-sm text-white flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform font-black">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-white/80 transition-colors">
                Think<span className="text-white">First</span>
              </span>
            </div>
            <p className="text-[10px] text-[#9e9e9e] font-medium hidden sm:block">
              Agentic AI &amp; Deterministic Mastery
            </p>
          </div>
        </button>

        {/* Right Nav Items */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Role Badge (Crisp White Neumorphic) */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase neu-badge-white">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)] animate-pulse" />
            {role === 'teacher' ? 'Faculty / Teacher' : 'Student Learner'}
          </span>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setDropdownOpen(false);
              }}
              className="relative p-2.5 rounded-xl neu-btn text-[#9e9e9e] hover:text-white transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4 text-white" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#262626] border border-white/5 shadow-[0_16px_36px_rgba(0,0,0,0.65)] py-3 z-50 animate-in fade-in slide-in-from-top-2 text-white">
                <div className="px-4 pb-2 border-b border-white/5 flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Recent Alerts (2)
                  </span>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-[#9e9e9e] hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-white/5 text-xs">
                  <div className="p-3 hover:bg-[#2b2b2b] transition-colors">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      Quiz #06 Graded
                    </div>
                    <p className="text-[#9e9e9e] text-[11px] mt-0.5">
                      Class average: 84% in CS-10A (38/42 submitted).
                    </p>
                  </div>
                  <div className="p-3 hover:bg-[#2b2b2b] transition-colors">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <BookOpen className="w-3.5 h-3.5 text-[#9e9e9e]" />
                      Remediation Alert
                    </div>
                    <p className="text-[#9e9e9e] text-[11px] mt-0.5">
                      4 students need review on Dynamic Programming.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full neu-btn text-white transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-white hidden sm:inline-block">
                {userName}
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#252525] to-[#333333] border border-white/10 text-white flex items-center justify-center text-xs font-black shadow-inner">
                {avatarText}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#9e9e9e]" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#262626] border border-white/5 shadow-[0_16px_36px_rgba(0,0,0,0.65)] py-2 z-50 animate-in fade-in text-white">
                <div className="px-4 py-2.5 border-b border-white/5">
                  <p className="text-xs font-bold text-white truncate">
                    {userName}
                  </p>
                  <p className="text-[11px] text-[#9e9e9e] truncate">{userEmail}</p>
                </div>
                <button
                  onClick={onSignOut}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Distinct Sign Out Button */}
          <button
            onClick={onSignOut}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-btn text-xs font-semibold text-[#9e9e9e] hover:text-white transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-[#9e9e9e]" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
