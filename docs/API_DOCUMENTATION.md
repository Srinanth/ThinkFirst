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
- **Method & Path**: `PUT /api/v1/profiles/me`
- **Access**: Authenticated
- **Request Body**:
```json
{
  "fullName": "Prof. Alistair Vance, Ph.D."
}
```

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

#### 2.3 Enroll in Subject (Student Self-Enrollment)
- **Method & Path**: `POST /api/v1/subjects/:subjectId/join`
- **Access**: `student`
- **Response `200 OK`**: Membership confirmation.

#### 2.4 Get Enrolled Students Roster
- **Method & Path**: `GET /api/v1/subjects/:subjectId/members`
- **Access**: Instructor or enrolled member of `:subjectId`
- **Response `200 OK`**: Array of enrolled students.

---

### Module 3: Curriculum Topics (`/curriculum`)

#### 3.1 Generate Curriculum from Syllabus (Curriculum Agent)
- **Method & Path**: `POST /api/v1/curriculum/:subjectId/generate`
- **Access**: Instructor of `:subjectId`
- **Request Body**:
```json
{
  "syllabusText": "Module 1: Differential Calculus. Topic 1.1: Limit Definitions. Topic 1.2: Chain Rule..."
}
```
- **Response `201 Created`**: Hierarchical topic list created in `curriculum_topics`.

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

#### 4.1 Register Learning Material Metadata
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

#### 4.2 List Materials for Subject
- **Method & Path**: `GET /api/v1/materials/:subjectId`
- **Access**: Subject members
- **Query Params**: `?topicId=uuid` (optional)
- **Response `200 OK`**: Array of materials.

#### 4.3 Ingest Material Content & Generate Vector Embeddings
- **Method & Path**: `POST /api/v1/materials/detail/:materialId/ingest`
- **Access**: Instructor of subject
- **Request Body**:
```json
{
  "content": "The Squeeze Theorem establishes limits through boundary functions..."
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "materialId": "mat_881",
    "chunksCount": 5
  }
}
```

#### 4.4 Semantic Vector Search over Subject Materials
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
- **Access**: Subject instructor
- **Request Body**:
```json
{
  "curriculumTopicId": "top_01",
  "title": "Diagnostic Quiz - Squeeze Theorem",
  "difficulty": "medium",
  "questionCount": 3
}
```
- **Response `201 Created`**: Generated quiz with `quiz_questions` stored.

#### 5.4 Get Quiz Details & Questions
- **Method & Path**: `GET /api/v1/quizzes/detail/:quizId`
- **Access**: Authenticated

#### 5.5 Start Quiz Attempt
- **Method & Path**: `POST /api/v1/quizzes/detail/:quizId/attempts`
- **Access**: Enrolled student
- **Response `201 Created`**: New `quiz_attempts` session record.

#### 5.6 Submit Attempt Session (Evaluator Agent + Deterministic Mastery Engine)
- **Method & Path**: `POST /api/v1/quizzes/attempts/:attemptId/submit`
- **Access**: Student owner of attempt
- **Request Body**:
```json
{
  "responses": [
    {
      "questionId": "qq_01",
      "studentAnswer": {
        "selectedOption": "cos(x)",
        "explanation": "Derivative of sin(x) is cos(x)"
      }
    }
  ]
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "attemptId": "att_01",
    "score": 100,
    "evaluatedResponses": [
      {
        "questionId": "qq_01",
        "isCorrect": true,
        "marksAwarded": 1.0,
        "feedback": "Correct reasoning on trigonometric derivatives."
      }
    ],
    "masteryUpdate": {
      "curriculumTopicId": "top_01",
      "oldScore": 0.50,
      "newScore": 0.65,
      "confidence": 0.85
    }
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

#### 6.2 List Student's Conversations for Subject
- **Method & Path**: `GET /api/v1/tutor/conversations/:subjectId`
- **Access**: Enrolled student

#### 6.3 Get Conversation Message History
- **Method & Path**: `GET /api/v1/tutor/conversations/:conversationId/messages`
- **Access**: Conversation owner

#### 6.4 Send Message & Stream Socratic Guidance (Tutor Agent)
- **Method & Path**: `POST /api/v1/tutor/conversations/:conversationId/chat`
- **Access**: Conversation owner
- **Request Body**:
```json
{
  "content": "Can you solve this limit for me: lim x->0 (sin x)/x?",
  "stream": true
}
```
- **Response**: SSE token stream (`text/event-stream`) or JSON response envelope (`stream: false`).

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

---

### Module 8: Teacher Diagnostic Insights (`/insights`)

#### 8.1 List Teacher Subject Insights
- **Method & Path**: `GET /api/v1/insights/:subjectId`
- **Access**: Instructor of `:subjectId`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "ins_01",
      "insightType": "struggling_topic",
      "title": "High Difficulty: Squeeze Theorem",
      "description": "58% of students submitted answers missing the lower bounding inequality.",
      "curriculumTopicId": "top_01",
      "status": "active"
    }
  ]
}
```

#### 8.2 Synthesize Fresh Class Diagnostic Insights (Insight Agent)
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
