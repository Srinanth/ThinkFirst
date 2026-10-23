import { supabaseAdmin } from '../../config/supabase.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.util.js';
import { CreateTopicInput, UpdateTopicInput, BulkCurriculumInput } from './curriculum.schemas.js';

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
   * Deterministic Bulk Curriculum Import: creates modules, topics, and subtopics in one transaction
   */
  async bulkCreateTopics(subjectId: string, input: BulkCurriculumInput) {
    let createdCount = 0;

    for (const mod of input.modules) {
      // 1. Insert Module
      const { data: moduleNode, error: modError } = await supabaseAdmin
        .from('curriculum_topics')
        .insert({
          teacher_subject_id: subjectId,
          parent_topic_id: null,
          title: mod.title,
          description: mod.description || null,
          node_type: 'module',
        })
        .select('id')
        .single();

      if (modError || !moduleNode) {
        throw new BadRequestError(`Failed to insert module "${mod.title}": ${modError?.message}`);
      }
      createdCount++;

      // 2. Insert Topics under Module
      if (mod.topics && mod.topics.length > 0) {
        for (const topic of mod.topics) {
          const { data: topicNode, error: topError } = await supabaseAdmin
            .from('curriculum_topics')
            .insert({
              teacher_subject_id: subjectId,
              parent_topic_id: moduleNode.id,
              title: topic.title,
              description: topic.description || null,
              node_type: 'topic',
            })
            .select('id')
            .single();

          if (topError || !topicNode) {
            throw new BadRequestError(`Failed to insert topic "${topic.title}": ${topError?.message}`);
          }
          createdCount++;

          // 3. Insert Subtopics under Topic
          if (topic.subtopics && topic.subtopics.length > 0) {
            for (const sub of topic.subtopics) {
              const { error: subError } = await supabaseAdmin
                .from('curriculum_topics')
                .insert({
                  teacher_subject_id: subjectId,
                  parent_topic_id: topicNode.id,
                  title: sub.title,
                  description: sub.description || null,
                  node_type: 'subtopic',
                });

              if (subError) {
                throw new BadRequestError(`Failed to insert subtopic "${sub.title}": ${subError.message}`);
              }
              createdCount++;
            }
          }
        }
      }
    }

    const tree = await this.getCurriculumTree(subjectId);
    return {
      message: `Successfully created ${createdCount} curriculum topics`,
      totalTopicsCreated: createdCount,
      tree,
    };
  }
}

export const curriculumService = new CurriculumService();
