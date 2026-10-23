import { supabaseAdmin } from '../../config/supabase.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.util.js';
import { synthesizeTeacherInsightsWithAgent } from '../../agents/insight.agent.js';
import { masteryService } from '../mastery/mastery.service.js';

export class InsightsService {
  /**
   * List insights for a subject offering
   */
  async listInsights(subjectId: string, status?: string) {
    let query = supabaseAdmin
      .from('teacher_insights')
      .select(`
        id,
        teacher_subject_id,
        insight_type,
        title,
        description,
        curriculum_topic_id,
        student_id,
        evidence,
        status,
        created_at,
        updated_at,
        curriculum_topics:curriculum_topic_id (id, title),
        profiles:student_id (id, full_name)
      `)
      .eq('teacher_subject_id', subjectId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  /**
   * Generate fresh insights using the Insight Synthesis Agent
   */
  async generateInsights(subjectId: string) {
    // 1. Fetch subject and enrolled student count
    const { data: subject, error: subError } = await supabaseAdmin
      .from('teacher_subjects')
      .select('subject, memberships (count)')
      .eq('id', subjectId)
      .single();

    if (subError || !subject) throw new NotFoundError('Subject offering not found');

    const totalStudents = subject.memberships?.[0]?.count ?? 0;

    // 2. Fetch classroom mastery overview
    const overview = await masteryService.getClassMasteryOverview(subjectId);

    // 3. Synthesize insights via Insight Agent
    const synthesized = await synthesizeTeacherInsightsWithAgent({
      subjectName: subject.subject,
      classOverview: overview.map((o) => ({
        topicId: o.topicId,
        title: o.title,
        averageMastery: o.averageMastery,
        strugglingStudentsCount: o.strugglingStudentsCount,
      })),
      totalStudents,
    });

    if (synthesized.length === 0) {
      return {
        message: 'No new insights synthesized.',
        createdCount: 0,
      };
    }

    // 4. Insert insights into teacher_insights
    const inserted = [];
    for (const item of synthesized) {
      const { data, error } = await supabaseAdmin
        .from('teacher_insights')
        .insert({
          teacher_subject_id: subjectId,
          insight_type: item.insightType,
          title: item.title,
          description: item.description,
          curriculum_topic_id: item.curriculumTopicId || null,
          student_id: item.studentId || null,
          evidence: item.evidence || null,
          status: 'active',
        })
        .select('*')
        .single();

      if (!error && data) {
        inserted.push(data);
      }
    }

    return {
      message: `Successfully synthesized ${inserted.length} pedagogical insights`,
      insights: inserted,
    };
  }

  /**
   * Update insight status (e.g. mark 'resolved' or 'dismissed')
   */
  async updateStatus(insightId: string, status: 'active' | 'dismissed' | 'resolved') {
    const { data, error } = await supabaseAdmin
      .from('teacher_insights')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', insightId)
      .select('*')
      .single();

    if (error) throw new BadRequestError(error.message);
    return data;
  }

  /**
   * Delete an insight
   */
  async deleteInsight(insightId: string) {
    const { error } = await supabaseAdmin
      .from('teacher_insights')
      .delete()
      .eq('id', insightId);

    if (error) throw new BadRequestError(error.message);
    return { id: insightId, deleted: true };
  }
}

export const insightsService = new InsightsService();
