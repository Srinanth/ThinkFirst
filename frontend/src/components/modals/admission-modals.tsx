'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
} from 'lucide-react';

interface AdmissionModalsProps {
  isOpen: boolean;
  type: 'student' | 'teacher';
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function AdmissionModals({
  isOpen,
  type,
  onClose,
  onSuccess,
}: AdmissionModalsProps) {
  const [name, setName] = useState('');
  const [idValue, setIdValue] = useState(type === 'student' ? 'STD-2026-' : 'TCR-2026-');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !idValue || !password) return;

    if (type === 'student') {
      onSuccess(`Student "${name}" (${idValue}) enrolled successfully!`);
    } else {
      onSuccess(`Faculty Member "${name}" (${idValue}) onboarded successfully!`);
    }

    setName('');
    setIdValue(type === 'student' ? 'STD-2026-' : 'TCR-2026-');
    setPassword('');
    onClose();
  };

  const isStudent = type === 'student';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-slate-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black tracking-wider uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" /> ADMISSIONS PROTOCOL
          </div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900">
            {isStudent ? 'ADD STUDENT' : 'ADD TEACHER'}
          </h3>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Fill in institutional profile details to complete registration.
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Field 1: Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              NAME
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Field 2: Student ID or Teacher ID */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {isStudent ? 'STUDENT ID' : 'TEACHER ID'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <input
                type="text"
                required
                value={idValue}
                onChange={(e) => setIdValue(e.target.value)}
                placeholder={isStudent ? 'STD-2026-XXXX' : 'TCR-2026-XXXX'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
              />
            </div>
          </div>

          {/* Field 3: Password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 text-blue-600" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle className="w-4 h-4 text-white" />
              {isStudent ? 'ADD STUDENT' : 'ADD TEACHER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
