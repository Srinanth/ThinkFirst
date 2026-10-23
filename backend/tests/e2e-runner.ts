import http from 'http';
import fs from 'fs';
import path from 'path';
import app from '../src/app.js';
import { getOrCreateTestUser, TestAuthSession } from './setup-auth.js';

interface TestRecord {
  id: number;
  category: string;
  name: string;
  method: string;
  url: string;
  requestHeaders: Record<string, string>;
  requestBody?: any;
  responseStatus: number;
  responseStatusText: string;
  responseTimeMs: number;
  responseBody: any;
  passed: boolean;
  notes?: string;
}

const TEST_PORT = 5055;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;
const testRecords: TestRecord[] = [];
let testCounter = 1;

async function executeHttp(options: {
  category: string;
  name: string;
  method: string;
  path: string;
  token?: string;
  body?: any;
  expectedStatus: number | number[];
}): Promise<any> {
  const url = `${BASE_URL}${options.path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const startTime = Date.now();
  let responseStatus = 0;
  let responseStatusText = '';
  let responseBody: any = null;

  try {
    const fetchOptions: RequestInit = {
      method: options.method,
      headers,
    };

    if (options.body && options.method !== 'GET' && options.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const res = await fetch(url, fetchOptions);
    responseStatus = res.status;
    responseStatusText = res.statusText;
    const duration = Date.now() - startTime;

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      responseBody = await res.json();
    } else {
      responseBody = await res.text();
    }

    const expectedArr = Array.isArray(options.expectedStatus) ? options.expectedStatus : [options.expectedStatus];
    const passed = expectedArr.includes(responseStatus);

    testRecords.push({
      id: testCounter++,
      category: options.category,
      name: options.name,
      method: options.method,
      url,
      requestHeaders: headers,
      requestBody: options.body,
      responseStatus,
      responseStatusText,
      responseTimeMs: duration,
      responseBody,
      passed,
    });

    console.log(`[Test #${testCounter - 1}] [${passed ? 'PASS' : 'FAIL'}] ${options.method} ${options.path} -> ${responseStatus} (${duration}ms)`);
    return responseBody;
  } catch (err: any) {
    const duration = Date.now() - startTime;
    testRecords.push({
      id: testCounter++,
      category: options.category,
      name: options.name,
      method: options.method,
      url,
      requestHeaders: headers,
      requestBody: options.body,
      responseStatus: 500,
      responseStatusText: 'Internal Client Fetch Error',
      responseTimeMs: duration,
      responseBody: { error: err?.message || String(err) },
      passed: false,
    });

    console.error(`[Test #${testCounter - 1}] [ERROR] ${options.method} ${options.path}:`, err);
    throw err;
  }
}

function generateMarkdownReport(
  teacher: TestAuthSession,
  student: TestAuthSession,
  totalDurationMs: number
): string {
  const totalTests = testRecords.length;
  const passedTests = testRecords.filter((r) => r.passed).length;
  const failedTests = totalTests - passedTests;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);

  let md = `# ThinkFirst Backend — End-to-End Test Execution Report\n\n`;
  md += `**Execution Date**: ${new Date().toISOString()}  \n`;
  md += `**Environment**: Local Test Suite against live Supabase Database & Google Gemini API  \n`;
  md += `**Test Port**: \`${TEST_PORT}\`  \n`;
  md += `**Gemini Model**: \`gemini-2.5-flash\` / \`gemini-3.8-flash\` | **Embeddings**: \`gemini-embedding-001\` (768-dim)  \n`;
  md += `**Test Teacher**: \`${teacher.email}\` (\`${teacher.userId}\`)  \n`;
  md += `**Test Student**: \`${student.email}\` (\`${student.userId}\`)  \n\n`;

  md += `## 1. Executive Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|---|---|\n`;
  md += `| **Total Test Scenarios** | \`${totalTests}\` |\n`;
  md += `| **Passed** | \`${passedTests}\` ✅ |\n`;
  md += `| **Failed** | \`${failedTests}\` ${failedTests > 0 ? '❌' : ''} |\n`;
  md += `| **Pass Rate** | **${passRate}%** |\n`;
  md += `| **Total Execution Duration** | \`${(totalDurationMs / 1000).toFixed(2)}s\` |\n\n`;

  md += `## 2. Test Execution Matrix\n\n`;
  md += `| # | Category | Scenario / Endpoint | Method | Status | Latency | Result |\n`;
  md += `|---|---|---|:---:|:---:|:---:|:---:|\n`;

  for (const r of testRecords) {
    const urlObj = new URL(r.url);
    const shortPath = urlObj.pathname;
    const badge = r.passed ? '✅ PASS' : '❌ FAIL';
    md += `| ${r.id} | ${r.category} | ${r.name} | \`${r.method}\` | \`${r.responseStatus}\` | ${r.responseTimeMs}ms | ${badge} |\n`;
  }

  md += `\n---\n\n`;
  md += `## 3. Comprehensive Request & Response Outputs\n\n`;

  for (const r of testRecords) {
    const urlObj = new URL(r.url);
    const badge = r.passed ? '✅ PASS' : '❌ FAIL';

    md += `### Test #${r.id}: ${r.name} (${badge})\n\n`;
    md += `- **Category**: ${r.category}\n`;
    md += `- **Endpoint**: \`${r.method} ${urlObj.pathname}\`\n`;
    md += `- **Response Status**: \`${r.responseStatus} ${r.responseStatusText}\` (${r.responseTimeMs}ms)\n\n`;

    md += `#### Request\n\n`;
    md += `\`\`\`http\n`;
    md += `${r.method} ${urlObj.pathname} HTTP/1.1\n`;
    for (const [k, v] of Object.entries(r.requestHeaders)) {
      if (k.toLowerCase() === 'authorization') {
        md += `${k}: Bearer ${v.substring(7, 25)}...[TRUNCATED]\n`;
      } else {
        md += `${k}: ${v}\n`;
      }
    }
    md += `\`\`\`\n\n`;

    if (r.requestBody) {
      md += `**Request Payload**:\n`;
      md += `\`\`\`json\n${JSON.stringify(r.requestBody, null, 2)}\n\`\`\`\n\n`;
    }

    md += `#### Response\n\n`;
    md += `**Response Body**:\n`;
    md += `\`\`\`json\n${JSON.stringify(r.responseBody, null, 2)}\n\`\`\`\n\n`;
    md += `---\n\n`;
  }

  return md;
}

async function runAllTests() {
  console.log('========================================================');
  console.log('🚀 ThinkFirst Comprehensive End-to-End Test Suite');
  console.log('========================================================\n');

  const suiteStartTime = Date.now();

  // 1. Authenticate Teacher and Student
  console.log('🔐 Step 0: Setting up authenticated test accounts...');
  const teacher = await getOrCreateTestUser('teacher.demo@thinkfirst.edu', 'teacher', 'Dr. Alistair Vance');
  const student = await getOrCreateTestUser('student.demo@thinkfirst.edu', 'student', 'Lucas Chen');
  console.log(`Teacher Token initialized: ${teacher.accessToken.substring(0, 15)}...`);
  console.log(`Student Token initialized: ${student.accessToken.substring(0, 15)}...\n`);

  // 2. Start HTTP Test Server
  const server = http.createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(TEST_PORT, () => {
      console.log(`📡 In-Memory Test Server running on http://127.0.0.1:${TEST_PORT}\n`);
      resolve();
    });
  });

  try {
    // Dynamic identifiers created during test flow
    let subjectId = '';
    let manualTopicId = '';
    let parsedTopicId = '';
    let materialId = '';
    let quizId = '';
    let questionId = '';
    let attemptId = '';
    let conversationId = '';
    let insightId = '';

    // ==========================================
    // 1. Healthcheck
    // ==========================================
    await executeHttp({
      category: 'System Health',
      name: 'Server Health & Diagnostics Check',
      method: 'GET',
      path: '/health',
      expectedStatus: 200,
    });

    // ==========================================
    // 2. Auth & Profiles
    // ==========================================
    await executeHttp({
      category: 'Auth & Profiles',
      name: 'Retrieve Current Teacher Profile',
      method: 'GET',
      path: '/api/v1/auth/me',
      token: teacher.accessToken,
      expectedStatus: 200,
    });

    await executeHttp({
      category: 'Auth & Profiles',
      name: 'Retrieve Current Student Profile',
      method: 'GET',
      path: '/api/v1/auth/me',
      token: student.accessToken,
      expectedStatus: 200,
    });

    await executeHttp({
      category: 'Auth & Profiles',
      name: 'Update Student Profile Metadata',
      method: 'PUT',
      path: '/api/v1/auth/me',
      token: student.accessToken,
      body: {
        fullName: 'Lucas Chen, Honors Scholar',
      },
      expectedStatus: 200,
    });

    // ==========================================
    // 3. Subjects & Memberships
    // ==========================================
    const testSessionSuffix = Date.now().toString().slice(-4);
    const createSubRes = await executeHttp({
      category: 'Subjects & Memberships',
      name: 'Teacher Creates Subject Offering',
      method: 'POST',
      path: '/api/v1/subjects',
      token: teacher.accessToken,
      body: {
        subject: `Differential Calculus & Analysis (Run ${testSessionSuffix})`,
        academicYear: '2025-2026',
        className: `Sec-${testSessionSuffix}`,
      },
      expectedStatus: 201,
    });
    subjectId = createSubRes.data?.id;

    await executeHttp({
      category: 'Subjects & Memberships',
      name: 'Teacher Lists Owned Subjects',
      method: 'GET',
      path: '/api/v1/subjects',
      token: teacher.accessToken,
      expectedStatus: 200,
    });

    await executeHttp({
      category: 'Subjects & Memberships',
      name: 'Student Self-Enrolls in Subject Offering',
      method: 'POST',
      path: `/api/v1/subjects/${subjectId}/join`,
      token: student.accessToken,
      expectedStatus: 200,
    });

    await executeHttp({
      category: 'Subjects & Memberships',
      name: 'Inspect Subject Roster Members',
      method: 'GET',
      path: `/api/v1/subjects/${subjectId}/members`,
      token: teacher.accessToken,
      expectedStatus: 200,
    });

    // ==========================================
    // 4. Curriculum Topics & AI Syllabus Agent
    // ==========================================
    const manualTopicRes = await executeHttp({
      category: 'Curriculum Topics',
      name: 'Teacher Creates Manual Curriculum Topic Node',
      method: 'POST',
      path: `/api/v1/curriculum/${subjectId}/topics`,
      token: teacher.accessToken,
      body: {
        title: 'Module 1: Foundations of Limits and Continuity',
        description: 'Epsilon-delta definitions, squeeze theorem, and one-sided limits.',
        nodeType: 'module',
      },
      expectedStatus: 201,
    });
    manualTopicId = manualTopicRes.data?.id;

    const parseSyllabusRes = await executeHttp({
      category: 'Curriculum Topics',
      name: 'Curriculum Agent: Parse Syllabus into Structured Tree',
      method: 'POST',
      path: `/api/v1/curriculum/${subjectId}/generate`,
      token: teacher.accessToken,
      body: {
        syllabusText: `Course: Advanced Differential Calculus. 
Module 2: Differential Foundations and Transcendental Derivatives.
Topic 2.1: The Derivative as a Limit of Difference Quotients.
Topic 2.2: Product, Quotient, and Chain Rules.
Module 3: Applications of the Derivative.
Topic 3.1: Mean Value Theorem and Extreme Value Theorem.
Topic 3.2: Optimization and Related Rates.`,
      },
      expectedStatus: 201,
    });

    const treeRes = await executeHttp({
      category: 'Curriculum Topics',
      name: 'Retrieve Hierarchical Curriculum Tree',
      method: 'GET',
      path: `/api/v1/curriculum/${subjectId}/tree`,
      token: student.accessToken,
      expectedStatus: 200,
    });

    parsedTopicId = manualTopicId || treeRes.data?.[0]?.id;

    // ==========================================
    // 5. Learning Materials & Vector Embeddings
    // ==========================================
    const createMatRes = await executeHttp({
      category: 'Learning Materials & Vector Search',
      name: 'Teacher Registers Learning Material Metadata',
      method: 'POST',
      path: `/api/v1/materials/${subjectId}`,
      token: teacher.accessToken,
      body: {
        title: 'Lecture 04: The Squeeze Theorem and Trigonometric Limits',
        filePath: 'course_materials/lecture_04_squeeze_theorem.pdf',
        fileType: 'pdf',
        materialType: 'lecture_notes',
        curriculumTopicId: parsedTopicId,
      },
      expectedStatus: 201,
    });
    materialId = createMatRes.data?.id;

    await executeHttp({
      category: 'Learning Materials & Vector Search',
      name: 'Ingest Text & Generate 768-dim Vector Embeddings',
      method: 'POST',
      path: `/api/v1/materials/detail/${materialId}/ingest`,
      token: teacher.accessToken,
      body: {
        rawText: `The Squeeze Theorem (also known as the Sandwich Theorem) states that if f(x) <= g(x) <= h(x) for all x in an open interval containing c, and lim_{x->c} f(x) = lim_{x->c} h(x) = L, then lim_{x->c} g(x) = L.

A canonical application of the Squeeze Theorem is evaluating the limit as x approaches 0 of x^2 * sin(1/x). Since the sine function is bounded between -1 and 1, we have -1 <= sin(1/x) <= 1. Multiplying by x^2 yields -x^2 <= x^2 * sin(1/x) <= x^2. Since both -x^2 and x^2 approach 0 as x approaches 0, the squeeze theorem forces lim_{x->0} x^2 * sin(1/x) = 0.

Another fundamental trigonometric limit derived from geometric bounds on the unit circle is lim_{theta->0} (sin theta)/theta = 1.`,
      },
      expectedStatus: 200,
    });

    await executeHttp({
      category: 'Learning Materials & Vector Search',
      name: 'List Materials Registered Under Subject',
      method: 'GET',
      path: `/api/v1/materials/${subjectId}`,
      token: student.accessToken,
      expectedStatus: 200,
    });

    await executeHttp({
      category: 'Learning Materials & Vector Search',
      name: 'Semantic Vector Similarity Search Over Course Notes',
      method: 'POST',
      path: `/api/v1/materials/${subjectId}/search`,
      token: student.accessToken,
      body: {
        query: 'What is the limit of x^2 sin(1/x) as x approaches 0 using squeeze theorem?',
        matchCount: 3,
        matchThreshold: 0.3,
      },
      expectedStatus: 200,
    });

    // ==========================================
    // 6. Quizzes, Attempts & Deterministic Mastery Engine
    // ==========================================
    const genQuizRes = await executeHttp({
      category: 'Quizzes & Deterministic Mastery',
      name: 'Quiz Agent: Generate Concept-Diagnostic Quiz',
      method: 'POST',
      path: `/api/v1/quizzes/${subjectId}/generate`,
      token: teacher.accessToken,
      body: {
        title: 'Diagnostic Quiz: Squeeze Theorem & Continuity',
        curriculumTopicId: parsedTopicId,
        difficulty: 'medium',
        questionCount: 2,
        examDuration: 15,
      },
      expectedStatus: 201,
    });
    quizId = genQuizRes.data?.id;
    questionId = genQuizRes.data?.questions?.[0]?.id;

    await executeHttp({
      category: 'Quizzes & Deterministic Mastery',
      name: 'Inspect Quiz Details & Questions',
      method: 'GET',
      path: `/api/v1/quizzes/detail/${quizId}`,
      token: student.accessToken,
      expectedStatus: 200,
    });

    const startAttemptRes = await executeHttp({
      category: 'Quizzes & Deterministic Mastery',
      name: 'Student Starts Timed Quiz Attempt',
      method: 'POST',
      path: `/api/v1/quizzes/detail/${quizId}/attempts`,
      token: student.accessToken,
      expectedStatus: 201,
    });
    attemptId = startAttemptRes.data?.id;

    await executeHttp({
      category: 'Quizzes & Deterministic Mastery',
      name: 'Submit Attempt: Evaluator Agent & Deterministic Mastery Update',
      method: 'POST',
      path: `/api/v1/quizzes/attempts/${attemptId}/submit`,
      token: student.accessToken,
      body: {
        responses: [
          {
            questionId,
            studentAnswer: 'The limit is 0 because -x^2 <= x^2 sin(1/x) <= x^2, and both bounds tend to 0.',
          },
        ],
      },
      expectedStatus: 200,
    });

    await executeHttp({
      category: 'Quizzes & Deterministic Mastery',
      name: 'Student Inspects Graded Attempt & Evaluator Rubrics',
      method: 'GET',
      path: `/api/v1/quizzes/attempts/${attemptId}/results`,
      token: student.accessToken,
      expectedStatus: 200,
    });

    // ==========================================
    // 7. Topic Mastery Profile & Class Analytics
    // ==========================================
    await executeHttp({
      category: 'Mastery Engine',
      name: 'Student Inspects Own Topic Mastery Score',
      method: 'GET',
      path: `/api/v1/mastery/${subjectId}/me`,
      token: student.accessToken,
      expectedStatus: 200,
    });

    await executeHttp({
      category: 'Mastery Engine',
      name: 'Inspect Student Mastery Audit History Timeline',
      method: 'GET',
      path: `/api/v1/mastery/${subjectId}/history?studentId=${student.userId}`,
      token: student.accessToken,
      expectedStatus: 200,
    });

    await executeHttp({
      category: 'Mastery Engine',
      name: 'Teacher Inspects Class-Wide Mastery Overview Dashboard',
      method: 'GET',
      path: `/api/v1/mastery/${subjectId}/overview`,
      token: teacher.accessToken,
      expectedStatus: 200,
    });

    // ==========================================
    // 8. Socratic Tutor Agent
    // ==========================================
    const convRes = await executeHttp({
      category: 'Socratic Tutor',
      name: 'Student Starts Socratic Tutoring Conversation',
      method: 'POST',
      path: '/api/v1/tutor/conversations',
      token: student.accessToken,
      body: {
        teacherSubjectId: subjectId,
        curriculumTopicId: parsedTopicId,
        title: 'Mastering Squeeze Theorem Bounding Conditions',
        sessionType: 'ai_tutor',
      },
      expectedStatus: 201,
    });
    conversationId = convRes.data?.id;

    await executeHttp({
      category: 'Socratic Tutor',
      name: 'Student Inquires with Socratic Tutor (Non-streaming)',
      method: 'POST',
      path: `/api/v1/tutor/conversations/${conversationId}/chat`,
      token: student.accessToken,
      body: {
        message: 'Can you explain why we need both an upper and lower bound function in the Squeeze Theorem?',
        curriculumTopicId: parsedTopicId,
        stream: false,
      },
      expectedStatus: [200, 201],
    });

    await executeHttp({
      category: 'Socratic Tutor',
      name: 'Retrieve Conversation Message History',
      method: 'GET',
      path: `/api/v1/tutor/conversations/${conversationId}/messages`,
      token: student.accessToken,
      expectedStatus: 200,
    });

    // ==========================================
    // 9. Teacher Diagnostic Insights
    // ==========================================
    const genInsightRes = await executeHttp({
      category: 'Teacher Insights',
      name: 'Insight Agent: Synthesize Class Diagnostic Insights',
      method: 'POST',
      path: `/api/v1/insights/${subjectId}/generate`,
      token: teacher.accessToken,
      expectedStatus: [200, 201],
    });
    insightId = genInsightRes.data?.[0]?.id;

    await executeHttp({
      category: 'Teacher Insights',
      name: 'Teacher Lists Generated Diagnostic Insights',
      method: 'GET',
      path: `/api/v1/insights/${subjectId}`,
      token: teacher.accessToken,
      expectedStatus: 200,
    });

    if (insightId) {
      await executeHttp({
        category: 'Teacher Insights',
        name: 'Teacher Updates Insight Workflow Status',
        method: 'PATCH',
        path: `/api/v1/insights/detail/${insightId}/status`,
        token: teacher.accessToken,
        body: {
          status: 'resolved',
        },
        expectedStatus: 200,
      });
    }
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => {
        console.log('\n🛑 Test Server successfully shut down.');
        resolve();
      });
    });
  }

  const suiteDurationMs = Date.now() - suiteStartTime;
  console.log(`\n✨ Test Suite completed in ${(suiteDurationMs / 1000).toFixed(2)}s`);

  // Generate Markdown Document
  const reportPath = path.resolve(process.cwd(), 'tests', 'TEST_RESULTS.md');
  const reportMarkdown = generateMarkdownReport(teacher, student, suiteDurationMs);
  fs.writeFileSync(reportPath, reportMarkdown, 'utf8');
  console.log(`📝 Full request/response report written to: ${reportPath}`);

  const passedTests = testRecords.filter((r) => r.passed).length;
  if (passedTests !== testRecords.length) {
    console.error(`❌ Some tests failed: ${testRecords.length - passedTests} failure(s).`);
    process.exit(1);
  } else {
    console.log(`🎉 All ${testRecords.length} end-to-end HTTP tests PASSED with 100% success rate!`);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal Test Runner error:', err);
  process.exit(1);
});
