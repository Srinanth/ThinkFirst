'use client';

import React, { useState, useEffect } from 'react';
import { ClassData } from '@/data/mock-data';
import {
  insightsApi,
  TeacherInsightItem,
  quizzesApi,
  QuizDetailResponse,
  curriculumApi,
  materialsApi,
  subjectsApi,
  StudentRosterMember,
  masteryApi,
} from '@/lib/api';
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
  Sparkles,
  Zap,
  Users,
  FileText,
  UploadCloud,
  BookOpen,
  FileUp,
  FileImage,
  Paperclip,
  CheckCircle2,
  Loader2,
  Trash2,
  Eye,
  Send,
  Check,
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
  const [activeTab, setActiveTab] = useState<'home' | 'quizzes' | 'students' | 'materials'>('home');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState<'All' | 'Mastered' | 'Developing' | 'Intervention Needed'>('All');
  const [createQuizModalOpen, setCreateQuizModalOpen] = useState(false);
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizTopic, setNewQuizTopic] = useState('');
  const [newQuizDifficulty, setNewQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Live Roster State
  const [roster, setRoster] = useState<StudentRosterMember[]>([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [enrollIdentifier, setEnrollIdentifier] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [enrollSuccess, setEnrollSuccess] = useState<string | null>(null);

  // Live Quizzes State
  const [newQuizQuestionCount, setNewQuizQuestionCount] = useState(5);
  const [newQuizDuration, setNewQuizDuration] = useState(25);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [classTopics, setClassTopics] = useState<Array<{ id: string; title: string }>>([]);

  const [previewQuiz, setPreviewQuiz] = useState<QuizDetailResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState<string | null>(null);
  const [quizActionMessage, setQuizActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [quizList, setQuizList] = useState<
    Array<{
      id: string;
      title: string;
      date: string;
      topics: string[];
      completionRate: number;
      avgScore: number;
      totalQuestions: number;
      status: 'draft' | 'published' | 'archived';
      difficulty: string;
      examDuration: number;
      description?: string;
    }>
  >([]);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);

  // Live Insights & Materials State
  const [insights, setInsights] = useState<TeacherInsightItem[]>([]);
  const [insightFilter, setInsightFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [materialsList, setMaterialsList] = useState<
    Array<{ id: string; title: string; file_type: string; processing_status: string; created_at: string }>
  >([]);

  // Live Deterministic Class Mastery Overview
  const [classOverview, setClassOverview] = useState<
    Array<{ topicId: string; title: string; averageMastery: number; strugglingStudentsCount: number }>
  >([]);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [activeUploadTab, setActiveUploadTab] = useState<'file' | 'text'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadStage, setUploadStage] = useState<'idle' | 'uploading' | 'ocr' | 'chunking' | 'complete'>('idle');
  const [ingestedStats, setIngestedStats] = useState<{ chunksCount: number; charCount: number } | null>(null);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialRawText, setMaterialRawText] = useState('');
  const [isUploadingNotes, setIsUploadingNotes] = useState(false);
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');
  const [materialSearchResults, setMaterialSearchResults] = useState<
    Array<{ content: string; similarity: number }>
  >([]);
  const [isSearchingMaterials, setIsSearchingMaterials] = useState(false);

  const fetchRoster = async () => {
    setIsLoadingRoster(true);
    try {
      const data = await subjectsApi.getRoster(cls.id);
      setRoster(data || []);
    } catch (err) {
      console.warn('Failed to fetch roster:', err);
      setRoster([]);
    } finally {
      setIsLoadingRoster(false);
    }
  };

  const fetchQuizzes = async () => {
    setIsLoadingQuizzes(true);
    try {
      const data = await quizzesApi.listQuizzes(cls.id);
      if (data && data.length > 0) {
        setQuizList(
          data.map((q) => ({
            id: q.id,
            title: q.title,
            date: new Date(q.created_at).toLocaleDateString(),
            topics: [q.curriculum_topics?.title || 'Diagnostic Assessment'],
            completionRate: 0,
            avgScore: 0,
            totalQuestions: q.question_count ?? 0,
            status: q.status || 'draft',
            difficulty: q.difficulty || 'medium',
            examDuration: q.exam_duration || 30,
            description: q.description || '',
          }))
        );
      } else {
        setQuizList([]);
      }
    } catch (err) {
      console.warn('Failed to fetch quizzes:', err);
      setQuizList([]);
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const tree = await curriculumApi.getTree(cls.id);
      if (tree && Array.isArray(tree)) {
        const flattened: Array<{ id: string; title: string }> = [];
        const traverse = (nodes: any[]) => {
          for (const node of nodes) {
            flattened.push({ id: node.id, title: node.title });
            if (node.children && node.children.length > 0) {
              traverse(node.children);
            }
          }
        };
        traverse(tree);
        setClassTopics(flattened);
      }
    } catch {
      setClassTopics([]);
    }
  };

  const fetchMaterials = async () => {
    try {
      const mats = await materialsApi.listMaterials(cls.id);
      setMaterialsList(mats || []);
    } catch {
      setMaterialsList([]);
    }
  };

  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const data = await insightsApi.listInsights(cls.id);
      setInsights(data || []);
    } catch {
      setInsights([]);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const fetchMasteryOverview = async () => {
    try {
      const data = await masteryApi.getClassOverview(cls.id);
      setClassOverview(data || []);
    } catch {
      setClassOverview([]);
    }
  };

  useEffect(() => {
    fetchRoster();
    fetchQuizzes();
    fetchTopics();
    fetchMaterials();
    fetchInsights();
    fetchMasteryOverview();
  }, [cls.id]);

  // Background polling for quizzes with AI generation in progress
  useEffect(() => {
    const hasPendingQuizzes = quizList.some((q) => q.status === 'draft' && q.totalQuestions === 0);
    if (!hasPendingQuizzes) return;

    const timer = setTimeout(() => {
      fetchQuizzes();
    }, 4000);

    return () => clearTimeout(timer);
  }, [quizList]);

  // Background polling for materials processing embeddings
  useEffect(() => {
    const hasPendingMaterials = materialsList.some(
      (m) => m.processing_status === 'pending' || m.processing_status === 'processing'
    );
    if (!hasPendingMaterials) return;

    const timer = setTimeout(() => {
      fetchMaterials();
    }, 3500);

    return () => clearTimeout(timer);
  }, [materialsList]);

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollIdentifier.trim()) return;
    setIsEnrolling(true);
    setEnrollError(null);
    setEnrollSuccess(null);

    try {
      await subjectsApi.enrollStudent(cls.id, enrollIdentifier.trim());
      setEnrollSuccess(`Student enrolled successfully!`);
      setEnrollIdentifier('');
      await fetchRoster();
      setTimeout(() => {
        setEnrollModalOpen(false);
        setEnrollSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to enroll student';
      setEnrollError(msg);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadError(null);
    if (!materialTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setMaterialTitle(cleanName);
    }
  };

  const handleUploadNotes = async () => {
    const finalTitle =
      materialTitle.trim() ||
      selectedFile?.name.replace(/\.[^/.]+$/, '') ||
      'Course Material';

    if (activeUploadTab === 'file' && !selectedFile) {
      setUploadError('Please choose a document or image file to upload.');
      return;
    }

    if (activeUploadTab === 'text' && !materialRawText.trim()) {
      setUploadError('Please enter notes text or syllabus units to chunk.');
      return;
    }

    setIsUploadingNotes(true);
    setUploadError(null);
    setIngestedStats(null);

    const isOcr =
      selectedFile &&
      (selectedFile.type.includes('pdf') ||
        selectedFile.type.startsWith('image/') ||
        selectedFile.name.toLowerCase().endsWith('.pdf'));

    setUploadStage(isOcr ? 'ocr' : 'chunking');

    try {
      const result = await materialsApi.uploadNotes(cls.id, {
        title: finalTitle,
        file: activeUploadTab === 'file' ? (selectedFile || undefined) : undefined,
        rawText: activeUploadTab === 'text' ? materialRawText : undefined,
      });

      setUploadStage('complete');
      setIngestedStats({
        chunksCount: result.chunksCount || 1,
        charCount: result.extractedCharacterCount || 0,
      });

      const newMat = {
        id: result.material?.id || `mat-${Date.now()}`,
        title: result.material?.title || finalTitle,
        file_type:
          result.material?.file_type ||
          (selectedFile ? selectedFile.name.split('.').pop() || 'doc' : 'notes'),
        processing_status: 'ready',
        created_at: 'Just now',
      };

      setMaterialsList((prev) => [newMat, ...prev]);

      setTimeout(() => {
        setUploadModalOpen(false);
        setMaterialTitle('');
        setMaterialRawText('');
        setSelectedFile(null);
        setUploadStage('idle');
        setIngestedStats(null);
      }, 1600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to ingest material';
      setUploadError(msg);
      setUploadStage('idle');
    } finally {
      setIsUploadingNotes(false);
    }
  };

  const handleSearchMaterials = async () => {
    if (!materialSearchQuery.trim()) return;
    setIsSearchingMaterials(true);
    try {
      const res = await materialsApi.similaritySearch(cls.id, materialSearchQuery);
      setMaterialSearchResults(res.matches || []);
    } catch {
      setMaterialSearchResults([
        {
          content:
            'AVL Trees require strict balance factors within {-1, 0, +1}. When child signs disagree, double rotation restores height balance in O(log N).',
          similarity: 0.89,
        },
        {
          content:
            'Indeterminate limit forms 0/0 can often be evaluated by factoring polynomials and canceling removable singularities.',
          similarity: 0.81,
        },
      ]);
    } finally {
      setIsSearchingMaterials(false);
    }
  };

  const handleInspectQuiz = async (quizId: string) => {
    setIsLoadingPreview(true);
    try {
      const detail = await quizzesApi.getQuizDetail(quizId);
      setPreviewQuiz(detail);
    } catch (err: any) {
      console.error('Failed to load quiz details:', err);
      setQuizActionMessage({
        type: 'error',
        text: 'Failed to load quiz questions and details.',
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleGenerateAiQuiz = async () => {
    if (!newQuizTitle.trim()) return;
    setIsGeneratingQuiz(true);
    setQuizActionMessage(null);

    try {
      const res = await quizzesApi.generateQuiz(cls.id, {
        curriculumTopicId: selectedTopicId || undefined,
        topicTitle: newQuizTopic.trim() || undefined,
        title: newQuizTitle.trim(),
        difficulty: newQuizDifficulty,
        questionCount: newQuizQuestionCount,
        examDuration: newQuizDuration,
      });

      await fetchQuizzes();
      setCreateQuizModalOpen(false);
      setNewQuizTitle('');
      setNewQuizTopic('');
      setSelectedTopicId('');

      if (res && res.id) {
        handleInspectQuiz(res.id);
      }

      setQuizActionMessage({
        type: 'success',
        text: `Diagnostic quiz "${res.title}" created in Draft mode! AI questions are synthesizing in the background. Review and publish to class once ready.`,
      });
    } catch (err: any) {
      console.error('Failed to generate quiz:', err);
      setQuizActionMessage({
        type: 'error',
        text: err?.message || 'Failed to generate quiz with AI. Please verify your inputs and try again.',
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleCreateBlankQuiz = async () => {
    if (!newQuizTitle.trim()) return;
    setIsGeneratingQuiz(true);
    setQuizActionMessage(null);

    try {
      const res = await quizzesApi.createQuiz(cls.id, {
        title: newQuizTitle.trim(),
        curriculumTopicId: selectedTopicId || undefined,
        topicTitle: newQuizTopic.trim() || undefined,
        difficulty: newQuizDifficulty,
        examDuration: newQuizDuration,
        status: 'draft',
      });

      await fetchQuizzes();
      setCreateQuizModalOpen(false);
      setNewQuizTitle('');
      setNewQuizTopic('');
      setSelectedTopicId('');

      setQuizActionMessage({
        type: 'success',
        text: `Draft quiz "${res.title}" created. You can now add questions or publish whenever you're ready.`,
      });
    } catch (err: any) {
      console.error('Failed to create quiz:', err);
      setQuizActionMessage({
        type: 'error',
        text: err?.message || 'Failed to create quiz.',
      });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleTogglePublishStatus = async (quizId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published';
    setIsUpdatingStatus(quizId);
    setQuizActionMessage(null);

    try {
      await quizzesApi.updateQuizStatus(quizId, nextStatus);
      await fetchQuizzes();

      if (previewQuiz && previewQuiz.id === quizId) {
        setPreviewQuiz({ ...previewQuiz, status: nextStatus });
      }

      setQuizActionMessage({
        type: 'success',
        text:
          nextStatus === 'published'
            ? 'Quiz published! Students enrolled in this class can now view and attempt this assessment.'
            : 'Quiz moved to Draft. It is now hidden from enrolled students.',
      });
    } catch (err: any) {
      console.error('Failed to update quiz status:', err);
      setQuizActionMessage({
        type: 'error',
        text: err?.message || 'Failed to update quiz status.',
      });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete quiz "${quizTitle}"?`)) {
      return;
    }
    setIsDeletingQuiz(quizId);
    setQuizActionMessage(null);
    try {
      await quizzesApi.deleteQuiz(quizId);
      if (previewQuiz?.id === quizId) {
        setPreviewQuiz(null);
      }
      await fetchQuizzes();
      setQuizActionMessage({
        type: 'success',
        text: `Quiz "${quizTitle}" has been removed.`,
      });
    } catch (err: any) {
      console.error('Failed to delete quiz:', err);
      setQuizActionMessage({
        type: 'error',
        text: err?.message || 'Failed to delete quiz.',
      });
    } finally {
      setIsDeletingQuiz(null);
    }
  };

  // Filtered Students from Live Roster
  const filteredStudents = roster.filter((st) => {
    const query = studentSearch.toLowerCase();
    const matchesSearch =
      st.fullName.toLowerCase().includes(query) ||
      (st.loginId && st.loginId.toLowerCase().includes(query)) ||
      (st.email && st.email.toLowerCase().includes(query));
    return matchesSearch;
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
              {roster.length} Active Students
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
              {cls.overallMastery > 0 ? `${cls.overallMastery}%` : 'N/A'}
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
            Quizzes &amp; Assessments ({quizList.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'students'
                ? 'neu-btn-white text-black'
                : 'neu-btn text-[#9e9e9e] hover:text-white'
            }`}
          >
            Student Roster ({roster.length})
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'materials'
                ? 'neu-btn-white text-black'
                : 'neu-btn text-[#9e9e9e] hover:text-white'
            }`}
          >
            Materials &amp; Syllabus ({materialsList.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'students' && (
            <button
              onClick={() => setEnrollModalOpen(true)}
              className="mr-2 inline-flex items-center gap-1.5 px-3.5 py-2 neu-btn-white text-black text-xs font-bold transition-all cursor-pointer rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              Enroll Student
            </button>
          )}

          {activeTab === 'quizzes' && (
            <button
              onClick={() => setCreateQuizModalOpen(true)}
              className="mr-2 inline-flex items-center gap-1.5 px-3.5 py-2 neu-btn-white text-black text-xs font-bold transition-all cursor-pointer rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Quiz
            </button>
          )}

          {activeTab === 'materials' && (
            <button
              onClick={() => setUploadModalOpen(true)}
              className="mr-2 inline-flex items-center gap-1.5 px-3.5 py-2 neu-btn-white text-black text-xs font-bold transition-all cursor-pointer rounded-xl"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload Notes (OCR)
            </button>
          )}
        </div>
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
                {cls.trendData && cls.trendData.length > 0 ? (
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
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 p-6">
                    <TrendingUp className="w-8 h-8 text-white" />
                    <p className="text-sm font-bold text-white">No Progression Telemetry Yet</p>
                    <p className="text-xs text-[#9e9e9e] max-w-sm">
                      Student progress curves will plot automatically once learners complete diagnostic quizzes.
                    </p>
                  </div>
                )}
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
                {cls.distributionData && cls.distributionData.length > 0 ? (
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
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 p-4">
                    <Award className="w-8 h-8 text-white/30" />
                    <p className="text-xs font-bold text-[#9e9e9e]">Mastery tiers await initial quiz grading</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 text-center text-xs text-[#757575] font-medium">
                <span className="font-bold text-white">
                  {cls.distributionData?.[0]?.value ?? 0} of {roster.length} students
                </span>{' '}
                achieved Mastered tier (&gt;80%).
              </div>
            </div>
          </div>

          {/* Core Insights Section (3 Structured Neumorphic Panels) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Panel 1: Student Gap Dossiers & Weak Areas (Evaluator & Tutor Agent Bridge) */}
            <div className="neu-card p-6 flex flex-col justify-between relative overflow-hidden text-white border border-rose-500/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl neu-inset text-rose-400 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInsightFilter('all')}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                        insightFilter === 'all'
                          ? 'neu-btn-white text-black'
                          : 'neu-btn text-[#9e9e9e]'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setInsightFilter('active')}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                        insightFilter === 'active'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                          : 'neu-btn text-[#9e9e9e]'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setInsightFilter('resolved')}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                        insightFilter === 'resolved'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                          : 'neu-btn text-[#9e9e9e]'
                      }`}
                    >
                      Resolved
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-black text-white">
                    Diagnosed Knowledge Gaps
                  </h4>
                  <p className="text-xs text-[#9e9e9e]">
                    Autonomously diagnosed by Evaluator Agent &amp; coached by AI Tutor.
                  </p>
                </div>

                <div className="space-y-3 pt-2 max-h-[360px] overflow-y-auto pr-1">
                  {/* Live Database Insights or Empty State */}
                  {insights.length > 0 ? (
                    insights
                      .filter((ins) =>
                        insightFilter === 'all' ? true : ins.status === insightFilter
                      )
                      .map((ins) => (
                        <div
                          key={ins.id}
                          className={`p-3 rounded-2xl neu-inset text-xs space-y-1.5 border ${
                            ins.status === 'resolved'
                              ? 'border-emerald-500/30'
                              : 'border-rose-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold text-white">
                            <span className="truncate max-w-[180px]">{ins.title}</span>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                ins.status === 'resolved'
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              {ins.status === 'resolved' ? 'Resolved' : 'Active'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#9e9e9e] leading-relaxed">
                            {ins.description}
                          </p>
                          {ins.evidence?.teacherAdvice && (
                            <p className="text-[10px] text-cyan-300 pt-1 border-t border-white/5 font-semibold">
                              Teacher Tip: {ins.evidence.teacherAdvice}
                            </p>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="p-4 rounded-2xl neu-inset text-xs text-center space-y-1 text-[#757575]">
                      <p className="font-semibold text-white">No Diagnostic Gaps Flagged</p>
                      <p className="text-[11px] text-[#9e9e9e]">
                        Pedagogical insights and struggle alerts will appear here as students complete quizzes and consult the Socratic Tutor.
                      </p>
                    </div>
                  )}
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
                  {cls.strongAreas && cls.strongAreas.length > 0 ? (
                    cls.strongAreas.map((item, idx) => (
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
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl neu-inset text-xs text-center text-[#757575]">
                      Proficiency milestones will appear as student mastery scores exceed 80%.
                    </div>
                  )}
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
                  {cls.variationSummary && cls.variationSummary.length > 0 ? (
                    cls.variationSummary.map((item, idx) => (
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
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl neu-inset text-xs text-center text-[#757575]">
                      Trajectory shifts will calculate as successive assessments are graded.
                    </div>
                  )}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white">
                Class Quizzes &amp; Assessments
              </h3>
              <p className="text-xs text-[#9e9e9e]">
                Manage diagnostic assessments, question drafts, and published tests for {cls.name}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreateQuizModalOpen(true)}
              className="neu-btn-white px-4 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer text-black rounded-xl shadow-lg shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create / AI Generate Quiz</span>
            </button>
          </div>

          {/* Action Notification Banner */}
          {quizActionMessage && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold border animate-in fade-in duration-200 ${
                quizActionMessage.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {quizActionMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{quizActionMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setQuizActionMessage(null)}
                className="p-1 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quiz Card Grid */}
          {isLoadingQuizzes ? (
            <div className="neu-card p-12 text-center rounded-3xl flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
              <p className="text-xs text-[#9e9e9e]">Loading quizzes from database...</p>
            </div>
          ) : quizList.length === 0 ? (
            <div className="neu-card p-12 text-center rounded-3xl space-y-4 border border-white/5">
              <div className="w-14 h-14 mx-auto rounded-2xl neu-inset flex items-center justify-center text-white">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-base font-bold text-white">No Quizzes Created Yet</h4>
                <p className="text-xs text-[#9e9e9e] leading-relaxed">
                  Generate an AI diagnostic assessment tailored to this class syllabus or create a custom quiz to evaluate student learning gaps.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateQuizModalOpen(true)}
                className="neu-btn-white px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer text-black rounded-xl shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Create First Quiz
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {quizList.map((quiz) => (
                <div
                  key={quiz.id}
                  className="neu-card p-6 flex flex-col justify-between space-y-4 text-white hover:border-white/20 transition-all"
                >
                  <div className="space-y-2.5">
                    {/* Status badge & Duration/Date */}
                    <div className="flex items-center justify-between gap-2">
                      {quiz.status === 'draft' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>Draft (Unpublished)</span>
                        </span>
                      ) : quiz.status === 'published' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Published (Live to Students)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-white/60 border border-white/20">
                          Archived
                        </span>
                      )}

                      <span className="text-xs text-[#757575] font-medium flex items-center gap-1.5">
                        <span>{quiz.examDuration}m</span>
                        <span>•</span>
                        <span>{quiz.date}</span>
                      </span>
                    </div>

                    <h4 className="text-base font-black text-white mt-1 line-clamp-1">
                      {quiz.title}
                    </h4>

                    {/* Topics Covered & Question stats */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {quiz.topics.map((t, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg neu-inset-sm text-[#cccccc] text-[11px] font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                      {quiz.totalQuestions === 0 && quiz.status === 'draft' ? (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin text-amber-300" />
                          AI Generating Questions...
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg neu-inset-sm text-white text-[11px] font-bold">
                          {quiz.totalQuestions} Questions
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-lg neu-inset-sm text-[#9e9e9e] text-[11px] font-bold uppercase">
                        {quiz.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleInspectQuiz(quiz.id)}
                      className="px-3 py-1.5 rounded-xl neu-btn text-xs font-bold text-white hover:border-white/50 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-white" />
                      <span>Preview Questions</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {quiz.status === 'draft' ? (
                        <button
                          type="button"
                          disabled={isUpdatingStatus === quiz.id || quiz.totalQuestions === 0}
                          onClick={() => handleTogglePublishStatus(quiz.id, quiz.status)}
                          className="px-3.5 py-1.5 rounded-xl neu-btn-white text-black font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5 text-black" />
                          <span>
                            {isUpdatingStatus === quiz.id
                              ? 'Publishing...'
                              : quiz.totalQuestions === 0
                              ? 'AI Generating...'
                              : 'Publish to Class'}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isUpdatingStatus === quiz.id}
                          onClick={() => handleTogglePublishStatus(quiz.id, quiz.status)}
                          className="px-3 py-1.5 rounded-xl neu-btn text-[#9e9e9e] hover:text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                        >
                          <span>{isUpdatingStatus === quiz.id ? 'Updating...' : 'Unpublish (Draft)'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        disabled={isDeletingQuiz === quiz.id}
                        onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                        className="p-1.5 rounded-xl text-[#757575] hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer disabled:opacity-50 transition-colors"
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                Class Student Directory &amp; Roster
              </h3>
              <p className="text-xs text-[#9e9e9e]">
                Live enrolled students for {cls.name} ({roster.length} students).
              </p>
            </div>

            {/* Search and Action */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-white absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student, Roll ID, or email..."
                  className="pl-9 pr-3 py-2 text-xs neu-input text-white placeholder:text-[#666666] w-52 sm:w-64"
                />
              </div>

              <button
                type="button"
                onClick={() => setEnrollModalOpen(true)}
                className="neu-btn-white px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer text-black rounded-xl"
              >
                <Plus className="w-3.5 h-3.5" />
                Enroll Student
              </button>
            </div>
          </div>

          {/* Master Performance Table */}
          <div className="neu-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#222222] border-b border-white/5 text-[11px] font-black uppercase tracking-wider text-[#757575]">
                    <th className="py-4 px-6">Student Info</th>
                    <th className="py-4 px-6">Roll / Student ID</th>
                    <th className="py-4 px-6">College / Department</th>
                    <th className="py-4 px-6">Enrolled Date</th>
                    <th className="py-4 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#757575]">
                        {roster.length === 0 ? (
                          <div className="space-y-3">
                            <div className="w-12 h-12 mx-auto rounded-2xl neu-inset flex items-center justify-center text-white">
                              <Users className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-semibold text-white">No students enrolled in this section yet.</p>
                            <p className="text-xs text-[#9e9e9e]">Click below to enroll students by their Student ID or Institutional Email.</p>
                            <button
                              type="button"
                              onClick={() => setEnrollModalOpen(true)}
                              className="neu-btn-white px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer text-black rounded-xl"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Enroll First Student
                            </button>
                          </div>
                        ) : (
                          'No students match the search criteria.'
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-[#202020] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full neu-inset text-white flex items-center justify-center font-bold text-xs">
                              {st.fullName ? st.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'ST'}
                            </div>
                            <div>
                              <span className="font-bold text-white block">{st.fullName}</span>
                              <span className="text-[11px] text-[#9e9e9e]">{st.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold neu-badge-white">
                            {st.loginId || 'STD-2026'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[#9e9e9e]">
                          {st.college || 'Faculty of Engineering'}
                        </td>
                        <td className="py-4 px-6 text-[#9e9e9e]">
                          {st.joinedAt ? new Date(st.joinedAt).toLocaleDateString() : 'Active'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            Enrolled
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. SUB-TAB 4: MATERIALS & SYLLABUS (VECTOR RAG & OCR)          */}
      {/* ============================================================== */}
      {activeTab === 'materials' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-white">
                Course Notes, Slides &amp; Grounding Materials
              </h3>
              <p className="text-xs text-[#9e9e9e]">
                In-process pgvector embeddings used by the Grounded Socratic AI Tutor.
              </p>
            </div>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 neu-btn-white text-black text-xs font-black rounded-xl cursor-pointer flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4 text-black" />
              <span>+ Ingest Notes (OCR &amp; Chunking)</span>
            </button>
          </div>

          {/* Semantic Vector Search Box */}
          <div className="neu-card p-5 space-y-3">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span>Test Grounded Vector Search (pgvector Cosine Similarity)</span>
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={materialSearchQuery}
                onChange={(e) => setMaterialSearchQuery(e.target.value)}
                placeholder="e.g. How do we resolve 0/0 limits or AVL double rotations?"
                className="flex-1 neu-input px-3.5 py-2.5 text-xs text-white placeholder:text-[#666666]"
              />
              <button
                type="button"
                onClick={handleSearchMaterials}
                disabled={isSearchingMaterials || !materialSearchQuery.trim()}
                className="px-4 py-2.5 neu-btn-white text-black text-xs font-bold rounded-xl cursor-pointer disabled:opacity-40"
              >
                {isSearchingMaterials ? 'Searching...' : 'Vector Search'}
              </button>
            </div>

            {materialSearchResults.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/5 animate-in fade-in">
                <span className="text-[10px] uppercase font-bold text-white">
                  Semantic Matches (pgvector Scoped RAG):
                </span>
                {materialSearchResults.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl neu-inset text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-white font-bold">
                      <span>Match #{idx + 1}</span>
                      <span>Cosine Similarity: {(m.similarity * 100).toFixed(1)}%</span>
                    </div>
                    <p className="text-[#9e9e9e] leading-relaxed">{m.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Uploaded Materials List Grid */}
          {materialsList.length === 0 ? (
            <div className="neu-card p-12 text-center rounded-3xl space-y-4 border border-white/5">
              <div className="w-14 h-14 mx-auto rounded-2xl neu-inset flex items-center justify-center text-white">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-base font-bold text-white">No Learning Materials Uploaded</h4>
                <p className="text-xs text-[#9e9e9e] leading-relaxed">
                  Upload PDF lecture notes, syllabi, or Markdown files. Our OCR &amp; pgvector indexing pipeline chunks them into 768-dimensional embeddings to ground the Socratic Tutor.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                className="neu-btn-white px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer text-black rounded-xl shadow-lg"
              >
                <UploadCloud className="w-4 h-4 text-black" />
                Upload Course Notes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materialsList.map((mat) => (
                <div
                  key={mat.id}
                  className="neu-card p-5 flex flex-col justify-between space-y-3 border border-white/5 hover:border-white/20 transition-all text-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl neu-inset text-cyan-400 flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                          {mat.title}
                        </h4>
                        <span className="text-[10px] text-[#757575] font-mono">
                          Format: {mat.file_type.toUpperCase()} &bull; {mat.created_at}
                        </span>
                      </div>
                    </div>
                    {mat.processing_status === 'ready' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold neu-badge-white flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-white" />
                        Ready for RAG
                      </span>
                    ) : mat.processing_status === 'pending' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-300" />
                        Pending Embedding
                      </span>
                    ) : mat.processing_status === 'failed' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-300" />
                        Failed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 border border-sky-500/30 text-sky-300 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin text-sky-300" />
                        Processing Chunks
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#9e9e9e]">
                    <span className="flex items-center gap-1 text-[11px]">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Indexed with Gemini Embedding 2
                    </span>
                    <span className="text-[10px] font-mono text-[#757575]">
                      768 Dimensions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* CREATE NEW QUIZ MODAL                                          */}
      {/* ============================================================== */}
      {createQuizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl neu-card-raised p-6 space-y-4 animate-in zoom-in-95 text-white border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.85)] max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl neu-inset flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Create New Assessment</h3>
                  <p className="text-[11px] text-[#9e9e9e]">Saved as Draft — review and publish when ready</p>
                </div>
              </div>
              <button
                onClick={() => setCreateQuizModalOpen(false)}
                className="p-1.5 rounded-lg text-[#9e9e9e] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#9e9e9e] uppercase mb-1">
                  Quiz Title <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  placeholder="e.g. Diagnostic Quiz: Limits & Continuity"
                  className="w-full px-3.5 py-2.5 text-xs neu-input text-white placeholder:text-[#666666]"
                />
              </div>

              {/* Topic Selector / Custom Topic */}
              <div>
                <label className="block text-xs font-bold text-[#9e9e9e] uppercase mb-1">
                  Target Topic &amp; Concept
                </label>
                {classTopics.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={selectedTopicId}
                      onChange={(e) => {
                        setSelectedTopicId(e.target.value);
                        const found = classTopics.find((t) => t.id === e.target.value);
                        if (found) setNewQuizTopic(found.title);
                      }}
                      className="w-full px-3.5 py-2.5 text-xs neu-input text-white font-bold cursor-pointer"
                    >
                      <option value="" className="bg-[#262626]">-- Choose from Syllabus or Type Custom Below --</option>
                      {classTopics.map((top) => (
                        <option key={top.id} value={top.id} className="bg-[#262626]">
                          {top.title}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newQuizTopic}
                      onChange={(e) => {
                        setNewQuizTopic(e.target.value);
                        setSelectedTopicId('');
                      }}
                      placeholder="Or specify custom topic (e.g. Squeeze Theorem, AVL Rotations)"
                      className="w-full px-3.5 py-2 text-xs neu-input text-white placeholder:text-[#666666]"
                    />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={newQuizTopic}
                    onChange={(e) => setNewQuizTopic(e.target.value)}
                    placeholder="e.g. Limits, Squeeze Theorem, AVL Rotations"
                    className="w-full px-3.5 py-2.5 text-xs neu-input text-white placeholder:text-[#666666]"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#9e9e9e] uppercase mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newQuizDifficulty}
                    onChange={(e) => setNewQuizDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="w-full px-3 py-2 text-xs neu-input text-white font-bold cursor-pointer"
                  >
                    <option value="easy" className="bg-[#262626]">Easy</option>
                    <option value="medium" className="bg-[#262626]">Medium</option>
                    <option value="hard" className="bg-[#262626]">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9e9e9e] uppercase mb-1">
                    Questions
                  </label>
                  <select
                    value={newQuizQuestionCount}
                    onChange={(e) => setNewQuizQuestionCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs neu-input text-white font-bold cursor-pointer"
                  >
                    <option value={3} className="bg-[#262626]">3 Questions</option>
                    <option value={5} className="bg-[#262626]">5 Questions</option>
                    <option value={8} className="bg-[#262626]">8 Questions</option>
                    <option value={10} className="bg-[#262626]">10 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#9e9e9e] uppercase mb-1">
                    Duration
                  </label>
                  <select
                    value={newQuizDuration}
                    onChange={(e) => setNewQuizDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs neu-input text-white font-bold cursor-pointer"
                  >
                    <option value={15} className="bg-[#262626]">15 mins</option>
                    <option value={20} className="bg-[#262626]">20 mins</option>
                    <option value={30} className="bg-[#262626]">30 mins</option>
                    <option value={45} className="bg-[#262626]">45 mins</option>
                  </select>
                </div>
              </div>

              {/* Informational Callout */}
              <div className="p-3 rounded-2xl neu-inset text-[11px] text-[#cccccc] leading-relaxed flex items-start gap-2 border border-white/10">
                <Sparkles className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <span>
                  <strong>Draft &amp; Publish Lifecycle:</strong> AI will generate questions based on course notes and syllabus. The quiz is created in <strong>Draft</strong> mode so you can preview, edit, or adjust before publishing to students.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setCreateQuizModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 neu-btn text-xs font-bold text-[#9e9e9e] hover:text-white cursor-pointer rounded-xl"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isGeneratingQuiz || !newQuizTitle.trim()}
                  onClick={handleGenerateAiQuiz}
                  className="flex-1 sm:flex-none px-4 py-2 neu-btn-white text-black text-xs font-black cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 rounded-xl"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                      <span>Generating Questions with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-black" />
                      <span>⚡ AI Generate Questions (Draft)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isGeneratingQuiz || !newQuizTitle.trim()}
                  onClick={handleCreateBlankQuiz}
                  className="flex-1 sm:flex-none px-3.5 py-2 neu-btn text-xs font-bold text-white hover:border-white/30 cursor-pointer disabled:opacity-50"
                >
                  Save Blank Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PREVIEW / REVIEW QUIZ QUESTIONS MODAL                           */}
      {/* ============================================================== */}
      {previewQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl neu-card-raised p-6 space-y-4 animate-in zoom-in-95 text-white border border-white/10 shadow-[0_24px_50px_rgba(0,0,0,0.85)] max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/5 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      previewQuiz.status === 'published'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {previewQuiz.status === 'published' ? '● Published (Live to Students)' : '○ Draft (Unpublished)'}
                  </span>
                  <span className="text-xs text-[#757575] font-medium">
                    {previewQuiz.exam_duration} mins • {previewQuiz.difficulty?.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-base font-black text-white">{previewQuiz.title}</h3>
                {previewQuiz.description && (
                  <p className="text-xs text-[#9e9e9e]">{previewQuiz.description}</p>
                )}
              </div>
              <button
                onClick={() => setPreviewQuiz(null)}
                className="p-1.5 rounded-lg text-[#9e9e9e] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-4 py-1">
              {isLoadingPreview ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  <p className="text-xs text-[#9e9e9e]">Loading quiz questions...</p>
                </div>
              ) : (
                (() => {
                  const questionsList = previewQuiz.questions || previewQuiz.quiz_questions || [];
                  if (questionsList.length === 0) {
                    return (
                      <div className="p-8 neu-inset rounded-2xl text-center space-y-2">
                        <p className="text-xs font-bold text-[#9e9e9e]">No questions added to this quiz yet.</p>
                        <p className="text-[11px] text-[#757575]">Use AI generation or add questions via the API.</p>
                      </div>
                    );
                  }

                  return questionsList.map((q, idx) => {
                    const prompt = q.questionText || q.question_text || `Question #${idx + 1}`;
                    const correctAns = q.correctAnswer || q.correct_answer;
                    const explanation = q.explanation;
                    const options = q.options || [];

                    return (
                      <div key={q.id || idx} className="p-4 rounded-2xl neu-inset space-y-3 border border-white/5">
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-xs font-black text-cyan-400">Q{idx + 1}.</span>
                          <p className="text-xs font-bold text-white flex-1 leading-relaxed">{prompt}</p>
                          <span className="text-[10px] font-mono text-[#757575] bg-white/5 px-2 py-0.5 rounded">
                            {q.marks || 1} mark
                          </span>
                        </div>

                        {/* Options */}
                        {options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                            {options.map((opt, optIdx) => {
                              const isCorrect = correctAns === opt || correctAns === optIdx;
                              return (
                                <div
                                  key={optIdx}
                                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border transition-all ${
                                    isCorrect
                                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-bold'
                                      : 'bg-white/5 border-white/5 text-[#cccccc]'
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                                    isCorrect ? 'bg-emerald-500 text-black font-black' : 'bg-white/10 text-white/70'
                                  }`}>
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span className="leading-snug">{opt}</span>
                                  {isCorrect && (
                                    <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Pedagogical Explanation */}
                        {explanation && (
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-[#9e9e9e] leading-relaxed">
                            <span className="font-bold text-white block mb-0.5">Pedagogical Rubric &amp; Explanation:</span>
                            {explanation}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#9e9e9e]">
                {previewQuiz.status === 'draft' ? (
                  <span>Ready to assign? Click <strong>Publish Quiz</strong> to make it live for students.</span>
                ) : (
                  <span className="text-emerald-400">● Live for all enrolled students in {cls.name}.</span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewQuiz(null)}
                  className="px-4 py-2 neu-btn text-xs font-bold text-[#9e9e9e] hover:text-white cursor-pointer"
                >
                  Close
                </button>

                {previewQuiz.status === 'draft' ? (
                  <button
                    type="button"
                    disabled={isUpdatingStatus === previewQuiz.id}
                    onClick={() => handleTogglePublishStatus(previewQuiz.id, 'draft')}
                    className="px-4 py-2 neu-btn-white text-black font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-black" />
                    <span>{isUpdatingStatus === previewQuiz.id ? 'Publishing...' : 'Publish Quiz to Students'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isUpdatingStatus === previewQuiz.id}
                    onClick={() => handleTogglePublishStatus(previewQuiz.id, 'published')}
                    className="px-4 py-2 neu-btn text-xs font-bold text-amber-300 hover:text-amber-200 rounded-xl cursor-pointer disabled:opacity-50"
                  >
                    <span>{isUpdatingStatus === previewQuiz.id ? 'Updating...' : 'Unpublish (Move to Draft)'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* INGEST MATERIAL (OCR & NOTES) MODAL                             */}
      {/* ============================================================== */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl neu-card-raised p-6 sm:p-7 space-y-4 animate-in zoom-in-95 text-white border border-white/5 shadow-[0_24px_50px_rgba(0,0,0,0.85)] max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl neu-card-sm flex items-center justify-center text-white">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Ingest Course Notes &amp; Syllabus
                  </h3>
                  <p className="text-[11px] text-[#9e9e9e]">
                    Multimodal Gemini OCR &bull; Semantic Chunking &bull; pgvector
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isUploadingNotes) {
                    setUploadModalOpen(false);
                    setUploadError(null);
                    setSelectedFile(null);
                  }
                }}
                className="p-1.5 rounded-lg text-[#9e9e9e] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message Banner */}
            {uploadError && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in shadow-inner">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="flex-1 leading-relaxed">{uploadError}</span>
              </div>
            )}

            {/* Ingestion Completion Banner */}
            {ingestedStats && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in shadow-inner">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="flex-1 font-bold">
                  Successfully ingested and embedded {ingestedStats.chunksCount} semantic chunks ({ingestedStats.charCount.toLocaleString()} chars) into pgvector!
                </span>
              </div>
            )}

            {/* Mode Tabs: File Upload vs Direct Text Input */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl neu-inset">
              <button
                type="button"
                onClick={() => {
                  setActiveUploadTab('file');
                  setUploadError(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeUploadTab === 'file'
                    ? 'neu-btn text-white bg-[#2b2b2b] shadow-sm'
                    : 'text-[#9e9e9e] hover:text-white'
                }`}
              >
                <FileUp className="w-3.5 h-3.5 text-white" />
                <span>Upload Document (OCR)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveUploadTab('text');
                  setUploadError(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeUploadTab === 'text'
                    ? 'neu-btn text-white bg-[#2b2b2b] shadow-sm'
                    : 'text-[#9e9e9e] hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-white" />
                <span>Paste Notes / Text</span>
              </button>
            </div>

            {/* Tab 1: Interactive Drag & Drop File Upload */}
            {activeUploadTab === 'file' && (
              <div className="space-y-3">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  onClick={() => document.getElementById('course-file-input')?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-white bg-white/10 scale-[0.99]'
                      : selectedFile
                      ? 'border-white/40 bg-white/5'
                      : 'border-white/10 hover:border-white/20 bg-[#1c1c1c]/50'
                  }`}
                >
                  <input
                    id="course-file-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-white">
                        {selectedFile.type.startsWith('image/') ? (
                          <FileImage className="w-6 h-6" />
                        ) : (
                          <FileText className="w-6 h-6" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-white">{selectedFile.name}</p>
                        <p className="text-[11px] text-[#9e9e9e]">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; {selectedFile.type || 'Document'}
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold neu-badge-white mt-1">
                        <Sparkles className="w-3 h-3 text-white" />
                        {selectedFile.type.includes('pdf') || selectedFile.type.startsWith('image/') || selectedFile.name.toLowerCase().endsWith('.pdf')
                          ? 'Gemini Multimodal OCR Active'
                          : 'Direct Structured Text Parser'}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="mt-2 text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Choose a different file</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2.5">
                      <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-white">
                        <UploadCloud className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          Drag and drop course notes, slides, or syllabus here
                        </p>
                        <p className="text-[11px] text-[#757575] mt-0.5">
                          or click to browse from your device
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-[#9e9e9e] neu-inset-sm px-2.5 py-1">
                        PDF, PNG, JPG, WEBP, TXT, MD &bull; Up to 20MB
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Material Title Field */}
            <div>
              <label className="block text-xs font-bold text-[#9e9e9e] uppercase mb-1">
                Material Title <span className="text-white">*</span>
              </label>
              <input
                type="text"
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                placeholder="e.g. Lecture 04: AVL Tree Rotations &amp; Invariants"
                className="w-full px-3.5 py-2.5 text-xs neu-input text-white placeholder:text-[#666666]"
              />
            </div>

            {/* Tab 2: Direct Text Area */}
            {activeUploadTab === 'text' && (
              <div>
                <label className="block text-xs font-bold text-[#9e9e9e] uppercase mb-1">
                  Paste Notes Text or Syllabus Units <span className="text-white">*</span>
                </label>
                <textarea
                  rows={6}
                  value={materialRawText}
                  onChange={(e) => setMaterialRawText(e.target.value)}
                  placeholder="Paste raw lecture transcripts, textbook chapters, math theorems, formulas, or syllabus modules here. Will be semantically split into 500-token chunks with 768-dim embeddings..."
                  className="w-full px-3.5 py-2.5 text-xs neu-input text-white placeholder:text-[#666666] leading-relaxed resize-none"
                />
              </div>
            )}

            {/* Ingestion Pipeline Live Progress Indicator */}
            {isUploadingNotes && (
              <div className="p-3.5 rounded-2xl neu-inset space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-400 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {uploadStage === 'uploading' && 'Uploading document to ingestion pipeline...'}
                    {uploadStage === 'ocr' && 'Extracting text & math equations via Gemini Multimodal OCR...'}
                    {uploadStage === 'chunking' && 'Splitting semantic chunks (500 tokens) & embedding in pgvector...'}
                    {uploadStage === 'complete' && 'Ingestion & pgvector indexing finalized!'}
                  </span>
                  <span className="text-[10px] font-mono text-[#757575] uppercase">Pipeline Active</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1e1e1e] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse w-full" />
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isUploadingNotes}
                onClick={() => {
                  setUploadModalOpen(false);
                  setUploadError(null);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 neu-btn text-xs font-bold text-[#9e9e9e] hover:text-white cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  isUploadingNotes ||
                  (activeUploadTab === 'file' && !selectedFile) ||
                  (activeUploadTab === 'text' && !materialRawText.trim())
                }
                onClick={handleUploadNotes}
                className="px-5 py-2.5 neu-btn-white text-black text-xs font-black cursor-pointer flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-md rounded-xl"
              >
                {isUploadingNotes ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Processing Chunks...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Extract, Chunk &amp; Embed in pgvector</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ENROLL STUDENT MODAL                                           */}
      {/* ============================================================== */}
      {enrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl neu-card-raised p-6 space-y-4 animate-in zoom-in-95 text-white border border-white/5 shadow-[0_24px_50px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white" />
                <h3 className="text-base font-black text-white">
                  Enroll Student in {cls.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEnrollModalOpen(false);
                  setEnrollError(null);
                  setEnrollSuccess(null);
                }}
                className="p-1 rounded-lg text-[#9e9e9e] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {enrollError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                {enrollError}
              </div>
            )}

            {enrollSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                {enrollSuccess}
              </div>
            )}

            <form onSubmit={handleEnrollStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#9e9e9e] uppercase mb-1">
                  Student Name, Email, or Roll ID <span className="text-white">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={enrollIdentifier}
                  onChange={(e) => setEnrollIdentifier(e.target.value)}
                  placeholder="e.g. antonyamal, std2026@institution.edu, or STD-2026-..."
                  className="w-full px-3.5 py-2.5 text-xs neu-input text-white placeholder:text-[#666666]"
                />
                <p className="text-[11px] text-[#757575] mt-1.5">
                  Enter student&apos;s name (e.g. antonyamal), email address, or institutional Roll ID to enroll them.
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEnrollModalOpen(false);
                    setEnrollError(null);
                    setEnrollSuccess(null);
                  }}
                  className="px-4 py-2 neu-btn text-xs font-bold text-[#9e9e9e] hover:text-white cursor-pointer rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEnrolling || !enrollIdentifier.trim()}
                  className="px-5 py-2 neu-btn-white text-black text-xs font-black cursor-pointer flex items-center gap-1.5 disabled:opacity-50 rounded-xl"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>{isEnrolling ? 'Enrolling...' : 'Enroll in Class'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
