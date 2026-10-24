# ThinkFirst — REST API Documentation

**Project**: ThinkFirst  
**Team**: Odysseus  
**Track**: Agentic AI · RealmHack 2026  
**Document Version**: 2.0.0  
**Base URL**: `http://localhost:5000/api/v1` (Production: `https://api.thinkfirst.edu/api/v1`)  

---

## 1. Global Conventions & Standards

### 1.1 Authentication & Authorization Headers
All secured endpoints require a valid Supabase JWT Bearer token:
```http
Authorization: Bearer <supabase_jwt_access_token>
Content-Type: application/json
```

### 1.2 Unified Success Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-23T14:30:00.000Z"
  }
}
```

### 1.3 Unified Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Validation failed for request payload.",
    "details": [
      {
        "path": "subject",
        "message": "Subject name is required."
      }
    ]
  },
  "meta": {
    "timestamp": "2026-10-23T14:30:00.000Z"
  }
}
```

---

## 2. API Endpoints by Domain Module

---

### Module 0: Colleges & Institutional Administration (`/colleges`)

#### 0.1 Create College (Superadmin only)
- **Method & Path**: `POST /api/v1/colleges`
- **Access**: `superadmin`
- **Request Body**:
```json
{
  "name": "Rajiv Gandhi Institute of Technology",
  "code": "RIT-KTM",
  "domain": "rit.ac.in"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "id": "col_7721",
    "name": "Rajiv Gandhi Institute of Technology",
    "code": "RIT-KTM",
    "domain": "rit.ac.in",
    "createdAt": "2026-10-23T16:00:00Z"
  }
}
```

#### 0.2 Add Teacher or Student to College (College Admin)
- **Method & Path**: `POST /api/v1/colleges/:collegeId/users`
- **Access**: `admin` (of `:collegeId`) or `superadmin`
- **Request Body**:
```json
{
  "email": "dr.smith@rit.ac.in",
  "fullName": "Dr. Alan Smith",
  "role": "teacher"
}
```
- **Response `201 Created`**: Added user profile linked to `collegeId`.

---

### Module 1: Authentication & User Profiles (`/auth`, `/profiles`)

#### 1.0 Server-Side User Login with Bcrypt Verification
- **Method & Path**: `POST /api/v1/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "tcr2026@institution.edu",
  "password": "Teacher@2026"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "4925878e-8442-4c5a-bde1-d4b0f690c87d",
      "email": "tcr2026@institution.edu",
      "role": "teacher",
      "full_name": "rinz logic",
      "college": "Faculty of Engineering"
    },
    "session": {
      "access_token": "eyJhbGciOi...",
      "refresh_token": "..."
    }
  }
}
```

#### 1.1 Get Current User Profile
- **Method & Path**: `GET /api/v1/auth/me`
- **Access**: Authenticated (`student`, `teacher`, `admin`, `superadmin`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "f8983981-d102-4cf4-9123-ecba98765432",
    "email": "teacher@school.edu",
    "fullName": "Prof. Alistair Vance",
    "role": "teacher",
    "collegeId": "col_7721",
    "createdAt": "2026-10-23T08:00:00Z"
  }
}
```

#### 1.2 Update User Profile
- **Method & Path**: `PUT /api/v1/auth/me`
- **Access**: Authenticated
- **Request Body**:
```json
{
  "fullName": "Prof. Alistair Vance, Ph.D.",
  "college": "Faculty of Engineering"
}
```

#### 1.3 Get Institutional System Statistics
- **Method & Path**: `GET /api/v1/auth/stats`
- **Access**: `admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "totalStudents": 42,
    "totalTeachers": 12,
    "totalSubjects": 8,
    "totalQuizzes": 15,
    "totalMaterials": 24
  }
}
```

#### 1.4 List User Profiles
- **Method & Path**: `GET /api/v1/auth/profiles?role=teacher`
- **Access**: `admin`
- **Response `200 OK`**: List of user profiles matching the optional role filter.

#### 1.5 Admin Create / Enroll User
- **Method & Path**: `POST /api/v1/auth/users`
- **Access**: `admin`
- **Request Body**:
```json
{
  "email": "sarah.connor@institution.edu",
  "fullName": "Prof. Sarah Connor",
  "role": "teacher",
  "college": "Faculty of Engineering",
  "loginId": "TCR-2026-01"
}
```
- **Response `201 Created`**: Returns created profile and initial credentials.

---

### Module 2: Teacher Subjects & Memberships (`/subjects`)

#### 2.1 Create Teacher Subject Offering
- **Method & Path**: `POST /api/v1/subjects`
- **Access**: `teacher`, `admin`
- **Request Body**:
```json
{
  "title": "Honors AP Calculus BC",
  "subject": "Calculus",
  "academicYear": "2025-2026",
  "className": "Section B"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "id": "e30e71ab-5e60-449e-b5c6-55bb24c8c114",
    "teacherId": "f8983981-d102-4cf4-9123-ecba98765432",
    "title": "Honors AP Calculus BC",
    "subject": "Calculus",
    "academicYear": "2025-2026",
    "className": "Section B",
    "createdAt": "2026-10-23T14:35:00Z"
  }
}
```

#### 2.2 List User Subjects
- **Method & Path**: `GET /api/v1/subjects`
- **Access**: Authenticated
- **Response `200 OK`**: Array of subjects taught by or enrolled in by the user.

#### 2.3 Enroll Student in Subject (Teacher / Admin Only)
- **Method & Path**: `POST /api/v1/subjects/:subjectId/enroll`
- **Access**: Instructor of `:subjectId` or `admin`
- **Request Body**:
```json
{
  "email": "student@thinkfirst.edu"
}
// OR
{
  "studentId": "14edad9c-054b-46af-8591-9ae2dfb613d0"
}
```
- **Response `201 Created`**: Membership confirmation record linking student to subject.

#### 2.4 Get Enrolled Students Roster
- **Method & Path**: `GET /api/v1/subjects/:subjectId/members`
- **Access**: Instructor or enrolled member of `:subjectId`
- **Response `200 OK`**: Array of enrolled students.

---

### Module 3: Curriculum Topics (`/curriculum`)

#### 3.1 Bulk Import Curriculum Outline (Deterministic)
- **Method & Path**: `POST /api/v1/curriculum/:subjectId/bulk`
- **Access**: Instructor of `:subjectId`
- **Request Body**:
```json
{
  "modules": [
    {
      "title": "Module 1: Differential Calculus",
      "description": "Foundations of limits and derivatives",
      "topics": [
        {
          "title": "Topic 1.1: Limit Definitions",
          "description": "Epsilon-delta definitions and intuitive limits"
        },
        {
          "title": "Topic 1.2: The Squeeze Theorem",
          "description": "Bounding trigonometric limits"
        }
      ]
    }
  ]
}
```
- **Response `201 Created`**: Returns the complete hierarchical curriculum tree created in database.

#### 3.2 Create Topic Node
- **Method & Path**: `POST /api/v1/curriculum/:subjectId/topics`
- **Access**: Instructor of `:subjectId`
- **Request Body**:
```json
{
  "name": "Limits and Continuity",
  "nodeType": "topic",
  "parentTopicId": "optional-uuid",
  "position": 1,
  "description": "Foundational understanding of limits"
}
```
- **Response `201 Created`**: The created curriculum topic node.

#### 3.3 Get Curriculum Tree for Subject
- **Method & Path**: `GET /api/v1/curriculum/:subjectId/tree`
- **Access**: Enrolled member or instructor of `:subjectId`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "top_01",
      "teacherSubjectId": "e30e71ab-5e60-449e-b5c6-55bb24c8c114",
      "parentTopicId": null,
      "name": "Module 1: Differential Calculus",
      "nodeType": "module",
      "description": "Foundations of limits and derivatives",
      "position": 1,
      "children": []
    }
  ]
}
```

#### 3.4 Update Topic Node
- **Method & Path**: `PUT /api/v1/curriculum/topics/:topicId`
- **Access**: Instructor or admin

#### 3.5 Delete Topic Node
- **Method & Path**: `DELETE /api/v1/curriculum/topics/:topicId`
- **Access**: Instructor or admin

---

### Module 4: Learning Materials & Vector Embeddings (`/materials`)

#### 4.1 Unified File Upload & OCR Ingestion (PDF, Image, Slides, TXT, MD)
- **Method & Path**: `POST /api/v1/materials/:subjectId/upload`
- **Content-Type**: `multipart/form-data` or `application/json`
- **Access**: Instructor of `:subjectId`
- **Execution Mode**: Non-blocking asynchronous background execution.
- **Request Fields**:
  - `file`: Multipart file binary (`.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.txt`, `.md`)
  - `title`: String (e.g. "Lecture 04: The Squeeze Theorem")
  - `curriculumTopicId`: UUID (optional topic link)
  - `materialType`: String (default `"lecture_notes"`)
  - `rawText`: String (optional, if content was directly pasted instead of a file upload)
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "material": {
      "id": "mat_881",
      "title": "Lecture 04: The Squeeze Theorem",
      "processing_status": "pending"
    },
    "extractedCharacterCount": 1420,
    "chunksCount": 0,
    "processingStatus": "pending",
    "message": "Learning material registered. Semantic chunking and vector embeddings are running in background."
  }
}
```
*Note: Embeddings and vector storage are executed in a non-blocking background task. Status transitions from `pending` -> `processing` -> `ready` (or `failed`).*

#### 4.2 Register Learning Material Metadata (Manual)
- **Method & Path**: `POST /api/v1/materials/:subjectId`
- **Access**: Instructor of `:subjectId`
- **Request Body**:
```json
{
  "curriculumTopicId": "top_01",
  "title": "Lecture 03 - Squeeze Theorem",
  "filePath": "materials/calc/lecture_03.pdf",
  "fileType": "PDF",
  "materialType": "notes"
}
```
- **Response `201 Created`**: Created learning material record.

#### 4.3 List Materials for Subject
- **Method & Path**: `GET /api/v1/materials/:subjectId`
- **Access**: Subject members
- **Query Params**: `?topicId=uuid` (optional)
- **Response `200 OK`**: Array of materials.

#### 4.4 Ingest Material Content & Generate Vector Embeddings
- **Method & Path**: `POST /api/v1/materials/detail/:materialId/ingest`
- **Access**: Instructor of subject
- **Request Body**:
```json
{
  "rawText": "The Squeeze Theorem establishes limits through boundary functions..."
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "materialId": "mat_881",
    "totalChunks": 5
  }
}
```

#### 4.5 Semantic Vector Search over Subject Materials
- **Method & Path**: `POST /api/v1/materials/:subjectId/search`
- **Access**: Subject members
- **Request Body**:
```json
{
  "query": "How is the squeeze theorem used for sin(x)/x?",
  "similarityThreshold": 0.65,
  "matchCount": 5
}
```
- **Response `200 OK`**: Top matching chunks with similarity scores.

---

### Module 5: Quizzes, Questions & Attempts (`/quizzes`)

#### 5.1 Create Quiz Manually
- **Method & Path**: `POST /api/v1/quizzes/:subjectId`
- **Access**: Instructor of `:subjectId`
- **Request Body**:
```json
{
  "title": "Quiz 1: Limits & Squeeze Theorem",
  "curriculumTopicId": "top_01",
  "quizType": "diagnostic",
  "difficulty": "medium",
  "timeLimitMinutes": 20
}
```

#### 5.2 List Quizzes for Subject
- **Method & Path**: `GET /api/v1/quizzes/:subjectId`
- **Access**: Subject members

#### 5.3 Generate Targeted Diagnostic Quiz (Quiz Agent)
- **Method & Path**: `POST /api/v1/quizzes/:subjectId/generate`
- **Access**: Subject instructor (`teacher` or `admin`)
- **Execution Mode**: Non-blocking asynchronous background execution.
- **Lifecycle**: Creates the quiz record immediately with `status: "draft"` and `question_count: 0`. AI question synthesis runs asynchronously in the background. Teachers can preview and publish once question synthesis completes.
- **Request Body**:
```json
{
  "curriculumTopicId": "optional-uuid",
  "topicTitle": "Limits & Continuity",
  "title": "Diagnostic Quiz - Squeeze Theorem",
  "difficulty": "medium",
  "questionCount": 3,
  "examDuration": 20
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "id": "quiz_01",
    "title": "Diagnostic Quiz - Squeeze Theorem",
    "status": "draft",
    "question_count": 0,
    "processingStatus": "processing",
    "message": "Quiz container created in draft mode. AI questions are generating in the background."
  }
}
```

#### 5.4 Update Quiz Status (Publish / Unpublish Lifecycle)
- **Method & Path**: `PATCH /api/v1/quizzes/detail/:quizId/status`
- **Access**: Assigned subject instructor or admin
- **Request Body**:
```json
{
  "status": "published"
}
```
- **Allowed Values**: `"draft"`, `"published"`, `"archived"`
- **Response `200 OK`**: Updated quiz object. Note: Students can only view and attempt quizzes in `"published"` status. Attempts on `"draft"` quizzes return `400 Bad Request`.

#### 5.5 Update Quiz Details
- **Method & Path**: `PATCH /api/v1/quizzes/detail/:quizId`
- **Access**: Assigned subject instructor or admin
- **Request Body**:
```json
{
  "title": "Diagnostic Quiz - Advanced Calculus",
  "description": "Comprehensive review of limits and derivatives",
  "difficulty": "hard",
  "examDuration": 30,
  "status": "published"
}
```
- **Response `200 OK`**: Updated quiz record.

#### 5.6 Delete Quiz
- **Method & Path**: `DELETE /api/v1/quizzes/detail/:quizId`
- **Access**: Assigned subject instructor or admin
- **Response `200 OK`**: `{ "success": true, "message": "Quiz deleted successfully" }`

#### 5.7 Get Quiz Details & Questions
- **Method & Path**: `GET /api/v1/quizzes/detail/:quizId`
- **Access**: Authenticated subject members (Teachers/admins receive complete rubrics and answer keys; Students receive prompts and options only, and can only access published quizzes)

#### 5.8 Start Quiz Attempt
- **Method & Path**: `POST /api/v1/quizzes/detail/:quizId/attempts`
- **Access**: Enrolled student
- **Constraint**: Fails with `400 Bad Request` if quiz status is not `"published"`.
- **Response `201 Created`**: New `quiz_attempts` session record.

#### 5.9 Submit Attempt Session (Non-Blocking Deterministic Evaluation + Async Evaluator Agent)
- **Method & Path**: `POST /api/v1/quizzes/attempts/:attemptId/submit`
- **Access**: Student owner of attempt
- **Execution Mode**: Non-blocking asynchronous background execution.
- **Behavior**: Instantly evaluates multiple-choice answers deterministically, updates attempt to `status: "submitted"`, and returns immediate confirmation (<50ms). Asynchronously in the background, the Evaluator Agent synthesizes cognitive gap diagnoses, logs teacher insight dossiers, and updates topic mastery, marking the attempt as `"graded"`.
- **Request Body**:
```json
{
  "responses": [
    {
      "questionId": "qq_01",
      "studentAnswer": "cos(x)"
    }
  ]
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "attempt": {
      "id": "att_01",
      "status": "submitted",
      "score": 5,
      "max_score": 5
    },
    "score": 5,
    "maxScore": 5,
    "percentage": 100,
    "status": "submitted",
    "message": "Assessment submitted successfully. Evaluator Agent analysis running in background."
  }
}
```

#### 5.7 Get Attempt Results
- **Method & Path**: `GET /api/v1/quizzes/attempts/:attemptId/results`
- **Access**: Student owner or instructor

---

### Module 6: Socratic Tutor & Conversations (`/tutor`)

#### 6.1 Create Socratic Conversation
- **Method & Path**: `POST /api/v1/tutor/conversations`
- **Access**: Enrolled student
- **Request Body**:
```json
{
  "teacherSubjectId": "e30e71ab-5e60-449e-b5c6-55bb24c8c114",
  "curriculumTopicId": "top_01",
  "title": "Understanding Squeeze Theorem"
}
```
- **Response `201 Created`**: Conversation record.

#### 6.2 Get or Initialize Active Subject Conversation (Isolated Per Subject)
- **Method & Path**: `GET /api/v1/tutor/subjects/:subjectId/active`
- **Access**: Enrolled student member of `:subjectId`
- **Description**: Returns the active persistent Socratic conversation thread and full message history for the student in that specific subject offering. If no conversation exists yet, automatically creates one with an introductory greeting grounded in that course.
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "conv_991",
      "student_id": "stu_01",
      "teacher_subject_id": "e30e71ab-5e60-449e-b5c6-55bb24c8c114",
      "title": "MATH101 Socratic Session",
      "session_type": "ai_tutor",
      "updated_at": "2026-10-24T05:58:00Z"
    },
    "messages": [
      {
        "id": "msg_01",
        "conversation_id": "conv_991",
        "role": "assistant",
        "content": "Hello! I'm your Socratic AI Tutor for Calculus. How can I guide your understanding today?",
        "created_at": "2026-10-24T05:58:01Z"
      }
    ]
  }
}
```

#### 6.3 List Student's Conversations for Subject
- **Method & Path**: `GET /api/v1/tutor/conversations/:subjectId`
- **Access**: Enrolled student

#### 6.4 Get Conversation Message History
- **Method & Path**: `GET /api/v1/tutor/conversations/:conversationId/messages`
- **Access**: Conversation owner

#### 6.5 Send Message & Interactive Guidance (AI Tutor Agent - Method 2 Interactive Action Widgets)
- **Method & Path**: `POST /api/v1/tutor/conversations/:conversationId/chat`
- **Access**: Conversation owner
- **Request Body**:
```json
{
  "message": "factor",
  "curriculumTopicId": "top_01",
  "stream": false
}
```
- **Response `200 OK` (JSON Envelope)**:
```json
{
  "success": true,
  "data": {
    "id": "msg_02",
    "role": "assistant",
    "content": "Spot on! By factoring into (x-2)(x+2), the (x-2) cancels with the denominator. Now evaluate (x+2) as x approaches 2.",
    "actionWidgets": [
      { "type": "pill", "label": "4", "value": "4" },
      { "type": "pill", "label": "0", "value": "0" },
      { "type": "pill", "label": "2", "value": "2" }
    ],
    "currentMastery": 0.70,
    "isResolved": true
  }
}
```
*Note: Real-time SSE token streaming is also supported when `stream: true`.*

---

### Module 7: Topic Mastery & Analytics (`/mastery`)

#### 7.1 Get Student's Topic Mastery Profile
- **Method & Path**: `GET /api/v1/mastery/:subjectId/me`
- **Access**: Enrolled student
- **Response `200 OK`**: Array of topic mastery records with confidence scores.

#### 7.2 Get Specific Student's Mastery Profile (Teacher View)
- **Method & Path**: `GET /api/v1/mastery/:subjectId/students/:studentId`
- **Access**: Instructor of `:subjectId`

#### 7.3 Get Mastery Progression History
- **Method & Path**: `GET /api/v1/mastery/:subjectId/history?studentId=uuid&topicId=uuid`
- **Access**: Enrolled student (self) or instructor

#### 7.4 Get Class-Wide Mastery Overview Dashboard
- **Method & Path**: `GET /api/v1/mastery/:subjectId/overview`
- **Access**: Instructor of `:subjectId`
- **Response `200 OK`**: Topic-by-topic class averages, struggle thresholds, and enrollment stats.

#### 7.5 Get Class-Wide Database-Driven Analytics Dashboard
- **Method & Path**: `GET /api/v1/mastery/:subjectId/analytics`
- **Access**: Instructor of `:subjectId` or Admin
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "overallMastery": 78,
    "growthRate": "+18% Growth",
    "trendData": [
      { "quiz": "Q1: Relational Algebra", "fullTitle": "Quiz 1: Relational Algebra & Keys Diagnostic", "avgScore": 68, "benchmark": 70 }
    ],
    "distributionData": [
      { "name": "Mastered", "value": 3, "color": "#00d2ff" },
      { "name": "Developing", "value": 2, "color": "#38bdf8" },
      { "name": "Needs Support", "value": 2, "color": "#8b5cf6" }
    ],
    "strongAreas": [
      { "topic": "Relational Data Model & Keys", "avgScore": 88, "praise": "Students demonstrate solid proficiency with relational data model & keys concepts." }
    ],
    "variationSummary": [
      { "quizTitle": "Quiz 2: Complex SQL & Normal Forms", "change": "+7% Shift", "isPositive": true, "detail": "Positive progression of 7% over prior assessment." }
    ],
    "insights": [],
    "students": [
      {
        "id": "uuid",
        "fullName": "Emma Watson",
        "email": "emma.watson@institution.edu",
        "loginId": "STD-2026-9999",
        "college": "Faculty of Engineering",
        "overallMastery": 94,
        "tier": "Mastered",
        "quizzesCompleted": 4,
        "totalQuizzes": 4,
        "avgScore": 100,
        "studentTrend": [{ "quiz": "Q1", "quizTitle": "Quiz 1...", "score": 100, "hasTaken": true }],
        "topicBreakdown": [{ "topicId": "uuid", "title": "Relational Data Model & Keys", "score": 93, "tier": "Mastered" }]
      }
    ]
  }
}
```

#### 7.6 Get Student Progress & Topic Readiness
- **Method & Path**: `GET /api/v1/mastery/:subjectId/student-progress?studentId=uuid`
- **Access**: Enrolled student (self) or instructor
- **Description**: Returns qualitative readiness and completed quiz evaluations without exposing raw numeric grades to students (preserving student privacy and motivation).
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "completedQuizzes": [
      { "id": "uuid", "number": "Quiz 1", "title": "Quiz 1: Relational Algebra & Keys", "submittedAt": "2026-10-01T10:00:00Z", "score": 3, "maxScore": 4, "duration": "20 mins" }
    ],
    "topicReadiness": [
      { "topicId": "uuid", "title": "Relational Data Model & Keys", "status": "Mastered", "lastAssessedAt": "2026-10-01T10:00:00Z" }
    ],
    "overallStanding": "On Track",
    "completedCount": 4,
    "totalCount": 4
  }
}
```

---

### Module 8: Teacher Diagnostic Insights (`/insights`)

#### 8.1 List Teacher Subject Insights
- **Method & Path**: `GET /api/v1/insights/:subjectId`
- **Access**: Instructor of `:subjectId`
- **Query Params**: `?studentId=uuid&status=active|resolved|dismissed` (optional filters)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ins_01",
      "insightType": "weak_areas",
      "title": "Knowledge Gap: Removable Discontinuities",
      "description": "Student evaluated 0/0 directly instead of factoring first.",
      "curriculumTopicId": "top_01",
      "studentId": "std_01",
      "evidence": {
        "initialScore": 0.40,
        "diagnosedGap": "Direct substitution yielding indeterminate 0/0 without factoring",
        "missedQuestions": ["Q2", "Q3"],
        "actionPlan": "Socratic Micro-Ladder on factoring difference of squares",
        "actionWidgets": [
          { "type": "pill", "label": "Factor into (x-2)(x+2)", "value": "factor" }
        ],
        "progressTrace": [
          { "turn": 1, "studentResponse": "factor", "understandingDelta": 0.20, "timestamp": "2026-10-24T01:30:00Z" }
        ],
        "teacherAdvice": "Concept secure. Reinforce in lecture."
      },
      "status": "resolved",
      "createdAt": "2026-10-24T01:25:00.000Z",
      "updatedAt": "2026-10-24T01:30:00.000Z"
    }
  ]
}
```

#### 8.2 Synthesize Class Diagnostic Summary (Traditional LLM Service)
- **Method & Path**: `POST /api/v1/insights/:subjectId/generate`
- **Access**: Instructor of `:subjectId`
- **Response `200 OK`**: Newly synthesized actionable pedagogical recommendations.

#### 8.3 Update Insight Status
- **Method & Path**: `PATCH /api/v1/insights/detail/:insightId/status`
- **Access**: Instructor of `:subjectId`
- **Request Body**:
```json
{
  "status": "resolved"
}
```

#### 8.4 Delete Insight
- **Method & Path**: `DELETE /api/v1/insights/detail/:insightId`
- **Access**: Instructor of `:subjectId`
