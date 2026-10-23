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

### Module 1: Authentication & User Profiles (`/auth`, `/profiles`)

#### 1.1 Get Current User Profile
- **Method & Path**: `GET /api/v1/auth/me`
- **Access**: Authenticated (`student`, `teacher`, `admin`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "f8983981-d102-4cf4-9123-ecba98765432",
    "email": "teacher@school.edu",
    "fullName": "Prof. Alistair Vance",
    "role": "teacher",
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

### Module 3: Curriculum Topics (`/subjects/:subjectId/topics`)

#### 3.1 Generate Curriculum from Syllabus (Curriculum Agent)
- **Method & Path**: `POST /api/v1/subjects/:subjectId/topics/generate`
- **Access**: Instructor of `:subjectId`
- **Request Body**:
```json
{
  "syllabusText": "Module 1: Differential Calculus. Topic 1.1: Limit Definitions. Topic 1.2: Chain Rule..."
}
```
- **Response `201 Created`**: Hierarchical topic list created in `curriculum_topics`.

#### 3.2 List Curriculum Topics for Subject
- **Method & Path**: `GET /api/v1/subjects/:subjectId/topics`
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
      "position": 1
    }
  ]
}
```

---

### Module 4: Learning Materials & Vector Embeddings (`/subjects/:subjectId/materials`)

#### 4.1 Ingest Learning Material & Generate Embeddings (Notes Agent)
- **Method & Path**: `POST /api/v1/subjects/:subjectId/materials`
- **Access**: Instructor of `:subjectId`
- **Request Body**:
```json
{
  "curriculumTopicId": "top_01",
  "title": "Lecture 03 - Squeeze Theorem",
  "filePath": "materials/calc/lecture_03.pdf",
  "fileType": "PDF",
  "materialType": "notes",
  "content": "The Squeeze Theorem establishes limits through boundary functions..."
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "materialId": "mat_881",
    "processingStatus": "ready",
    "chunksGenerated": 5
  }
}
```

#### 4.2 Semantic Vector Search over Subject Materials
- **Method & Path**: `POST /api/v1/subjects/:subjectId/materials/search`
- **Access**: Subject members
- **Request Body**:
```json
{
  "query": "How is the squeeze theorem used for sin(x)/x?",
  "matchThreshold": 0.65,
  "matchCount": 3
}
```
- **Response `200 OK`**: Top matching chunks with similarity scores.

---

### Module 5: Quizzes, Questions & Attempts (`/subjects/:subjectId/quizzes`, `/quizzes`)

#### 5.1 Generate Targeted Diagnostic Quiz (Quiz Agent)
- **Method & Path**: `POST /api/v1/subjects/:subjectId/quizzes/generate`
- **Access**: Subject instructor or enrolled student
- **Request Body**:
```json
{
  "curriculumTopicId": "top_01",
  "difficulty": "medium",
  "questionCount": 3
}
```
- **Response `201 Created`**: Generated quiz with `quiz_questions` stored.

#### 5.2 Start Quiz Attempt
- **Method & Path**: `POST /api/v1/quizzes/:quizId/attempts`
- **Access**: Enrolled student
- **Response `201 Created`**: New `quiz_attempts` session record.

#### 5.3 Submit Answer to Question (Evaluator Agent + Mastery Engine)
- **Method & Path**: `POST /api/v1/quiz-attempts/:attemptId/responses`
- **Access**: Student owner of attempt
- **Request Body**:
```json
{
  "questionId": "qq_01",
  "studentAnswer": {
    "selectedOption": "cos(x)",
    "reasoning": "Differentiating sin(x) with respect to x yields cos(x)."
  }
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "responseId": "resp_9921",
    "isCorrect": true,
    "marksAwarded": 1.0,
    "feedback": "Correct! Excellent reasoning on applying basic trigonometric derivative rules.",
    "updatedTopicMastery": {
      "curriculumTopicId": "top_01",
      "masteryScore": 0.85,
      "confidence": 0.90
    }
  }
}
```

---

### Module 6: Socratic Tutor & Conversations (`/tutor`)

#### 6.1 Create or Resume Socratic Conversation
- **Method & Path**: `POST /api/v1/subjects/:subjectId/tutor/conversations`
- **Access**: Enrolled student
- **Request Body**:
```json
{
  "title": "Understanding Squeeze Theorem",
  "learningSessionId": "optional_sess_id"
}
```
- **Response `201 Created`**: Conversation record.

#### 6.2 Send Message & Stream Socratic Guidance (Tutor Agent)
- **Method & Path**: `POST /api/v1/tutor/conversations/:conversationId/messages`
- **Access**: Conversation owner
- **Request Body**:
```json
{
  "content": "Can you solve this limit for me: lim x->0 (sin x)/x?",
  "curriculumTopicId": "top_01"
}
```
- **Response `200 OK` (or SSE token stream)**:
```json
{
  "success": true,
  "data": {
    "messageId": "msg_412",
    "role": "assistant",
    "content": "I won't give you the solution directly, but let's explore it! If you evaluate directly at x = 0, what indeterminate form do you observe? What does your textbook say about the geometric bounds between sin(x), x, and tan(x) on the unit circle?"
  }
}
```

---

### Module 7: Topic Mastery & Analytics (`/subjects/:subjectId/mastery`, `/subjects/:subjectId/insights`)

#### 7.1 Get Student's Topic Mastery Profile
- **Method & Path**: `GET /api/v1/subjects/:subjectId/mastery/me`
- **Access**: Enrolled student
- **Response `200 OK`**: Array of topic mastery records with confidence scores.

#### 7.2 Get Teacher Subject Insights (Teacher Dashboard)
- **Method & Path**: `GET /api/v1/subjects/:subjectId/insights`
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
