export interface TextChunk {
  chunkIndex: number;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ChunkOptions {
  chunkSize?: number; // Approximate character length (default 1500 chars ~ 350-400 tokens)
  overlap?: number;   // Approximate character overlap (default 200 chars ~ 50 tokens)
}

/**
 * Splits plain text or markdown into overlapping semantic chunks
 */
export function chunkText(text: string, options: ChunkOptions = {}): TextChunk[] {
  const chunkSize = options.chunkSize || 1500;
  const overlap = options.overlap || 200;

  if (!text || text.trim().length === 0) {
    return [];
  }

  const cleaned = text.replace(/\r\n/g, '\n').trim();
  const chunks: TextChunk[] = [];

  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < cleaned.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex < cleaned.length) {
      // Find clean paragraph or sentence break
      const paragraphBreak = cleaned.lastIndexOf('\n\n', endIndex);
      const sentenceBreak = cleaned.lastIndexOf('. ', endIndex);
      const newlineBreak = cleaned.lastIndexOf('\n', endIndex);

      if (paragraphBreak > startIndex + chunkSize / 2) {
        endIndex = paragraphBreak + 2;
      } else if (sentenceBreak > startIndex + chunkSize / 2) {
        endIndex = sentenceBreak + 2;
      } else if (newlineBreak > startIndex + chunkSize / 2) {
        endIndex = newlineBreak + 1;
      }
    } else {
      endIndex = cleaned.length;
    }

    const chunkContent = cleaned.slice(startIndex, endIndex).trim();
    if (chunkContent.length > 0) {
      chunks.push({
        chunkIndex,
        content: chunkContent,
      });
      chunkIndex++;
    }

    if (endIndex >= cleaned.length) {
      break;
    }

    startIndex = Math.max(startIndex + 1, endIndex - overlap);
  }

  return chunks;
}
