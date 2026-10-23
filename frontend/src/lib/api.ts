import { createClient } from './supabase/client';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ActionWidget {
  type: 'pill' | 'input';
  label: string;
  value: string;
}

export interface TutorChatResponse {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  actionWidgets?: ActionWidget[];
  understandingScore?: number;
  isGapResolved?: boolean;
  curriculumTopicId?: string | null;
  createdAt?: string;
}

export interface QuizSubmissionResponse {
  attempt: {
    id: string;
    score: number;
    maxScore: number;
    status: string;
  };
  score: number;
  maxScore: number;
  percentage: number;
  remediationMission?: {
    insightId?: string;
    title: string;
    diagnosedGap: string;
    actionPlan: string;
    openingPrompt: string;
    actionWidgets: ActionWidget[];
    teacherAdvice?: string;
  } | null;
}

export interface TeacherInsightItem {
  id: string;
  teacher_subject_id: string;
  insight_type: 'weak_areas' | 'strong_areas' | 'summary';
  title: string;
  description: string;
  curriculum_topic_id?: string | null;
  student_id?: string | null;
  status: 'active' | 'resolved' | 'dismissed';
  evidence?: {
    initialScore?: number;
    diagnosedGap?: string;
    missedQuestions?: string[];
    actionPlan?: string;
    actionWidgets?: ActionWidget[];
    progressTrace?: Array<{
      turn: number;
      studentMessage?: string;
      studentResponse?: string;
      understandingScore?: number;
      understandingDelta?: number;
      teacherNote?: string;
      timestamp: string;
    }>;
    teacherAdvice?: string;
  } | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name: string;
  } | null;
  curriculum_topics?: {
    id: string;
    title: string;
  } | null;
}

/**
 * Generic authenticated fetch wrapper for ThinkFirst backend API
 */
async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let token = '';

  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    token = data.session?.access_token || '';
  } catch (err) {
    console.warn('Auth token resolution warning:', err);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || `Request failed with status ${res.status}`);
  }

  return json.data;
}

// ============================================================================
// AI TUTOR API (Method 2: Interactive Action Widgets)
// ============================================================================
export const tutorApi = {
  createConversation: (teacherSubjectId: string, title?: string) =>
    fetchWithAuth<{ id: string; title: string }>('/tutor/conversations', {
      method: 'POST',
      body: JSON.stringify({ teacherSubjectId, title }),
    }),

  listConversations: (subjectId: string) =>
    fetchWithAuth<Array<{ id: string; title: string; updated_at: string }>>(
      `/tutor/conversations/${subjectId}`
    ),

  getMessages: (conversationId: string) =>
    fetchWithAuth<
      Array<{
        id: string;
        role: 'user' | 'assistant';
        content: string;
        created_at: string;
      }>
    >(`/tutor/conversations/${conversationId}/messages`),

  sendMessage: (
    conversationId: string,
    message: string,
    curriculumTopicId?: string
  ) =>
    fetchWithAuth<TutorChatResponse>(
      `/tutor/conversations/${conversationId}/chat`,
      {
        method: 'POST',
        body: JSON.stringify({
          message,
          curriculumTopicId,
          stream: false,
        }),
      }
    ),
};

// ============================================================================
// QUIZZES & EVALUATOR AGENT API
// ============================================================================
export const quizzesApi = {
  listQuizzes: (subjectId: string) =>
    fetchWithAuth<
      Array<{
        id: string;
        title: string;
        description: string;
        difficulty: string;
        question_count: number;
        exam_duration: number;
        status: string;
        created_at: string;
        curriculum_topics?: { id: string; title: string };
      }>
    >(`/quizzes/${subjectId}`),

  getQuizDetail: (quizId: string) =>
    fetchWithAuth<{
      id: string;
      title: string;
      description: string;
      difficulty: string;
      exam_duration: number;
      curriculum_topic_id?: string;
      quiz_questions: Array<{
        id: string;
        question_text: string;
        question_type: 'multiple_choice' | 'short_answer';
        options?: string[];
        marks: number;
        position: number;
      }>;
    }>(`/quizzes/detail/${quizId}`),

  generateQuiz: (
    subjectId: string,
    input: {
      curriculumTopicId: string;
      title: string;
      difficulty: 'easy' | 'medium' | 'hard';
      questionCount: number;
      examDuration?: number;
    }
  ) =>
    fetchWithAuth<{ id: string; title: string; question_count: number }>(
      `/quizzes/${subjectId}/generate`,
      {
        method: 'POST',
        body: JSON.stringify({
          examDuration: 20,
          ...input,
        }),
      }
    ),

  startAttempt: (quizId: string) =>
    fetchWithAuth<{ id: string; status: string }>(
      `/quizzes/detail/${quizId}/attempts`,
      {
        method: 'POST',
      }
    ),

  submitAttempt: (
    attemptId: string,
    responses: Array<{ questionId: string; studentAnswer: unknown }>
  ) =>
    fetchWithAuth<QuizSubmissionResponse>(
      `/quizzes/attempts/${attemptId}/submit`,
      {
        method: 'POST',
        body: JSON.stringify({ responses }),
      }
    ),

  getAttemptResults: (attemptId: string) =>
    fetchWithAuth<{
      id: string;
      score: number;
      max_score: number;
      remediationMission?: {
        insightId?: string;
        title: string;
        diagnosedGap: string;
        actionPlan: string;
        actionWidgets: ActionWidget[];
      };
    }>(`/quizzes/attempts/${attemptId}/results`),
};

// ============================================================================
// TEACHER INSIGHTS & ANALYTICS API
// ============================================================================
export const insightsApi = {
  listInsights: (
    subjectId: string,
    options?: { status?: 'active' | 'resolved' | 'dismissed'; studentId?: string }
  ) => {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.studentId) params.set('studentId', options.studentId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchWithAuth<TeacherInsightItem[]>(`/insights/${subjectId}${query}`);
  },

  generateInsights: (subjectId: string) =>
    fetchWithAuth<{ message: string; insights: TeacherInsightItem[] }>(
      `/insights/${subjectId}/generate`,
      { method: 'POST' }
    ),

  updateStatus: (insightId: string, status: 'active' | 'resolved' | 'dismissed') =>
    fetchWithAuth<TeacherInsightItem>(`/insights/detail/${insightId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// ============================================================================
// DETERMINISTIC MASTERY API
// ============================================================================
export const masteryApi = {
  getStudentMastery: (subjectId: string) =>
    fetchWithAuth<{
      subjectId: string;
      overallMastery: number;
      topics: Array<{
        topicId: string;
        title: string;
        masteryScore: number;
        confidence: number;
        evidenceCount: number;
        tier: 'Mastered' | 'Developing' | 'Needs Intervention';
      }>;
    }>(`/mastery/${subjectId}/me`),

  getClassOverview: (subjectId: string) =>
    fetchWithAuth<
      Array<{
        topicId: string;
        title: string;
        nodeType?: string;
        averageMastery: number;
        assessedStudentsCount?: number;
        strugglingStudentsCount: number;
      }>
    >(`/mastery/${subjectId}/overview`),
};

// ============================================================================
// AUTH & INSTITUTIONAL ADMIN API
// ============================================================================
export interface UserProfile {
  id: string;
  full_name: string;
  college?: string | null;
  role: 'admin' | 'teacher' | 'student';
  created_at: string;
  email?: string;
  login_id?: string;
}

export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalSubjects: number;
  totalQuizzes: number;
  totalMaterials: number;
}

export const authApi = {
  getMe: () => fetchWithAuth<UserProfile>('/auth/me'),

  updateMe: (data: { fullName?: string; college?: string }) =>
    fetchWithAuth<UserProfile>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getStats: () => fetchWithAuth<AdminStats>('/auth/stats'),

  listProfiles: (role?: 'teacher' | 'student' | 'admin') => {
    const query = role ? `?role=${role}` : '';
    return fetchWithAuth<UserProfile[]>(`/auth/profiles${query}`);
  },

  createUser: (data: {
    email: string;
    fullName: string;
    role: 'teacher' | 'student';
    password?: string;
    college?: string;
    loginId?: string;
  }) =>
    fetchWithAuth<{
      profile: UserProfile;
      email: string;
      temporaryPassword?: string;
      loginId?: string;
    }>('/auth/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============================================================================
// CURRICULUM TOPICS & SYLLABUS API
// ============================================================================
export interface CurriculumTopicNode {
  id: string;
  teacher_subject_id: string;
  parent_topic_id: string | null;
  title: string;
  description?: string | null;
  node_type: 'module' | 'topic' | 'subtopic';
  created_at: string;
  children?: CurriculumTopicNode[];
}

export const curriculumApi = {
  getTree: (subjectId: string) =>
    fetchWithAuth<CurriculumTopicNode[]>(`/curriculum/${subjectId}/tree`),

  createTopic: (
    subjectId: string,
    data: {
      title: string;
      description?: string;
      parentTopicId?: string;
      nodeType?: 'module' | 'topic' | 'subtopic';
    }
  ) =>
    fetchWithAuth<CurriculumTopicNode>(`/curriculum/${subjectId}/topics`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============================================================================
// SUBJECTS & MATERIALS API
// ============================================================================
export interface SubjectOffering {
  id: string;
  subject: string;
  academic_year: string;
  class_name: string;
  created_at: string;
  studentCount?: number;
  profiles?: {
    id: string;
    full_name: string;
    college?: string;
  };
}

export interface StudentRosterMember {
  id: string;
  fullName: string;
  email?: string;
  college?: string;
  role?: string;
  loginId?: string;
  joinedAt: string;
}

export const subjectsApi = {
  listSubjects: () => fetchWithAuth<SubjectOffering[]>('/subjects'),

  getSubject: (subjectId: string) =>
    fetchWithAuth<SubjectOffering>(`/subjects/${subjectId}`),

  createSubject: (data: {
    subject: string;
    academicYear: string;
    className: string;
  }) =>
    fetchWithAuth<SubjectOffering>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getRoster: (subjectId: string) =>
    fetchWithAuth<StudentRosterMember[]>(`/subjects/${subjectId}/roster`),

  enrollStudent: (subjectId: string, identifier: string) =>
    fetchWithAuth<{ teacherSubjectId: string; studentId: string; joinedAt: string }>(
      `/subjects/${subjectId}/enroll`,
      {
        method: 'POST',
        body: JSON.stringify({ identifier, studentId: identifier }),
      }
    ),
};

export const materialsApi = {
  listMaterials: (subjectId: string) =>
    fetchWithAuth<
      Array<{
        id: string;
        title: string;
        file_type: string;
        processing_status: string;
        created_at: string;
      }>
    >(`/materials/${subjectId}`),

  uploadNotes: async (
    subjectId: string,
    data: { title: string; file?: File; rawText?: string; materialType?: string }
  ) => {
    let token = '';
    try {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      token = sessionData.session?.access_token || '';
    } catch {
      // offline/client
    }

    const formData = new FormData();
    formData.append('title', data.title);
    if (data.file) formData.append('file', data.file);
    if (data.rawText) formData.append('rawText', data.rawText);
    if (data.materialType) formData.append('materialType', data.materialType);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/materials/${subjectId}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || `Upload failed with status ${res.status}`);
    }

    return json.data as {
      material: {
        id: string;
        title: string;
        file_type: string;
        processing_status: string;
        created_at: string;
      };
      extractedCharacterCount: number;
      chunksCount: number;
      processingStatus: string;
    };
  },

  similaritySearch: (subjectId: string, query: string) =>
    fetchWithAuth<{
      query: string;
      resultsCount: number;
      matches: Array<{ content: string; similarity: number }>;
    }>(`/materials/${subjectId}/search`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
};
