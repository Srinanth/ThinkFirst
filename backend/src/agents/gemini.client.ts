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
 * Generate standard text completion from Gemini with transient error retries and model fallbacks
 */
export async function generateText(options: GenerateTextOptions): Promise<string> {
  const modelsToTry = [
    options.model || env.GEMINI_MODEL,
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
  ];
  let lastError: unknown = null;

  for (const currentModel of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: options.prompt,
          config: {
            systemInstruction: options.systemInstruction,
            temperature: options.temperature ?? 0.2,
          },
        });

        return response.text || '';
      } catch (error: unknown) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        const isTransient =
          message.includes('503') ||
          message.includes('429') ||
          message.includes('UNAVAILABLE') ||
          message.includes('high demand') ||
          message.includes('ResourceExhausted') ||
          message.includes('Quota exceeded');

        if (attempt < 2 && isTransient) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        break;
      }
    }
  }

  const message = lastError instanceof Error ? lastError.message : String(lastError);
  throw new AppError(`Gemini generateText error: ${message}`, 502, 'GEMINI_API_ERROR');
}

/**
 * Generate validated JSON from Gemini with automatic markdown code-fence stripping and block extraction
 */
export async function generateJSON<T>(options: GenerateJSONOptions<T>): Promise<T> {
  try {
    const rawText = await generateText({
      prompt: `${options.prompt}\n\nIMPORTANT: Return ONLY a valid, parsable JSON document without any explanation, markdown backticks, or commentary.`,
      systemInstruction: options.systemInstruction,
      temperature: 0.1,
      model: options.model,
    });

    if (!rawText || rawText.trim().length === 0) {
      if (options.fallbackDefault !== undefined) {
        return options.fallbackDefault;
      }
      throw new Error('Received empty response from Gemini model');
    }

    // Strip markdown code fences (```json ... ``` or ``` ...)
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }

    // Extract first valid JSON object/array block if any surrounding text remains
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let startIdx = -1;

    if (firstBrace !== -1 && firstBracket !== -1) {
      startIdx = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
      startIdx = firstBrace;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
    }

    if (startIdx !== -1) {
      const isArray = cleaned[startIdx] === '[';
      const lastIdx = isArray ? cleaned.lastIndexOf(']') : cleaned.lastIndexOf('}');
      if (lastIdx > startIdx) {
        cleaned = cleaned.substring(startIdx, lastIdx + 1);
      }
    }

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
 * Generate 768-dimensional vector embedding for text using gemini-embedding-001
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await ai.models.embedContent({
      model: env.GEMINI_EMBEDDING_MODEL,
      contents: text,
      config: {
        outputDimensionality: 768,
      },
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
