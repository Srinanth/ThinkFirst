import { supabaseAdmin } from '../config/supabase.js';

export interface VectorSearchParams {
  teacherSubjectId: string;
  queryEmbedding: number[];
  matchThreshold?: number;
  matchCount?: number;
}

export interface VectorSearchResult {
  id: string;
  learningMaterialId: string;
  chunkIndex: number;
  content: string;
  similarity: number;
}

/**
 * Computes cosine similarity between two numeric vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Executes a classroom/subject-scoped pgvector similarity search.
 * Attempts native Supabase stored procedure `match_note_embeddings` first,
 * and falls back gracefully to direct query + cosine calculation if RPC is missing.
 */
export const searchSubjectNoteEmbeddings = async ({
  teacherSubjectId,
  queryEmbedding,
  matchThreshold = 0.5,
  matchCount = 5,
}: VectorSearchParams): Promise<VectorSearchResult[]> => {
  // 1. Attempt database RPC function first
  try {
    const { data, error } = await supabaseAdmin.rpc('match_note_embeddings', {
      p_teacher_subject_id: teacherSubjectId,
      p_query_embedding: queryEmbedding,
      p_match_threshold: matchThreshold,
      p_match_count: matchCount,
    });

    if (!error && Array.isArray(data)) {
      return data.map((row: any) => ({
        id: row.id,
        learningMaterialId: row.learning_material_id,
        chunkIndex: row.chunk_index ?? 0,
        content: row.content,
        similarity: row.similarity,
      }));
    }
  } catch {
    // RPC not present in database, proceed to graceful fallback
  }

  // 2. Fallback: Query note_embeddings joined with learning_materials for this subject
  const { data: materials, error: matError } = await supabaseAdmin
    .from('learning_materials')
    .select('id')
    .eq('teacher_subject_id', teacherSubjectId);

  if (matError || !materials || materials.length === 0) {
    return [];
  }

  const materialIds = materials.map((m) => m.id);

  const { data: chunks, error: chunkError } = await supabaseAdmin
    .from('note_embeddings')
    .select('id, learning_material_id, chunk_index, content, embedding')
    .in('learning_material_id', materialIds);

  if (chunkError || !chunks || chunks.length === 0) {
    return [];
  }

  // Calculate cosine similarity for each chunk
  const scored = chunks
    .map((chunk) => {
      let emb: number[] = [];
      if (typeof chunk.embedding === 'string') {
        try {
          emb = JSON.parse(chunk.embedding);
        } catch {
          emb = [];
        }
      } else if (Array.isArray(chunk.embedding)) {
        emb = chunk.embedding;
      }

      const similarity = cosineSimilarity(queryEmbedding, emb);
      return {
        id: chunk.id,
        learningMaterialId: chunk.learning_material_id,
        chunkIndex: chunk.chunk_index,
        content: chunk.content,
        similarity,
      };
    })
    .filter((item) => item.similarity >= matchThreshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, matchCount);

  return scored;
};
