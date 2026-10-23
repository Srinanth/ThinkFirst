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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-2xs text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Platform Branding / Logo */}
        <button
          onClick={onBrandClick}
          className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Edu<span className="text-blue-600">Analytics</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
              Institutional Learning Intelligence
            </p>
          </div>
        </button>

        {/* Right Nav Items */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Role Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            {role === 'teacher' ? 'Faculty / Teacher' : 'Student Learner'}
          </span>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setDropdownOpen(false);
              }}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white animate-pulse" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl py-3 z-50 animate-in fade-in slide-in-from-top-2 text-slate-800">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Recent Alerts (2)
                  </span>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      Quiz #06 Graded
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Class average: 84% in CS-10A (38/42 submitted).
                    </p>
                  </div>
                  <div className="p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                      Remediation Alert
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
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
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
            >
              <span className="text-xs font-bold text-slate-800 hidden sm:inline-block">
                {userName}
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold ring-2 ring-blue-500/20">
                {avatarText}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in text-slate-800">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {userName}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                </div>
                <button
                  onClick={onSignOut}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Distinct Sign Out Button */}
          <button
            onClick={onSignOut}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
