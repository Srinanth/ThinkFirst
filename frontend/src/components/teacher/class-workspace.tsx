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
    <div className="space-y-6 animate-in fade-in duration-200 text-slate-800">
      {/* 1. Breadcrumb & Class Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="space-y-2">
          {/* Breadcrumb back button */}
          <button
            onClick={onBackToOverview}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            Back to All Classes
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {cls.name}
            </h1>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold font-mono border border-blue-200">
              {cls.section} &bull; {cls.code}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              {cls.schedule}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {cls.room}
            </span>
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              {cls.studentCount} Active Students
            </span>
          </div>
        </div>

        {/* Quick Overall Mastery Badge */}
        <div className="flex items-center gap-4 bg-blue-50/70 p-4 rounded-2xl border border-blue-100 self-start md:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              Cohort Mastery
            </span>
            <span className="text-2xl font-black text-blue-700">
              {cls.overallMastery}%
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Award className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* 2. Internal Sub-Navigation Bar */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home (Analytics &amp; Insights)
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'quizzes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Quizzes &amp; Assessments ({cls.quizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Student Roster ({cls.students.length})
          </button>
        </div>

        {activeTab === 'quizzes' && (
          <button
            onClick={() => setCreateQuizModalOpen(true)}
            className="mr-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
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
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between text-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Performance Progression Trend
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cohort average vs. institutional benchmark (70%) over past quizzes
                  </p>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                  +16% Growth
                </span>
              </div>

              {/* Responsive Area Chart */}
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={cls.trendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="quiz"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[50, 100]}
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        color: '#0f172a',
                        fontSize: '12px',
                        fontWeight: 600,
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="avgScore"
                      name="Class Average (%)"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorAvg)"
                    />
                    <Area
                      type="monotone"
                      dataKey="benchmark"
                      name="Benchmark (70%)"
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score Distribution Donut Chart (1 Column wide) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between text-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Score Tier Distribution
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Breakdown by mastery achievement levels
                </p>
              </div>

              {/* Donut Chart */}
              <div className="h-56 w-full flex items-center justify-center">
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
                            ? '#2563eb' // Blue-600
                            : index === 1
                            ? '#0ea5e9' // Sky-500
                            : '#f59e0b'; // Amber-500
                        return <Cell key={`cell-${index}`} fill={cellColor} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        color: '#0f172a',
                        border: '1px solid #e2e8f0',
                        fontSize: '11px',
                        fontWeight: 600,
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-[11px] font-bold text-slate-700">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500 font-medium">
                <span className="font-bold text-slate-900">
                  {cls.distributionData[0].value} of {cls.studentCount} students
                </span>{' '}
                achieved Mastered tier (&gt;80%).
              </div>
            </div>
          </div>

          {/* Core Insights Section (3 Structured Cards/Panels) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Panel 1: Weak Areas Panel */}
            <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm flex flex-col justify-between relative overflow-hidden text-slate-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  </div>
                  <span className="text-[11px] font-black text-rose-700 uppercase tracking-wider bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                    Action Needed
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900">
                    Weak Areas Identified
                  </h4>
                  <p className="text-xs text-slate-500">
                    Concepts with low average scores requiring intervention.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {cls.weakAreas.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{item.topic}</span>
                        <span className="text-rose-600 font-mono text-xs font-black">
                          {item.avgScore}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        <strong className="text-slate-800">Remediation:</strong>{' '}
                        {item.remediation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel 2: Strong Areas Panel */}
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm flex flex-col justify-between relative overflow-hidden text-slate-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Class Excels
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900">
                    Strong Areas &amp; Mastery
                  </h4>
                  <p className="text-xs text-slate-500">
                    Concepts where cohort demonstrates solid proficiency.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {cls.strongAreas.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{item.topic}</span>
                        <span className="text-emerald-600 font-mono text-xs font-black">
                          {item.avgScore}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        <strong className="text-slate-800">Observation:</strong>{' '}
                        {item.praise}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel 3: Performance Variation Summary Panel */}
            <div className="bg-white rounded-3xl p-6 border border-blue-200 shadow-sm flex flex-col justify-between relative overflow-hidden text-slate-800">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-black text-blue-700 uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Shift Trajectory
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-black text-slate-900">
                    Performance Shifts
                  </h4>
                  <p className="text-xs text-slate-500">
                    Tracking cohort trajectory following assessments and reviews.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {cls.variationSummary.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {item.quizTitle}
                        </span>
                        <span
                          className={`font-mono font-bold text-xs ${
                            item.isPositive ? 'text-blue-600' : 'text-rose-600'
                          }`}
                        >
                          {item.change}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
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
              <h3 className="text-lg font-black text-slate-900">
                Class Quizzes &amp; Assessments
              </h3>
              <p className="text-xs text-slate-500">
                Manage upcoming and graded assessments for {cls.name}.
              </p>
            </div>
          </div>

          {/* Quiz Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cls.quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:border-blue-400 transition-all flex flex-col justify-between space-y-4 text-slate-800"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        quiz.status === 'Graded'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {quiz.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {quiz.date}
                    </span>
                  </div>

                  <h4 className="text-lg font-black text-slate-900 mt-2">
                    {quiz.title}
                  </h4>

                  {/* Topics Covered */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {quiz.topics.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Completion
                    </span>
                    <span className="text-slate-900 font-black">{quiz.completionRate}%</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Class Average
                    </span>
                    <span
                      className={`text-sm font-black ${
                        quiz.avgScore >= 80
                          ? 'text-blue-600'
                          : quiz.avgScore >= 60
                          ? 'text-sky-600'
                          : 'text-slate-400'
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
              <h3 className="text-lg font-black text-slate-900">
                Student Directory &amp; Mastery Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Individual quiz scores, module progress, and sub-topics mastery index.
              </p>
            </div>

            {/* Search and Topic/Tier Filters */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student or ID..."
                  className="pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48 sm:w-56"
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
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="All">All Mastery Tiers</option>
                <option value="Mastered">Mastered (&gt;80%)</option>
                <option value="Developing">Developing (60-79%)</option>
                <option value="Intervention Needed">Intervention Needed (&lt;60%)</option>
              </select>
            </div>
          </div>

          {/* Master Performance Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                    <th className="py-4 px-6">Student Info</th>
                    <th className="py-4 px-6">Quiz Average</th>
                    <th className="py-4 px-6">Quizzes Done</th>
                    <th className="py-4 px-6">Module Breakdown</th>
                    <th className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 text-blue-600 font-black">
                        Sub-topics Master Score
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No students match the selected search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                      let pillClass = '';
                      if (st.subtopicsMastery >= 80) {
                        pillClass =
                          'bg-blue-50 text-blue-700 border-blue-200 ring-2 ring-blue-500/10';
                      } else if (st.subtopicsMastery >= 60) {
                        pillClass =
                          'bg-sky-50 text-sky-700 border-sky-200 ring-2 ring-sky-500/10';
                      } else {
                        pillClass =
                          'bg-rose-50 text-rose-700 border-rose-200 ring-2 ring-rose-400/20';
                      }

                      return (
                        <tr
                          key={st.id}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          {/* Student Name / ID */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                                {st.avatar}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {st.name}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {st.id} &bull; {st.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Individual Quiz Scores */}
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {st.quizAverage}%
                          </td>

                          {/* Completed Quizzes */}
                          <td className="py-4 px-6 text-slate-600 font-medium">
                            {st.completedQuizzes} / {st.totalQuizzes}
                          </td>

                          {/* Module Breakdown */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {st.moduleBreakdown.map((mb, idx) => (
                                <span
                                  key={idx}
                                  title={`${mb.module}: ${mb.score}%`}
                                  className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600"
                                >
                                  {mb.module.split(' ')[0]}: {mb.score}%
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* CRUCIAL HIGHLIGHT: Sub-topics Master Score Column */}
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-black text-xs border shadow-2xs ${pillClass}`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                + Create New Quiz
              </h3>
              <button
                onClick={() => setCreateQuizModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  placeholder="e.g. Quiz #08 - Dynamic Programming Advanced"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Target Topics
                </label>
                <input
                  type="text"
                  value={newQuizTopic}
                  onChange={(e) => setNewQuizTopic(e.target.value)}
                  placeholder="e.g. Knapsack, LIS, State Compression"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setCreateQuizModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setCreateQuizModalOpen(false);
                  setNewQuizTitle('');
                  setNewQuizTopic('');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
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
