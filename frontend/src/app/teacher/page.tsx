'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import TeacherOverview from '@/components/teacher/teacher-overview';
import ClassWorkspace from '@/components/teacher/class-workspace';
import { ClassData } from '@/data/mock-data';

export default function TeacherPage() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);

  const handleSignOut = () => {
    document.cookie = 'thinkfirst_demo_admin=; Max-Age=0; path=/;';
    document.cookie = 'thinkfirst_user_role=; Max-Age=0; path=/;';
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col font-sans">
      {/* Global Top Navbar */}
      <Navbar
        role="teacher"
        userName="Prof. Sarah Connor"
        userEmail="s.connor@eduanalytics.org"
        avatarText="SC"
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
            teacherName="Prof. Sarah Connor"
          />
        )}
      </main>
    </div>
  );
}
