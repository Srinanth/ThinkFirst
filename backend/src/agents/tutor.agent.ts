import { generateText, ai } from './gemini.client.js';
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

/**
 * Generate complete response for Socratic tutor turn
 */
export async function generateSocraticResponse(input: TutorDialogueInput): Promise<string> {
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

  return generateText({
    prompt,
    systemInstruction: SOCRATIC_SYSTEM_PROMPT,
    temperature: 0.4,
  });
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

  const streamResponse = await ai.models.generateContentStream({
    model: env.GEMINI_MODEL,
    contents: prompt,
    config: {
      systemInstruction: SOCRATIC_SYSTEM_PROMPT,
      temperature: 0.4,
    },
  });

  for await (const chunk of streamResponse) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
