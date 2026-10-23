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
 * Executes a classroom/subject-scoped pgvector similarity search
 * calling the PostgreSQL stored procedure `match_note_embeddings`.
 */
export const searchSubjectNoteEmbeddings = async ({
  teacherSubjectId,
  queryEmbedding,
  matchThreshold = 0.65,
  matchCount = 5,
}: VectorSearchParams): Promise<VectorSearchResult[]> => {
  const { data, error } = await supabaseAdmin.rpc('match_note_embeddings', {
    p_teacher_subject_id: teacherSubjectId,
    p_query_embedding: queryEmbedding,
    p_match_threshold: matchThreshold,
    p_match_count: matchCount,
  });

  if (error) {
    throw new Error(`Vector similarity query failed: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    learningMaterialId: row.learning_material_id,
    chunkIndex: row.chunk_index,
    content: row.content,
    similarity: row.similarity,
  }));
};
