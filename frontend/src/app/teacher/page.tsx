'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import TeacherOverview from '@/components/teacher/teacher-overview';
import ClassWorkspace from '@/components/teacher/class-workspace';
import { ClassData } from '@/data/mock-data';
import { authApi, subjectsApi, SubjectOffering, masteryApi } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { X, Plus, CheckCircle, BookOpen, Loader2 } from 'lucide-react';

export default function TeacherPage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);

  // Authenticated Teacher State
  const [teacherName, setTeacherName] = useState('Faculty Instructor');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [avatarText, setAvatarText] = useState('TC');
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Subject Modal
  const [createSubjectOpen, setCreateSubjectOpen] = useState(false);
  const [subjectTitle, setSubjectTitle] = useState('');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [className, setClassName] = useState('Section Alpha');
  const [creating, setCreating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        router.push('/login');
        return;
      }

      // 1. Fetch live profile
      try {
        const profile = await authApi.getMe();
        if (profile) {
          setTeacherName(profile.full_name || 'Faculty Instructor');
          if (profile.email) setTeacherEmail(profile.email);
          const initials = (profile.full_name || 'TC')
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
          setAvatarText(initials || 'TC');
        }
      } catch (err) {
        console.warn('Could not fetch teacher profile:', err);
      }

      // 2. Fetch live subjects for this teacher with live analytics
      try {
        const liveSubjects = await subjectsApi.listSubjects();
        if (liveSubjects && liveSubjects.length > 0) {
          const mappedClasses: ClassData[] = await Promise.all(
            liveSubjects.map(async (s: SubjectOffering, idx: number) => {
              let overallMastery = 0;
              let trendData: any[] = [];
              let distributionData: any[] = [];
              let strongAreas: any[] = [];
              let variationSummary: any[] = [];

              try {
                const analytics = await masteryApi.getClassAnalytics(s.id);
                if (analytics) {
                  overallMastery = analytics.overallMastery || 0;
                  trendData = analytics.trendData || [];
                  distributionData = analytics.distributionData || [];
                  strongAreas = analytics.strongAreas || [];
                  variationSummary = analytics.variationSummary || [];
                }
              } catch {
                // Keep empty arrays if analytics not available yet
              }

              return {
                id: s.id,
                name: s.subject,
                code: s.class_name || `SEC-${idx + 1}`,
                section: s.academic_year || '2025-2026',
                studentCount: s.studentCount ?? 0,
                overallMastery,
                room: 'Campus Hall',
                schedule: 'Active Term',
                trendData,
                distributionData,
                weakAreas: [],
                strongAreas,
                variationSummary,
                quizzes: [],
                students: [],
              };
            })
          );
          setClasses(mappedClasses);
        } else {
          setClasses([]);
        }
      } catch (err) {
        console.warn('Could not fetch subjects:', err);
        setClasses([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeacherData();
  }, []);

  const handleSignOut = async () => {
    document.cookie = 'thinkfirst_demo_admin=; Max-Age=0; path=/;';
    document.cookie = 'thinkfirst_user_role=; Max-Age=0; path=/;';
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    router.push('/login');
    router.refresh();
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectTitle.trim()) return;

    setCreating(true);
    try {
      const created = await subjectsApi.createSubject({
        subject: subjectTitle,
        academicYear,
        className,
      });

      setToastMessage(`Course "${created.subject}" (${created.class_name}) created successfully!`);
      setCreateSubjectOpen(false);
      setSubjectTitle('');
      await loadTeacherData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create subject offering';
      setToastMessage(`Error: ${msg}`);
    } finally {
      setCreating(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col font-sans">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 neu-card-raised border border-white/20 text-white px-5 py-3 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.7)] flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 shrink-0 text-[#00d2ff]" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75 cursor-pointer text-[#9e9e9e] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Global Top Navbar */}
      <Navbar
        role="teacher"
        userName={teacherName}
        userEmail={teacherEmail}
        avatarText={avatarText}
        onBrandClick={() => setSelectedClass(null)}
        onSignOut={handleSignOut}
      />

      {/* Main Content: VIEW A (Overview) or VIEW B (Detailed Class Workspace) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {selectedClass ? (
          <ClassWorkspace
            cls={selectedClass}
            onBackToOverview={() => setSelectedClass(null)}
          />
        ) : (
          <TeacherOverview
            onSelectClass={(cls) => setSelectedClass(cls)}
            teacherName={teacherName}
            classes={classes}
            onCreateClass={() => setCreateSubjectOpen(true)}
          />
        )}
      </main>

      {/* Modal: Create Subject Offering */}
      {createSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-3xl neu-card-raised border border-white/5 shadow-[0_24px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-150 text-white"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6 border-b border-white/5 relative bg-[#232323]">
              <button
                type="button"
                onClick={() => setCreateSubjectOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-lg neu-btn text-[#9e9e9e] hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-white" />
                ADD SUBJECT OFFERING
              </h3>
              <p className="text-[#9e9e9e] text-xs mt-1 font-medium">
                Create a new course offering with isolated curriculum and student telemetry.
              </p>
            </div>

            <form onSubmit={handleCreateSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
                  COURSE / SUBJECT TITLE
                </label>
                <input
                  type="text"
                  required
                  value={subjectTitle}
                  onChange={(e) => setSubjectTitle(e.target.value)}
                  placeholder="e.g. Advanced Linear Algebra & Vector Calculus"
                  className="w-full px-4 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
                    ACADEMIC YEAR
                  </label>
                  <input
                    type="text"
                    required
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2025-2026"
                    className="w-full px-4 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9e9e9e] mb-1.5">
                    SECTION / CLASS
                  </label>
                  <input
                    type="text"
                    required
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="Section Alpha"
                    className="w-full px-4 py-2.5 neu-input placeholder:text-[#666666] text-sm text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateSubjectOpen(false)}
                  className="px-4 py-2.5 neu-btn text-[#9e9e9e] hover:text-white font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 neu-btn-white text-black font-bold text-xs tracking-wide flex items-center gap-2 cursor-pointer disabled:opacity-50 rounded-xl"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-black" />
                  )}
                  CREATE OFFERING
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
