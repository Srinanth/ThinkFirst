'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import StudentDashboard, {
  CourseItem,
} from '@/components/student/student-dashboard';
import CourseDrilldown, {
  CompletedQuiz,
  OpenQuiz,
} from '@/components/student/course-drilldown';
import QuizTaker from '@/components/student/quiz-taker';
import AiTutorDrawer, { RemediationMissionData } from '@/components/student/ai-tutor-drawer';
import AdmissionModals from '@/components/modals/admission-modals';
import { authApi, subjectsApi, SubjectOffering } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, X, Clock, Calendar } from 'lucide-react';

export default function StudentPage() {
  const router = useRouter();

  // Dynamic Student Profile State
  const [studentName, setStudentName] = useState('Enrolled Student');
  const [studentEmail, setStudentEmail] = useState('');
  const [avatarText, setAvatarText] = useState('ST');
  const [collegeName, setCollegeName] = useState('Faculty of Engineering');
  const [courses, setCourses] = useState<CourseItem[]>([]);

  // Navigation & View States
  const [activeView, setActiveView] = useState<'overview' | 'course' | 'taking_quiz'>('overview');
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<OpenQuiz | null>(null);
  const [activeRemediationMission, setActiveRemediationMission] = useState<RemediationMissionData | null>(null);
  const [tutorForceOpen, setTutorForceOpen] = useState(false);

  // Review Completed Quiz Modal State
  const [reviewedQuiz, setReviewedQuiz] = useState<CompletedQuiz | null>(null);

  // Admission Modals State (Popup A / Popup B)
  const [admissionModal, setAdmissionModal] = useState<{
    isOpen: boolean;
    type: 'student' | 'teacher';
  }>({ isOpen: false, type: 'student' });

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    let isMounted = true;

    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session && isMounted) {
        router.push('/login');
        return;
      }
    });

    // 1. Fetch authenticated student profile
    authApi
      .getMe()
      .then((profile) => {
        if (isMounted && profile) {
          setStudentName(profile.full_name || 'Enrolled Student');
          if (profile.email) setStudentEmail(profile.email);
          if (profile.college) setCollegeName(profile.college);
          const initials = (profile.full_name || 'ST')
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
          setAvatarText(initials || 'ST');
        }
      })
      .catch(() => {});

    // 2. Fetch live enrolled subjects from Supabase backend
    subjectsApi
      .listSubjects()
      .then((liveSubjects) => {
        if (isMounted && liveSubjects && liveSubjects.length > 0) {
          const mappedCourses: CourseItem[] = liveSubjects.map((s: SubjectOffering, idx: number) => {
            return {
              id: s.id,
              code: s.class_name || `SEC-${idx + 1}`,
              title: s.subject,
              instructor: s.profiles?.full_name || 'Faculty Instructor',
              location: s.academic_year || '2025-2026',
              grade: 'Enrolled',
              percentage: 0,
              credits: 4,
              color: '#ffffff',
            };
          });
          setCourses(mappedCourses);
          setSelectedCourse(mappedCourses[0]);
        } else if (isMounted) {
          setCourses([]);
          setSelectedCourse(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCourses([]);
          setSelectedCourse(null);
        }
      });

    return () => {
      isMounted = false;
    };
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

  const handleSelectCourse = (course: CourseItem) => {
    setSelectedCourse(course);
    setActiveView('course');
  };

  const handleStartQuiz = (quiz: OpenQuiz) => {
    setActiveQuiz(quiz);
    setActiveView('taking_quiz');
    showToast(`Entering Proctored Mode for ${quiz.number}. AI Tutor has been temporarily locked.`);
  };

  const handleFinishQuiz = (score: number) => {
    setActiveView('course');
    setActiveQuiz(null);
    showToast(`Quiz completed with ${score}%! AI Tutor is now re-enabled.`);
  };

  const handleStartRemediation = (mission: RemediationMissionData) => {
    setActiveRemediationMission(mission);
    setActiveView('course');
    setActiveQuiz(null);
    setTutorForceOpen(true);
    showToast(`Remediation Mission launched: ${mission.title}! Action widgets ready.`);
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col font-sans relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl neu-card-raised border border-white/10 text-white shadow-[0_12px_32px_rgba(0,0,0,0.7)] animate-in slide-in-from-top-2 text-xs font-bold">
          <CheckCircle className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75 cursor-pointer text-[#9e9e9e] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Global Top Navbar */}
      <Navbar
        role="student"
        userName={studentName}
        userEmail={studentEmail}
        avatarText={avatarText}
        onBrandClick={() => setActiveView('overview')}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeView === 'overview' && (
          <StudentDashboard
            onSelectCourse={handleSelectCourse}
            onOpenAddModal={(type) => setAdmissionModal({ isOpen: true, type })}
            courses={courses}
            studentName={studentName}
            collegeName={collegeName}
          />
        )}

        {activeView === 'course' && selectedCourse && (
          <CourseDrilldown
            course={selectedCourse}
            onBack={() => setActiveView('overview')}
            onStartQuiz={handleStartQuiz}
            onReviewQuiz={(quiz) => setReviewedQuiz(quiz)}
          />
        )}

        {activeView === 'taking_quiz' && activeQuiz && (
          <QuizTaker
            quiz={activeQuiz}
            onFinishQuiz={handleFinishQuiz}
            onStartRemediation={handleStartRemediation}
            onCancel={() => {
              setActiveView('course');
              setActiveQuiz(null);
            }}
          />
        )}
      </main>

      {/* Contextual AI Tutor (Method 2 Interactive Action Widgets) */}
      {selectedCourse && (
        <AiTutorDrawer
          currentCourse={`${selectedCourse.code}: ${selectedCourse.title}`}
          subjectId={selectedCourse.id}
          studentName={studentName}
          isVisible={activeView === 'course'}
          isQuizActive={activeView === 'taking_quiz'}
          forceOpen={tutorForceOpen}
          initialMission={activeRemediationMission}
          onClose={() => setTutorForceOpen(false)}
        />
      )}

      {/* Modal: Review Completed Quiz */}
      {reviewedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl neu-card-raised p-6 space-y-5 animate-in zoom-in-95 duration-150 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold neu-card-sm text-white">
                  {reviewedQuiz.number}
                </span>
                <h3 className="text-base font-black text-white">{reviewedQuiz.title}</h3>
              </div>
              <button
                onClick={() => setReviewedQuiz(null)}
                className="p-1 rounded-lg neu-btn text-[#9e9e9e] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl neu-inset space-y-2">
                <p className="text-[#9e9e9e]">
                  Official grading breakdown for submission completed on <strong className="text-white">{reviewedQuiz.date}</strong>.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 font-bold">
                  <span className="text-white">Assessed Score:</span>
                  <span className="text-white font-black">
                    {reviewedQuiz.score} / {reviewedQuiz.maxScore} ({reviewedQuiz.percentage}%)
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl neu-inset border border-white/10 text-[#cccccc] leading-relaxed">
                Deterministic telemetry logged to your Student Mastery Profile. Need guidance? Open the AI Socratic Tutor drawer.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setReviewedQuiz(null)}
                className="px-4 py-2 neu-btn text-xs font-bold text-white hover:text-[#9e9e9e] cursor-pointer"
              >
                Close Solution Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admission Protocols Modals */}
      <AdmissionModals
        isOpen={admissionModal.isOpen}
        type={admissionModal.type}
        onClose={() => setAdmissionModal((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={(msg) => showToast(msg)}
      />
    </div>
  );
}
