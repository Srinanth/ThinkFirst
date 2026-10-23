import { generateText, generateJSON, ai } from './gemini.client.js';
import { env } from '../config/env.js';

export interface TutorMessageHistory {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TutorDialogueInput {
  studentMessage: string;
  history: TutorMessageHistory[];
  contextNotes?: string;
  topicTitle?: string;
  studentMasteryLevel?: number; // 0.0 to 1.0
}

export interface ActionWidget {
  type: 'pill' | 'input';
  label: string;
  value: string;
}

export interface InteractiveTutorTurnInput extends TutorDialogueInput {
  activeGapDescription?: string;
}

export interface InteractiveTutorTurnOutput {
  message: string;
  actionWidgets: ActionWidget[];
  understandingScore: number; // 0.0 to 1.0
  isGapResolved: boolean;
  teacherNote: string;
}

const SOCRATIC_SYSTEM_PROMPT = `
You are the ThinkFirst Grounded Socratic AI Tutor.
Your mission is to foster deep critical thinking, conceptual clarity, and genuine subject mastery.

CORE SOCRATIC LAWS:
1. NEVER directly hand the student a final numerical answer, direct code solution, or completed homework answer.
2. If a student demands the direct answer (e.g. "Just tell me the answer", "Solve question 4 for me"), politely refuse:
   "I'm here to help you truly understand the concepts, not hand over the final answer. Let's break it down together."
3. Ask guiding questions, provide targeted hints, or propose illustrative analogies based on the student's demonstrated mastery level.
4. Adapt to the student's mastery level:
   - Low mastery (< 0.4): Break into very small, foundational steps. Use intuitive everyday analogies.
   - Medium mastery (0.4 - 0.75): Encourage self-discovery. Ask: "What happens if we apply... here?"
   - High mastery (> 0.75): Challenge with edge cases, proofs, and optimizations.
5. Ground your responses in the teacher's course notes provided in the context.
6. Keep responses focused, encouraging, and concise (under 3-4 paragraphs). End with a single, clear guiding question for the student to reflect on.
`;

const INTERACTIVE_TUTOR_SYSTEM_PROMPT = `
You are the ThinkFirst Grounded Socratic AI Tutor delivering Method 2 (Interactive Chat with Action Widgets).
Your goal is to guide the student through their specific diagnosed knowledge gap without overwhelming them.

RULES:
1. NEVER give the direct final numerical answer.
2. Respond with an encouraging, concise Socratic guidance message (under 2 short paragraphs).
3. Provide 2-3 clickable actionWidgets (type: "pill", label: user-friendly label, value: concise value) offering immediate, low-friction response options so the student does not have to type long formulas.
4. understandingScore: Assign 0.0 to 1.0 reflecting how accurately the student's latest message demonstrated conceptual understanding. (e.g. 0.8+ for correct application/insight, 0.5 for partial intuition, 0.1 for persistent misconception).
5. isGapResolved: Set to true ONLY if the student has successfully demonstrated clear understanding of the diagnosed gap.
6. teacherNote: Write a concise 1-sentence note for the teacher's briefing summarizing the student's current cognitive state.
7. Return ONLY valid JSON matching InteractiveTutorTurnOutput.
`;

/**
 * Generate Method 2 Interactive Socratic Turn with Action Widgets & Real-time Insight updates
 */
export async function generateInteractiveSocraticTurn(
  input: InteractiveTutorTurnInput
): Promise<InteractiveTutorTurnOutput> {
  let prompt = '';

  if (input.activeGapDescription) {
    prompt += `[DIAGNOSED KNOWLEDGE GAP]:\n${input.activeGapDescription}\n\n`;
  }

  if (input.contextNotes) {
    prompt += `[RELEVANT COURSE NOTES]:\n${input.contextNotes}\n\n`;
  }

  if (input.topicTitle) {
    prompt += `[CURRENT TOPIC]: ${input.topicTitle}\n`;
  }

  if (input.studentMasteryLevel !== undefined) {
    prompt += `[CURRENT MASTERY]: ${(input.studentMasteryLevel * 100).toFixed(0)}%\n\n`;
  }

  prompt += `[RECENT CONVERSATION HISTORY]:\n`;
  for (const msg of input.history.slice(-6)) {
    prompt += `${msg.role.toUpperCase()}: ${msg.content}\n`;
  }

  prompt += `\nSTUDENT'S LATEST INPUT:\n"${input.studentMessage}"\n\nGenerate the interactive Socratic response with action widgets in JSON:`;

  const fallbackWidgets: ActionWidget[] = [
    { type: 'pill', label: 'Let\'s try another step', value: 'next_step' },
    { type: 'pill', label: 'I need a hint', value: 'hint' },
  ];

  const raw = await generateJSON<any>({
    prompt,
    systemInstruction: INTERACTIVE_TUTOR_SYSTEM_PROMPT,
    fallbackDefault: {
      message: 'Let\'s continue breaking down this concept together. What do you think the next logical step should be?',
      actionWidgets: fallbackWidgets,
      understandingScore: 0.5,
      isGapResolved: false,
      teacherNote: 'Student is actively participating in the guided remediation session.',
    },
  });

  let message =
    raw?.message ||
    raw?.content ||
    raw?.socraticMessage ||
    raw?.response ||
    raw?.guidance ||
    'Let\'s break down this concept together. What do you think our first step should be?';

  if (typeof message === 'object' && message !== null) {
    message = (message as any).text || (message as any).message || (message as any).content || JSON.stringify(message);
  }

  return {
    message: typeof message === 'string' ? message : String(message),
    actionWidgets:
      Array.isArray(raw?.actionWidgets) && raw.actionWidgets.length > 0 ? raw.actionWidgets : fallbackWidgets,
    understandingScore: typeof raw?.understandingScore === 'number' ? raw.understandingScore : 0.5,
    isGapResolved: Boolean(raw?.isGapResolved),
    teacherNote: raw?.teacherNote || 'Student is participating in the interactive session.',
  };
}

/**
 * Real-time SSE stream generator for Socratic tutor response
 */
export async function* streamSocraticResponse(input: TutorDialogueInput): AsyncGenerator<string, void, unknown> {
  let prompt = '';

  if (input.contextNotes) {
    prompt += `[RELEVANT COURSE NOTES]:\n${input.contextNotes}\n\n`;
  }

  if (input.topicTitle) {
    prompt += `[CURRENT TOPIC]: ${input.topicTitle}\n`;
  }

  if (input.studentMasteryLevel !== undefined) {
    prompt += `[STUDENT ESTIMATED MASTERY]: ${(input.studentMasteryLevel * 100).toFixed(0)}%\n\n`;
  }

  prompt += `[RECENT CONVERSATION HISTORY]:\n`;
  for (const msg of input.history.slice(-6)) {
    prompt += `${msg.role.toUpperCase()}: ${msg.content}\n`;
  }

  prompt += `\nSTUDENT'S LATEST MESSAGE:\n"${input.studentMessage}"\n\nProvide your Socratic response:`;

  const models = [env.GEMINI_MODEL, 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];
  let streamResponse: any = null;
  let lastError: unknown = null;

  for (const m of models) {
    try {
      streamResponse = await ai.models.generateContentStream({
        model: m,
        contents: prompt,
        config: {
          systemInstruction: SOCRATIC_SYSTEM_PROMPT,
          temperature: 0.4,
        },
      });
      break;
    } catch (err: unknown) {
      lastError = err;
    }
  }

  if (!streamResponse) {
    throw lastError;
  }

  for await (const chunk of streamResponse) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
