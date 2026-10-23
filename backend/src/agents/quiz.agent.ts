import { generateJSON } from './gemini.client.js';

export interface GeneratedQuestion {
  questionText: string;
  questionType: 'multiple_choice' | 'short_answer' | 'long_answer';
  options?: string[];
  correctAnswer: string | Record<string, unknown>;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
}

export interface QuizGenerationParams {
  topicTitle: string;
  contextNotes?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
}

const SYSTEM_INSTRUCTION = `
You are the ThinkFirst Diagnostic Quiz Agent.
Generate pedagogically rigorous diagnostic questions that assess genuine conceptual understanding, NOT rote memorization.
Guidelines:
1. For multiple-choice questions, provide 4 plausible options, where distractors reflect common student misconceptions.
2. For short_answer / long_answer questions, provide clear conceptual questions with expected keywords in the rubric.
3. Include an insightful explanation for why the correct answer is right and why distractors are wrong.
4. Return ONLY valid JSON matching the requested structure.
`;

export async function generateQuizQuestionsWithAgent(
  params: QuizGenerationParams
): Promise<GeneratedQuestion[]> {
  const prompt = `
Generate ${params.questionCount} diagnostic questions for the following curriculum topic:
Topic: "${params.topicTitle}"
Difficulty: ${params.difficulty}

${params.contextNotes ? `Context Notes from course materials:\n${params.contextNotes}` : ''}

Expected JSON response format:
{
  "questions": [
    {
      "questionText": "What is ...?",
      "questionType": "multiple_choice",
      "options": ["Choice A", "Choice B", "Choice C", "Choice D"],
      "correctAnswer": "Choice A",
      "explanation": "Choice A is correct because...",
      "difficulty": "${params.difficulty}",
      "marks": 1
    }
  ]
}
`;

  const result = await generateJSON<{ questions: GeneratedQuestion[] }>({
    prompt,
    systemInstruction: SYSTEM_INSTRUCTION,
    fallbackDefault: { questions: [] },
  });

  return result.questions || [];
}
