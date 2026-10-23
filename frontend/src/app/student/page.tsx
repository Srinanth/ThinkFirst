'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import StudentDashboard, {
  CourseItem,
  ENROLLED_COURSES,
} from '@/components/student/student-dashboard';
import CourseDrilldown, {
  CompletedQuiz,
  OpenQuiz,
} from '@/components/student/course-drilldown';
import QuizTaker from '@/components/student/quiz-taker';
import AiTutorDrawer from '@/components/student/ai-tutor-drawer';
import AdmissionModals from '@/components/modals/admission-modals';
import { CheckCircle, X, Clock, Calendar } from 'lucide-react';

export default function StudentPage() {
  const router = useRouter();

  // Navigation & View States
  // 'overview' -> Workspace 1 Dashboard
  // 'course' -> Course-Specific Drilldown (CS-204)
  // 'taking_quiz' -> Proctored Active Quiz (AI Tutor Disabled)
  const [activeView, setActiveView] = useState<'overview' | 'course' | 'taking_quiz'>('overview');
  const [selectedCourse, setSelectedCourse] = useState<CourseItem>(ENROLLED_COURSES[0]);
  const [activeQuiz, setActiveQuiz] = useState<OpenQuiz | null>(null);

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

  const handleSignOut = () => {
    document.cookie = 'thinkfirst_demo_admin=; Max-Age=0; path=/;';
    document.cookie = 'thinkfirst_user_role=; Max-Age=0; path=/;';
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-blue-600 text-white shadow-xl animate-in slide-in-from-top-2 text-xs font-bold border border-white/20">
          <CheckCircle className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-75 cursor-pointer text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Global Top Navbar */}
      <Navbar
        role="student"
        userName="Alex Johnson"
        userEmail="alex.johnson@edu.org"
        avatarText="AJ"
        onBrandClick={() => setActiveView('overview')}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeView === 'overview' && (
          <StudentDashboard
            onSelectCourse={handleSelectCourse}
            onOpenAddModal={(type) => setAdmissionModal({ isOpen: true, type })}
          />
        )}

        {activeView === 'course' && (
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
            onCancel={() => {
              setActiveView('course');
              setActiveQuiz(null);
            }}
          />
        )}
      </main>

      {/* Contextual AI Tutor: Active in course drilldown, completely disabled/hidden during quiz attempt */}
      <AiTutorDrawer
        currentCourse={`${selectedCourse.code}: ${selectedCourse.title}`}
        isVisible={activeView === 'course'}
        isQuizActive={activeView === 'taking_quiz'}
      />

      {/* Review Completed Quiz Modal */}
      {reviewedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                  {reviewedQuiz.number}
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Assessment Solution &amp; Rubric
                </h3>
              </div>
              <button
                onClick={() => setReviewedQuiz(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-base font-black text-slate-900">{reviewedQuiz.title}</h4>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  {reviewedQuiz.date}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {reviewedQuiz.duration}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Official Score</p>
                  <p className="text-xl font-black text-blue-600">
                    {reviewedQuiz.score} / {reviewedQuiz.maxScore}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {reviewedQuiz.percentage}% (High Mastery)
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                All 10 multiple-choice and reasoning proofs satisfied the grading rubric with zero conceptual flaws.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setReviewedQuiz(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admissions Modals (Popup A: Add Student / Popup B: Add Teacher) */}
      <AdmissionModals
        isOpen={admissionModal.isOpen}
        type={admissionModal.type}
        onClose={() => setAdmissionModal({ isOpen: false, type: 'student' })}
        onSuccess={showToast}
      />
    </div>
  );
}
