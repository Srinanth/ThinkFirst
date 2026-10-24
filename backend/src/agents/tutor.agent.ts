import { generateText, generateJSON, ai } from './gemini.client.js';
import { env } from '../config/env.js';

export type PedagogicalMode =
  | 'foundational_assistance'
  | 'conceptual_reinforcement'
  | 'advanced_challenge'
  | 'socratic_mastery';

export interface DifficultyBreakdown {
  easyMissed: number;
  mediumMissed: number;
  hardMissed: number;
  totalQuestions?: number;
}

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
  pedagogicalMode?: PedagogicalMode;
  difficultyBreakdown?: DifficultyBreakdown;
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
3. Ask guiding questions, provide targeted hints, or propose illustrative analogies based on the student's demonstrated mastery level and quiz difficulty diagnosis.

QUESTION DIFFICULTY & ADAPTIVE PERSONA LAWS:
The tutor dynamically alters its pedagogical behavior based on the student's question difficulty history:
- FOUNDATIONAL ASSISTANCE (Student failed EASY / fundamental questions):
  * URGENCY: HIGH. The student has foundational misconceptions or lacks basic definitions.
  * DO NOT assume any prerequisite familiarity. Break the concept down into small, intuitive building blocks.
  * Ask gentle, straightforward guiding questions that help the student discover the basics themselves.
  * Use vivid, everyday, real-world analogies (e.g., physical filing cabinets, restaurant kitchens, road traffic).
  * Be patient, supportive, and scaffold every micro-step before moving forward.
- CONCEPTUAL REINFORCEMENT (Student failed MEDIUM / multi-step questions, but passed easy ones):
  * URGENCY: MEDIUM. The student knows definitions but struggles to combine them in multi-step problem solving.
  * Guide them along the reasoning chain step-by-step. Ask: "What is the very next logical step once we know X?"
  * Offer hints that clarify intermediate steps without giving away answers.
- ADVANCED CHALLENGE (Student failed only HARD / stretch questions, passing easy and medium):
  * URGENCY: STRETCH GOAL. Missing hard questions is normal and expected.
  * Commend their solid grasp of the basics.
  * Focus strictly on subtle edge cases, mathematical limits, corner cases, or performance trade-offs.
  * Help them dissect what makes this specific scenario tricky or counter-intuitive.
- SOCRATIC MASTERY (Student maintains HIGH MASTERY > 0.75 across all tiers):
  * URGENCY: ENRICHMENT.
  * Engage in peer-level Socratic debate.
  * Challenge their assumptions, discuss real-world architectural trade-offs, and ask them to evaluate or critique suboptimal designs.

4. Ground your responses in the teacher's course notes provided in the context.
5. Keep responses focused, encouraging, and concise (under 2-3 short paragraphs). End with a single, clear guiding question for the student to reflect on.
`;

const INTERACTIVE_TUTOR_SYSTEM_PROMPT = `
You are the ThinkFirst Grounded Socratic AI Tutor delivering Method 2 (Interactive Chat with Action Widgets).
Your goal is to guide the student through their specific diagnosed knowledge gap without overwhelming them.

RULES:
1. NEVER give the direct final numerical answer or direct code solution.
2. ADAPTIVE PERSONA BASED ON QUESTION DIFFICULTY:
   - If mode is FOUNDATIONAL ASSISTANCE (failed easy questions): Provide high-touch personal assistance. Break the problem into its simplest intuitive building block. Use an everyday analogy. Do not ask complex questions; ask one simple guiding question.
   - If mode is CONCEPTUAL REINFORCEMENT (failed medium questions): Guide them through multi-step logic and application.
   - If mode is ADVANCED CHALLENGE (failed hard questions): Probe boundary conditions, edge cases, and non-trivial edge scenarios.
   - If mode is SOCRATIC MASTERY (high mastery): Challenge them with system design trade-offs and alternative architectures.
3. Respond with an encouraging, concise Socratic guidance message (under 2 short paragraphs).
4. Provide 2-3 clickable actionWidgets (type: "pill", label: user-friendly label, value: concise value) offering immediate, low-friction response options matching the pedagogical mode.
5. understandingScore: Assign 0.0 to 1.0 reflecting how accurately the student's latest message demonstrated conceptual understanding. (e.g. 0.8+ for correct application/insight, 0.5 for partial intuition, 0.1 for persistent misconception).
6. isGapResolved: Set to true ONLY if the student has successfully demonstrated clear understanding of the diagnosed gap.
7. teacherNote: Write a concise 1-sentence note for the teacher's briefing summarizing the student's current cognitive state.
8. Return ONLY valid JSON matching InteractiveTutorTurnOutput.
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

  if (input.pedagogicalMode) {
    prompt += `[ADAPTIVE PEDAGOGICAL MODE]: ${input.pedagogicalMode.toUpperCase()}\n`;
    if (input.difficultyBreakdown) {
      prompt += `[QUESTION DIFFICULTY HISTORY]: Missed Easy: ${input.difficultyBreakdown.easyMissed}, Missed Medium: ${input.difficultyBreakdown.mediumMissed}, Missed Hard: ${input.difficultyBreakdown.hardMissed}\n`;
    }
    prompt += `Tailor your scaffolding, tone, and action pills strictly to this mode.\n\n`;
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

  if (input.pedagogicalMode) {
    prompt += `[ADAPTIVE PEDAGOGICAL MODE]: ${input.pedagogicalMode.toUpperCase()}\n`;
    if (input.difficultyBreakdown) {
      prompt += `[QUESTION DIFFICULTY HISTORY]: Missed Easy: ${input.difficultyBreakdown.easyMissed}, Missed Medium: ${input.difficultyBreakdown.mediumMissed}, Missed Hard: ${input.difficultyBreakdown.hardMissed}\n`;
    }
    prompt += `Tailor your scaffolding, tone, and guidance strictly to this mode.\n\n`;
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
