'use client';

import React, { useState } from 'react';
import { ClassData } from '@/data/mock-data';
import {
  ArrowLeft,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Award,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface ClassWorkspaceProps {
  cls: ClassData;
  onBackToOverview: () => void;
}

export default function ClassWorkspace({
  cls,
  onBackToOverview,
}: ClassWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'quizzes' | 'students'>('home');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState<'All' | 'Mastered' | 'Developing' | 'Intervention Needed'>('All');
  const [createQuizModalOpen, setCreateQuizModalOpen] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizTopic, setNewQuizTopic] = useState('');

  // Filtered Students
  const filteredStudents = cls.students.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      st.id.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesFilter =
      studentFilter === 'All' ? true : st.status === studentFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-white">
      {/* 1. Breadcrumb & Class Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 neu-card-raised p-6">
        <div className="space-y-2">
          {/* Breadcrumb back button */}
          <button
            onClick={onBackToOverview}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9e9e9e] hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            Back to All Classes
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {cls.name}
            </h1>
            <span className="px-3 py-1 rounded-full neu-inset-sm text-white text-xs font-bold font-mono">
              {cls.section} &bull; {cls.code}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#757575] font-medium flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-white" />
              {cls.schedule}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#757575]" />
              {cls.room}
            </span>
            <span className="flex items-center gap-1.5 font-bold text-white">
              {cls.studentCount} Active Students
            </span>
          </div>
        </div>

        {/* Quick Overall Mastery Badge */}
        <div className="flex items-center gap-4 neu-inset p-4 self-start md:self-auto border border-white/10">
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#757575] block">
              Cohort Mastery
            </span>
            <span className="text-2xl font-black text-white">
              {cls.overallMastery}%
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl neu-card-sm text-white flex items-center justify-center font-bold text-sm">
            <Award className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* 2. Internal Sub-Navigation Bar */}
      <div className="neu-card p-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'neu-btn-white text-black'
                : 'neu-btn text-[#9e9e9e] hover:text-white'
            }`}
          >
            Home (Analytics &amp; Insights)
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'quizzes'
                ? 'neu-btn-white text-black'
                : 'neu-btn text-[#9e9e9e] hover:text-white'
            }`}
          >
            Quizzes &amp; Assessments ({cls.quizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'neu-btn-white text-black'
                : 'neu-btn text-[#9e9e9e] hover:text-white'
            }`}
          >
            Student Roster ({cls.students.length})
          </button>
        </div>

        {activeTab === 'quizzes' && (
          <button
            onClick={() => setCreateQuizModalOpen(true)}
            className="mr-2 inline-flex items-center gap-1.5 px-3.5 py-2 neu-btn-accent text-[#0a0f1d] text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Quiz
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. SUB-TAB 1: HOME (ANALYTICS & INSIGHTS)                       */}
      {/* ============================================================== */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Charts Section (Grid Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Trend Chart (2 Columns wide) */}
            <div className="lg:col-span-2 neu-card p-6 flex flex-col justify-between text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-white">
                    Performance Progression Trend
                  </h3>
                  <p className="text-xs text-[#9e9e9e]">
                    Cohort average vs. institutional benchmark (70%) over past quizzes
                  </p>
                </div>
                <span className="text-xs font-bold neu-badge-white px-3 py-1 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                  +16% Growth
                </span>
              </div>

              {/* Responsive Area Chart inside Inset Container */}
              <div className="neu-inset p-3 rounded-2xl h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={cls.trendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorAvgNeu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#00d2ff" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="quiz"
                      stroke="#757575"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[50, 100]}
                      stroke="#757575"
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#262626',
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderRadius: '14px',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="avgScore"
                      name="Class Average (%)"
                      stroke="#00d2ff"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAvgNeu)"
                    />
                    <Area
                      type="monotone"
                      dataKey="benchmark"
                      name="Benchmark (70%)"
                      stroke="#555555"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score Distribution Donut Chart (1 Column wide) */}
            <div className="neu-card p-6 flex flex-col justify-between text-white">
              <div>
                <h3 className="text-base font-black text-white">
                  Score Tier Distribution
                </h3>
                <p className="text-xs text-[#9e9e9e] mb-4">
                  Breakdown by mastery achievement levels
                </p>
              </div>

              {/* Donut Chart inside Recessed Container */}
              <div className="neu-inset p-3 rounded-2xl h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cls.distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {cls.distributionData.map((_entry, index) => {
                        const cellColor =
                          index === 0
                            ? '#00d2ff' // Electric Cyan
                            : index === 1
                            ? '#38bdf8' // Sky Blue
                            : '#8b5cf6'; // Violet
                        return <Cell key={`cell-${index}`} fill={cellColor} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#262626',
                        borderRadius: '12px',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.08)',
                        fontSize: '11px',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-[11px] font-bold text-[#9e9e9e]">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-3 border-t border-white/5 text-center text-xs text-[#757575] font-medium">
                <span className="font-bold text-white">
                  {cls.distributionData[0].value} of {cls.studentCount} students
                </span>{' '}
                achieved Mastered tier (&gt;80%).
              </div>
            </div>
          </div>

          {/* Core Insights Section (3 Structured Neumorphic Panels) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Panel 1: Weak Areas Panel */}
            <div className="neu-card p-6 flex flex-col justify-between relative overflow-hidden text-white border border-rose-500/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl neu-inset text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  </div>
                  <span className="text-[11px] font-black text-rose-300 uppercase tracking-wider bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                    Action Needed
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-white">
                    Weak Areas Identified
                  </h4>
                  <p className="text-xs text-[#9e9e9e]">
                    Concepts with low average scores requiring intervention.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {cls.weakAreas.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl neu-inset text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{item.topic}</span>
                        <span className="text-rose-400 font-mono text-xs font-black">
                          {item.avgScore}%
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9e9e9e] leading-relaxed">
                        <strong className="text-white">Remediation:</strong>{' '}
                        {item.remediation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel 2: Strong Areas Panel */}
            <div className="neu-card p-6 flex flex-col justify-between relative overflow-hidden text-white border border-emerald-500/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl neu-inset text-emerald-400 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-[11px] font-black text-emerald-300 uppercase tracking-wider bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Class Excels
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-white">
                    Strong Areas &amp; Mastery
                  </h4>
                  <p className="text-xs text-[#9e9e9e]">
                    Concepts where cohort demonstrates solid proficiency.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {cls.strongAreas.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl neu-inset text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{item.topic}</span>
                        <span className="text-emerald-400 font-mono text-xs font-black">
                          {item.avgScore}%
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9e9e9e] leading-relaxed">
                        <strong className="text-white">Observation:</strong>{' '}
                        {item.praise}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel 3: Performance Variation Summary Panel */}
            <div className="neu-card p-6 flex flex-col justify-between relative overflow-hidden text-white border border-white/10">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl neu-inset text-white flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider neu-inset-sm px-2.5 py-0.5">
                    Shift Trajectory
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-white">
                    Performance Shifts
                  </h4>
                  <p className="text-xs text-[#9e9e9e]">
                    Tracking cohort trajectory following assessments and reviews.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {cls.variationSummary.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl neu-inset text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">
                          {item.quizTitle}
                        </span>
                        <span
                          className={`font-mono font-bold text-xs ${
                            item.isPositive ? 'text-white' : 'text-rose-400'
                          }`}
                        >
                          {item.change}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9e9e9e] leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SUB-TAB 2: QUIZZES                                          */}
      {/* ============================================================== */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">
                Class Quizzes &amp; Assessments
              </h3>
              <p className="text-xs text-[#9e9e9e]">
                Manage upcoming and graded assessments for {cls.name}.
              </p>
            </div>
          </div>

          {/* Quiz Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cls.quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="neu-card p-6 flex flex-col justify-between space-y-4 text-white hover:border-white/20 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        quiz.status === 'Graded'
                          ? 'neu-badge-white'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {quiz.status}
                    </span>
                    <span className="text-xs text-[#757575] font-medium">
                      {quiz.date}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-white mt-2">
                    {quiz.title}
                  </h4>

                  {/* Topics Covered */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {quiz.topics.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg neu-inset-sm text-[#9e9e9e] text-[11px] font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold">
                  <div>
                    <span className="text-[#757575] block text-[10px] uppercase font-bold">
                      Completion
                    </span>
                    <span className="text-white font-black">{quiz.completionRate}%</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[#757575] block text-[10px] uppercase font-bold">
                      Class Average
                    </span>
                    <span
                      className={`text-sm font-black ${
                        quiz.avgScore >= 80
                          ? 'text-white'
                          : quiz.avgScore >= 60
                          ? 'text-[#9e9e9e]'
                          : 'text-[#757575]'
                      }`}
                    >
                      {quiz.avgScore > 0 ? `${quiz.avgScore}%` : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. SUB-TAB 3: STUDENTS DIRECTORY & MASTER SCORES TABLE          */}
      {/* ============================================================== */}
      {activeTab === 'students' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white">
                Student Directory &amp; Mastery Matrix
              </h3>
              <p className="text-xs text-[#9e9e9e]">
                Individual quiz scores, module progress, and sub-topics mastery index.
              </p>
            </div>

            {/* Search and Topic/Tier Filters */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-white absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student or ID..."
                  className="pl-9 pr-3 py-2 text-xs neu-input text-white placeholder:text-[#666666] w-48 sm:w-56"
                />
              </div>

              {/* Status Filter */}
              <select
                value={studentFilter}
                onChange={(e) =>
                  setStudentFilter(
                    e.target.value as
                      | 'All'
                      | 'Mastered'
                      | 'Developing'
                      | 'Intervention Needed'
                  )
                }
                className="px-3 py-2 text-xs neu-input text-white font-bold cursor-pointer"
              >
                <option value="All" className="bg-[#262626] text-white">All Mastery Tiers</option>
                <option value="Mastered" className="bg-[#262626] text-white">Mastered (&gt;80%)</option>
                <option value="Developing" className="bg-[#262626] text-white">Developing (60-79%)</option>
                <option value="Intervention Needed" className="bg-[#262626] text-white">Intervention Needed (&lt;60%)</option>
              </select>
            </div>
          </div>

          {/* Master Performance Table */}
          <div className="neu-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#222222] border-b border-white/5 text-[11px] font-black uppercase tracking-wider text-[#757575]">
                    <th className="py-4 px-6">Student Info</th>
                    <th className="py-4 px-6">Quiz Average</th>
                    <th className="py-4 px-6">Quizzes Done</th>
                    <th className="py-4 px-6">Module Breakdown</th>
                    <th className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 text-white font-black">
                        Sub-topics Master Score
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#757575]">
                        No students match the selected search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                      let pillClass = '';
                      if (st.subtopicsMastery >= 80) {
                        pillClass = 'neu-badge-white';
                      } else if (st.subtopicsMastery >= 60) {
                        pillClass = 'neu-badge-blue';
                      } else {
                        pillClass = 'bg-rose-950/60 text-rose-300 border-rose-500/30';
                      }

                      return (
                        <tr
                          key={st.id}
                          className="hover:bg-[#202020] transition-colors"
                        >
                          {/* Student Name / ID */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full neu-inset text-white flex items-center justify-center font-bold text-xs">
                                {st.avatar}
                              </div>
                              <div>
                                <span className="font-bold text-white block">
                                  {st.name}
                                </span>
                                <span className="text-[11px] text-[#757575] font-mono">
                                  {st.id} &bull; {st.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Individual Quiz Scores */}
                          <td className="py-4 px-6 font-bold text-white">
                            {st.quizAverage}%
                          </td>

                          {/* Completed Quizzes */}
                          <td className="py-4 px-6 text-[#9e9e9e] font-medium">
                            {st.completedQuizzes} / {st.totalQuizzes}
                          </td>

                          {/* Module Breakdown */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {st.moduleBreakdown.map((mb, idx) => (
                                <span
                                  key={idx}
                                  title={`${mb.module}: ${mb.score}%`}
                                  className="px-2 py-0.5 rounded-md neu-inset-sm text-[10px] font-semibold text-[#9e9e9e]"
                                >
                                  {mb.module.split(' ')[0]}: {mb.score}%
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Sub-topics Master Score Column */}
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-black text-xs border ${pillClass}`}
                            >
                              <Award className="w-3.5 h-3.5" />
                              {st.subtopicsMastery}% &bull; {st.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CREATE NEW QUIZ MODAL                                          */}
      {/* ============================================================== */}
      {createQuizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl neu-card-raised p-6 space-y-4 animate-in zoom-in-95 text-white border border-white/5 shadow-[0_24px_50px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-lg font-black text-white">
                + Create New Quiz
              </h3>
              <button
                onClick={() => setCreateQuizModalOpen(false)}
                className="p-1 rounded-lg text-[#9e9e9e] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#9e9e9e] uppercase mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  placeholder="e.g. Quiz #08 - Dynamic Programming Advanced"
                  className="w-full px-3.5 py-2.5 text-xs neu-input text-white placeholder:text-[#666666]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#9e9e9e] uppercase mb-1">
                  Target Topics
                </label>
                <input
                  type="text"
                  value={newQuizTopic}
                  onChange={(e) => setNewQuizTopic(e.target.value)}
                  placeholder="e.g. Knapsack, LIS, State Compression"
                  className="w-full px-3.5 py-2.5 text-xs neu-input text-white placeholder:text-[#666666]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setCreateQuizModalOpen(false)}
                className="px-4 py-2 neu-btn text-xs font-bold text-[#9e9e9e] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCreateQuizModalOpen(false);
                  setNewQuizTitle('');
                  setNewQuizTopic('');
                }}
                className="px-4 py-2 neu-btn-accent text-[#0a0f1d] text-xs font-bold cursor-pointer"
              >
                Publish Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
