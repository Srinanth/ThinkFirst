import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.util.js';

export const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

export interface GenerateTextOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  model?: string;
}

export interface GenerateJSONOptions<T> {
  prompt: string;
  systemInstruction?: string;
  fallbackDefault?: T;
  model?: string;
}

/**
 * Generate standard text completion from Gemini
 */
export async function generateText(options: GenerateTextOptions): Promise<string> {
  try {
    const model = options.model || env.GEMINI_MODEL;
    const response = await ai.models.generateContent({
      model,
      contents: options.prompt,
      config: {
        systemInstruction: options.systemInstruction,
        temperature: options.temperature ?? 0.2,
      },
    });

    return response.text || '';
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new AppError(`Gemini generateText error: ${message}`, 502, 'GEMINI_API_ERROR');
  }
}

/**
 * Generate validated JSON from Gemini with automatic markdown code-fence stripping
 */
export async function generateJSON<T>(options: GenerateJSONOptions<T>): Promise<T> {
  try {
    const rawText = await generateText({
      prompt: `${options.prompt}\n\nIMPORTANT: Return ONLY a valid, parsable JSON document without any explanation, markdown backticks, or commentary.`,
      systemInstruction: options.systemInstruction,
      temperature: 0.1,
      model: options.model,
    });

    // Strip markdown code fences if present
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(cleaned) as T;
  } catch (error: unknown) {
    if (options.fallbackDefault !== undefined) {
      return options.fallbackDefault;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new AppError(`Failed to parse structured JSON from Gemini: ${message}`, 502, 'GEMINI_JSON_PARSE_ERROR');
  }
}

/**
 * Generate 768-dimensional vector embedding for text using text-embedding-004
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ai.models.embedContent({
      model: env.GEMINI_EMBEDDING_MODEL,
      contents: text,
    });

    const values = response.embeddings?.[0]?.values;
    if (!values || values.length === 0) {
      throw new Error('Received empty embedding values from Gemini');
    }

    return values;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new AppError(`Gemini generateEmbedding error: ${message}`, 502, 'GEMINI_EMBEDDING_ERROR');
  }
}

/**
 * Generate embeddings for an array of text chunks
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    results.push(embedding);
  }
  return results;
}
