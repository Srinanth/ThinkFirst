import { ai } from '../agents/gemini.client.js';
import { env } from '../config/env.js';
import { BadRequestError } from './errors.util.js';

export interface DocumentExtractInput {
  buffer?: Buffer;
  mimeType?: string;
  filename?: string;
  rawText?: string;
}

/**
 * Extract clean, structured text from documents, PDFs, images, or plaintext
 * using direct decoding for text files and multimodal Gemini OCR for PDFs/images.
 */
export async function extractDocumentText(input: DocumentExtractInput): Promise<string> {
  // 1. Direct text content passed
  if (input.rawText && input.rawText.trim().length > 0) {
    return input.rawText.trim();
  }

  if (!input.buffer || input.buffer.length === 0) {
    throw new BadRequestError('No document buffer or text content provided for extraction');
  }

  const mimeType = (input.mimeType || '').toLowerCase();
  const filename = (input.filename || '').toLowerCase();

  // 2. Plaintext or Markdown files: decode directly
  if (
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    filename.endsWith('.txt') ||
    filename.endsWith('.md') ||
    filename.endsWith('.markdown')
  ) {
    const decoded = input.buffer.toString('utf-8');
    if (!decoded.trim()) {
      throw new BadRequestError('Uploaded text file is empty');
    }
    return decoded.trim();
  }

  // 3. Multimodal OCR for PDFs and Image Scans (Handwritten / Slides / Textbook captures)
  const isPdf = mimeType === 'application/pdf' || filename.endsWith('.pdf');
  const isImage =
    mimeType.startsWith('image/') ||
    filename.endsWith('.png') ||
    filename.endsWith('.jpg') ||
    filename.endsWith('.jpeg') ||
    filename.endsWith('.webp');

  if (isPdf || isImage) {
    const targetMimeType = isPdf ? 'application/pdf' : mimeType || 'image/jpeg';
    const base64Data = input.buffer.toString('base64');

    const prompt = `You are a high-accuracy Document & Lecture Notes OCR Transcription Engine.
Extract and transcribe ALL instructional text, handwritten annotations, mathematical equations (formatted in clean LaTeX / KaTeX format where applicable), definitions, examples, and structured lecture concepts from this document.
Maintain clean markdown format with appropriate headings and bullet points.
Output ONLY the extracted transcription. Do not include any commentary, explanations, or introductory remarks.`;

    try {
      const response = await ai.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: targetMimeType,
                  data: base64Data,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
      });

      const extracted = response.text || '';
      if (!extracted.trim()) {
        throw new Error('OCR returned empty content from document');
      }

      return extracted.trim();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new BadRequestError(`OCR extraction failed for ${filename || 'document'}: ${message}`);
    }
  }

  // Fallback for unknown binary formats: attempt UTF-8 string extraction
  const fallbackText = input.buffer.toString('utf-8');
  if (fallbackText && fallbackText.length > 20) {
    return fallbackText.trim();
  }

  throw new BadRequestError(
    `Unsupported file type for OCR extraction: ${mimeType || filename}. Supported: PDF, PNG, JPG, WEBP, TXT, MD.`
  );
}
