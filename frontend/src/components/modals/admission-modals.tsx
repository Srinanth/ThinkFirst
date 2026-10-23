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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-3xl neu-card-raised border border-white/5 shadow-[0_24px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-150 text-white"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 relative bg-[#232323]">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 p-1.5 rounded-lg text-[#9e9e9e] hover:text-white neu-btn cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full neu-inset-sm text-white text-[10px] font-black tracking-wider uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_white] animate-pulse" /> ADMISSIONS PROTOCOL
          </div>
          <h3 className="text-2xl font-black tracking-tight text-white">
            {isStudent ? 'ADD STUDENT' : 'ADD TEACHER'}
          </h3>
          <p className="text-[#9e9e9e] text-xs mt-1 font-medium">
            Fill in institutional profile details to complete registration.
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Field 1: Name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
              NAME
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                <User className="w-4 h-4 text-white" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white"
              />
            </div>
          </div>

          {/* Field 2: Student ID or Teacher ID */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
              {isStudent ? 'STUDENT ID' : 'TEACHER ID'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <input
                type="text"
                required
                value={idValue}
                onChange={(e) => setIdValue(e.target.value)}
                placeholder={isStudent ? 'STD-2026-XXXX' : 'TCR-2026-XXXX'}
                className="w-full pl-10 pr-4 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white font-mono"
              />
            </div>
          </div>

          {/* Field 3: Password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#757575]">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 neu-btn text-[#9e9e9e] hover:text-white font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 neu-btn-accent text-[#0a0f1d] font-bold text-xs tracking-wide flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-[#0a0f1d]" />
              {isStudent ? 'ADD STUDENT' : 'ADD TEACHER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
