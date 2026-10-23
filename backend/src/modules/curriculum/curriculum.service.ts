import { supabaseAdmin } from '../../config/supabase.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.util.js';
import { parseSyllabusWithAgent, CurriculumNodeParsed } from '../../agents/curriculum.agent.js';
import { CreateTopicInput, UpdateTopicInput } from './curriculum.schemas.js';

export interface CurriculumTreeNode {
  id: string;
  teacherSubjectId: string;
  parentTopicId: string | null;
  title: string;
  description: string | null;
  nodeType: string;
  createdAt: string;
  children: CurriculumTreeNode[];
}

export class CurriculumService {
  /**
   * Create a single curriculum topic node manually
   */
  async createTopic(subjectId: string, input: CreateTopicInput) {
    const { data, error } = await supabaseAdmin
      .from('curriculum_topics')
      .insert({
        teacher_subject_id: subjectId,
        parent_topic_id: input.parentTopicId || null,
        title: input.title,
        description: input.description || null,
        node_type: input.nodeType || 'topic',
      })
      .select('id, teacher_subject_id, parent_topic_id, title, description, node_type, created_at')
      .single();

    if (error) throw new BadRequestError(`Failed to create curriculum topic: ${error.message}`);
    return data;
  }

  /**
   * Get complete hierarchical tree of topics for a subject offering
   */
  async getCurriculumTree(subjectId: string): Promise<CurriculumTreeNode[]> {
    const { data, error } = await supabaseAdmin
      .from('curriculum_topics')
      .select('id, teacher_subject_id, parent_topic_id, title, description, node_type, created_at')
      .eq('teacher_subject_id', subjectId)
      .order('created_at', { ascending: true });

    if (error) throw new BadRequestError(error.message);
    if (!data || data.length === 0) return [];

    // Build hierarchical tree
    const nodeMap = new Map<string, CurriculumTreeNode>();
    const roots: CurriculumTreeNode[] = [];

    data.forEach((row) => {
      nodeMap.set(row.id, {
        id: row.id,
        teacherSubjectId: row.teacher_subject_id,
        parentTopicId: row.parent_topic_id,
        title: row.title,
        description: row.description,
        nodeType: row.node_type,
        createdAt: row.created_at,
        children: [],
      });
    });

    data.forEach((row) => {
      const node = nodeMap.get(row.id)!;
      if (row.parent_topic_id && nodeMap.has(row.parent_topic_id)) {
        nodeMap.get(row.parent_topic_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  /**
   * Update a curriculum topic
   */
  async updateTopic(topicId: string, input: UpdateTopicInput) {
    const updatePayload: Record<string, unknown> = {};
    if (input.title !== undefined) updatePayload.title = input.title;
    if (input.description !== undefined) updatePayload.description = input.description;
    if (input.nodeType !== undefined) updatePayload.node_type = input.nodeType;

    const { data, error } = await supabaseAdmin
      .from('curriculum_topics')
      .update(updatePayload)
      .eq('id', topicId)
      .select('id, teacher_subject_id, parent_topic_id, title, description, node_type, created_at')
      .single();

    if (error) throw new BadRequestError(`Failed to update topic: ${error.message}`);
    return data;
  }

  /**
   * Delete a curriculum topic (cascades to child subtopics)
   */
  async deleteTopic(topicId: string) {
    const { error } = await supabaseAdmin
      .from('curriculum_topics')
      .delete()
      .eq('id', topicId);

    if (error) throw new BadRequestError(`Failed to delete topic: ${error.message}`);
    return { id: topicId, deleted: true };
  }

  /**
   * Ingest syllabus using the Curriculum Agent and recursively persist into curriculum_topics
   */
  async generateFromSyllabus(subjectId: string, syllabusText: string) {
    // 1. Invoke Curriculum Agent
    const parsed = await parseSyllabusWithAgent(syllabusText);

    if (!parsed.modules || parsed.modules.length === 0) {
      throw new BadRequestError('Curriculum Agent could not identify structured modules in the provided text.');
    }

    let createdCount = 0;

    // Recursive helper to insert nodes
    const persistNodes = async (nodes: CurriculumNodeParsed[], parentId: string | null = null) => {
      for (const node of nodes) {
        const { data: inserted, error } = await supabaseAdmin
          .from('curriculum_topics')
          .insert({
            teacher_subject_id: subjectId,
            parent_topic_id: parentId,
            title: node.title,
            description: node.description || null,
            node_type: node.nodeType,
          })
          .select('id')
          .single();

        if (error || !inserted) {
          throw new Error(`Failed to insert topic node "${node.title}": ${error?.message}`);
        }

        createdCount++;

        if (node.children && node.children.length > 0) {
          await persistNodes(node.children, inserted.id);
        }
      }
    };

    await persistNodes(parsed.modules, null);

    // Return the fresh tree
    const tree = await this.getCurriculumTree(subjectId);

    return {
      message: `Successfully parsed syllabus and generated ${createdCount} curriculum topics`,
      courseTitle: parsed.courseTitle,
      totalTopicsCreated: createdCount,
      tree,
    };
  }
}

export const curriculumService = new CurriculumService();
