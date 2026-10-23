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

const SYSTEM_INSTRUCTION = `
You are the ThinkFirst Evaluator Agent.
You evaluate student answers for conceptual understanding, identifying whether the student genuinely grasped the underlying concept or exhibited a specific learning gap.
Rules:
1. Grade fairly based on conceptual correctness.
2. Return marksAwarded between 0 and maxMarks.
3. Provide constructive, encouraging Socratic feedback explaining what was correct and clarifying any misconceptions.
4. Calculate evidenceScore normalized between 0.0 and 1.0 (marksAwarded / maxMarks).
5. Output ONLY valid JSON.
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
    systemInstruction: SYSTEM_INSTRUCTION,
    fallbackDefault: {
      isCorrect: false,
      marksAwarded: 0,
      evidenceScore: 0.0,
      feedback: 'Answer was recorded.',
    },
  });
}
