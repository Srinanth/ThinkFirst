import { generateJSON } from './gemini.client.js';

export interface EvaluationInput {
  questionText: string;
  questionType: 'multiple_choice' | 'short_answer' | 'long_answer';
  studentAnswer: unknown;
  correctAnswer: unknown;
  maxMarks: number;
}

export interface EvaluationResult {
  isCorrect: boolean;
  marksAwarded: number;
  feedback: string;
  evidenceScore: number; // 0.0 to 1.0 normalized score
}

export interface ActionWidget {
  type: 'pill' | 'input';
  label: string;
  value: string;
}

export interface QuizGapDiagnosisInput {
  topicTitle: string;
  totalScore: number;
  maxScore: number;
  missedQuestions: Array<{
    questionText: string;
    studentAnswer: unknown;
    correctAnswer: unknown;
    feedback: string;
  }>;
  courseNotesContext?: string;
}

export interface RemediationMission {
  title: string;
  diagnosedGap: string;
  actionPlan: string;
  openingPrompt: string;
  actionWidgets: ActionWidget[];
  teacherAdvice: string;
}

const EVALUATION_SYSTEM_INSTRUCTION = `
You are the ThinkFirst Evaluator Agent.
You evaluate student answers for conceptual understanding, identifying whether the student genuinely grasped the underlying concept or exhibited a specific learning gap.
Rules:
1. Grade fairly based on conceptual correctness.
2. Return marksAwarded between 0 and maxMarks.
3. Provide constructive, encouraging Socratic feedback explaining what was correct and clarifying any misconceptions.
4. Calculate evidenceScore normalized between 0.0 and 1.0 (marksAwarded / maxMarks).
5. Output ONLY valid JSON.
`;

const DIAGNOSIS_SYSTEM_INSTRUCTION = `
You are the ThinkFirst Pedagogical Diagnostic Agent.
Your job is to analyze a student's quiz errors, identify the single most critical underlying concept they lack knowledge of, and formulate an interactive remediation mission with clickable action pills (Method 2).

Rules:
1. title: "Knowledge Gap: <Concise Concept Name>"
2. diagnosedGap: Clear, 1-2 sentence description of the cognitive misconception.
3. actionPlan: 1-sentence description of the micro-ladder remediation strategy.
4. openingPrompt: A friendly, supportive Socratic opening message (under 3 sentences) that anchors to the question they missed and asks an intuitive starting question.
5. actionWidgets: 2-3 clickable pills (type: "pill", label: user-friendly text, value: concise value) offering immediate, low-friction responses.
6. teacherAdvice: 1-2 sentences explaining to the teacher what concept the student lacked and how to reinforce it in lecture.
7. Output ONLY valid JSON matching the RemediationMission structure.
`;

export async function evaluateStudentAnswer(input: EvaluationInput): Promise<EvaluationResult> {
  const studentAnsStr = typeof input.studentAnswer === 'string'
    ? input.studentAnswer.trim()
    : JSON.stringify(input.studentAnswer);

  const correctAnsStr = typeof input.correctAnswer === 'string'
    ? input.correctAnswer.trim()
    : JSON.stringify(input.correctAnswer);

  // Quick exact match evaluation for multiple choice
  if (input.questionType === 'multiple_choice') {
    const isCorrect = studentAnsStr.toLowerCase() === correctAnsStr.toLowerCase();
    const marksAwarded = isCorrect ? input.maxMarks : 0;
    return {
      isCorrect,
      marksAwarded,
      evidenceScore: isCorrect ? 1.0 : 0.0,
      feedback: isCorrect
        ? 'Correct answer! Excellent understanding.'
        : `Incorrect. The correct answer was: ${correctAnsStr}`,
    };
  }

  // Free-form / short / long answer semantic evaluation via Gemini
  const prompt = `
Question: "${input.questionText}"
Question Type: ${input.questionType}
Max Marks: ${input.maxMarks}

Expected Answer / Rubric:
${correctAnsStr}

Student's Submitted Answer:
"${studentAnsStr}"

Evaluate the student's answer and return the JSON evaluation:
{
  "isCorrect": true,
  "marksAwarded": 1.0,
  "feedback": "Constructive feedback...",
  "evidenceScore": 1.0
}
`;

  return generateJSON<EvaluationResult>({
    prompt,
    systemInstruction: EVALUATION_SYSTEM_INSTRUCTION,
    fallbackDefault: {
      isCorrect: false,
      marksAwarded: 0,
      evidenceScore: 0.0,
      feedback: 'Answer was recorded.',
    },
  });
}

/**
 * Autonomously diagnose student knowledge gaps from missed quiz questions
 * and formulate a personalized interactive remediation mission with action widgets
 */
export async function diagnoseQuizGaps(input: QuizGapDiagnosisInput): Promise<RemediationMission> {
  if (input.missedQuestions.length === 0) {
    return {
      title: 'Topic Mastery Confirmed',
      diagnosedGap: 'No significant conceptual gaps detected.',
      actionPlan: 'Advance to next curriculum topic or explore challenge problems.',
      openingPrompt: `Great work on ${input.topicTitle}! You scored 100%. Are you ready for an advanced extension problem?`,
      actionWidgets: [
        { type: 'pill', label: 'Try advanced challenge', value: 'challenge' },
        { type: 'pill', label: 'Review next module', value: 'next_module' },
      ],
      teacherAdvice: 'Student demonstrated complete mastery of this topic.',
    };
  }

  const missedSummary = input.missedQuestions
    .map(
      (m, idx) =>
        `Question ${idx + 1}: "${m.questionText}"\nStudent Answer: "${m.studentAnswer}"\nExpected: "${m.correctAnswer}"\nFeedback: "${m.feedback}"`
    )
    .join('\n\n');

  const prompt = `
Topic: "${input.topicTitle}"
Total Score: ${input.totalScore} / ${input.maxScore}

Missed Questions & Responses:
${missedSummary}

${input.courseNotesContext ? `[Relevant Course Notes]:\n${input.courseNotesContext}\n` : ''}

Diagnose the root conceptual knowledge gap and generate the interactive remediation mission with action widgets:
{
  "title": "Knowledge Gap: <Concept>",
  "diagnosedGap": "...",
  "actionPlan": "...",
  "openingPrompt": "...",
  "actionWidgets": [
    { "type": "pill", "label": "Option 1", "value": "opt_1" },
    { "type": "pill", "label": "Option 2", "value": "opt_2" }
  ],
  "teacherAdvice": "..."
}
`;

  const fallbackTitle = `Knowledge Gap: ${input.topicTitle}`;
  return generateJSON<RemediationMission>({
    prompt,
    systemInstruction: DIAGNOSIS_SYSTEM_INSTRUCTION,
    fallbackDefault: {
      title: fallbackTitle,
      diagnosedGap: `Student experienced difficulty on foundational concepts in ${input.topicTitle}.`,
      actionPlan: 'Socratic guided walkthrough of key definitions and cancelled limits.',
      openingPrompt: `I noticed you ran into some trouble on ${input.topicTitle}. Let's break down where you got stuck together. Ready?`,
      actionWidgets: [
        { type: 'pill', label: 'Let\'s start with basics', value: 'basics' },
        { type: 'pill', label: 'Review question step-by-step', value: 'step_by_step' },
      ],
      teacherAdvice: `Review foundational examples for ${input.topicTitle} in lecture.`,
    },
  });
}
