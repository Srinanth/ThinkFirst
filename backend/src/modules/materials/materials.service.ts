import { supabaseAdmin } from '../../config/supabase.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.util.js';
import { chunkText } from '../../utils/chunker.util.js';
import { generateEmbedding } from '../../agents/gemini.client.js';
import { searchSubjectNoteEmbeddings } from '../../utils/vector.util.js';
import { CreateMaterialInput, SearchMaterialsInput } from './materials.schemas.js';

export class MaterialsService {
  /**
   * Register a new learning material record
   */
  async createMaterial(subjectId: string, input: CreateMaterialInput) {
    const { data, error } = await supabaseAdmin
      .from('learning_materials')
      .insert({
        teacher_subject_id: subjectId,
        curriculum_topic_id: input.curriculumTopicId || null,
        title: input.title,
        file_path: input.filePath,
        file_type: input.fileType,
        material_type: input.materialType || null,
        processing_status: 'pending',
      })
      .select('id, teacher_subject_id, curriculum_topic_id, title, file_path, file_type, processing_status, created_at')
      .single();

    if (error) throw new BadRequestError(`Failed to create learning material: ${error.message}`);
    return data;
  }

  /**
   * List all materials for a subject class
   */
  async listMaterials(subjectId: string) {
    const { data, error } = await supabaseAdmin
      .from('learning_materials')
      .select(`
        id,
        curriculum_topic_id,
        title,
        file_path,
        file_type,
        material_type,
        processing_status,
        created_at,
        curriculum_topics:curriculum_topic_id (id, title)
      `)
      .eq('teacher_subject_id', subjectId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestError(error.message);
    return data;
  }

  /**
   * Get single material details with chunk count
   */
  async getMaterial(materialId: string) {
    const { data, error } = await supabaseAdmin
      .from('learning_materials')
      .select(`
        id,
        teacher_subject_id,
        curriculum_topic_id,
        title,
        file_path,
        file_type,
        material_type,
        processing_status,
        created_at,
        note_embeddings (count)
      `)
      .eq('id', materialId)
      .single();

    if (error || !data) {
      throw new NotFoundError('Learning material not found');
    }

    return {
      ...data,
      chunkCount: data.note_embeddings?.[0]?.count ?? 0,
    };
  }

  /**
   * Delete a learning material and associated vector embeddings
   */
  async deleteMaterial(materialId: string) {
    const { error } = await supabaseAdmin
      .from('learning_materials')
      .delete()
      .eq('id', materialId);

    if (error) throw new BadRequestError(`Failed to delete material: ${error.message}`);
    return { id: materialId, deleted: true };
  }

  /**
   * Ingest text: chunk, embed using Gemini text-embedding-004, and store in note_embeddings
   */
  async ingestMaterialText(materialId: string, rawText: string) {
    // 1. Mark as processing
    await supabaseAdmin
      .from('learning_materials')
      .update({ processing_status: 'processing' })
      .eq('id', materialId);

    try {
      // 2. Chunk text semantically
      const chunks = chunkText(rawText, { chunkSize: 1500, overlap: 200 });

      if (chunks.length === 0) {
        throw new Error('No content could be extracted from provided text');
      }

      // 3. Clear existing embeddings for this material
      await supabaseAdmin
        .from('note_embeddings')
        .delete()
        .eq('learning_material_id', materialId);

      // 4. Generate embeddings and insert in batches
      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk.content);

        const { error: insertError } = await supabaseAdmin
          .from('note_embeddings')
          .insert({
            learning_material_id: materialId,
            chunk_index: chunk.chunkIndex,
            content: chunk.content,
            embedding,
            metadata: {
              charLength: chunk.content.length,
            },
          });

        if (insertError) {
          throw new Error(`Failed to insert embedding chunk ${chunk.chunkIndex}: ${insertError.message}`);
        }
      }

      // 5. Update processing_status to ready
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('learning_materials')
        .update({ processing_status: 'ready' })
        .eq('id', materialId)
        .select('id, title, processing_status')
        .single();

      if (updateError) throw updateError;

      return {
        materialId,
        status: 'ready',
        totalChunks: chunks.length,
        material: updated,
      };
    } catch (err: unknown) {
      // Mark as failed
      await supabaseAdmin
        .from('learning_materials')
        .update({ processing_status: 'failed' })
        .eq('id', materialId);

      const message = err instanceof Error ? err.message : String(err);
      throw new BadRequestError(`Ingestion pipeline failed: ${message}`);
    }
  }

  /**
   * Vector similarity search across all notes for a subject
   */
  async similaritySearch(subjectId: string, input: SearchMaterialsInput) {
    const queryEmbedding = await generateEmbedding(input.query);

    const matches = await searchSubjectNoteEmbeddings({
      teacherSubjectId: subjectId,
      queryEmbedding,
      matchThreshold: input.matchThreshold ?? 0.5,
      matchCount: input.matchCount ?? 5,
    });

    return {
      query: input.query,
      resultsCount: matches.length,
      matches,
    };
  }
}

export const materialsService = new MaterialsService();
