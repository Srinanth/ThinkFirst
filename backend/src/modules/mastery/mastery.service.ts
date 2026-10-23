import { supabaseAdmin } from '../../config/supabase.js';
import { BadRequestError } from '../../utils/errors.util.js';
import { DeterministicMasteryEngine, EvidenceToken, UpdatedMasteryState } from './mastery.engine.js';

export class MasteryService {
  /**
   * Primary entry point for updating a student's mastery state from an assessment event
   */
  async recordEvidence(evidence: EvidenceToken): Promise<UpdatedMasteryState> {
    // 1. Fetch current mastery state
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('student_topic_mastery')
      .select('mastery_score, confidence')
      .eq('student_id', evidence.studentId)
      .eq('teacher_subject_id', evidence.teacherSubjectId)
      .eq('curriculum_topic_id', evidence.curriculumTopicId)
      .maybeSingle();

    if (fetchError) throw new BadRequestError(fetchError.message);

    const currentState = {
      masteryScore: existing ? Number(existing.mastery_score) : 0.0,
      confidence: existing ? Number(existing.confidence) : 0.1,
    };

    // 2. Deterministically calculate new state
    const newState = DeterministicMasteryEngine.computeNewState(currentState, evidence);

    const now = new Date().toISOString();

    // 3. Upsert into student_topic_mastery
    const { error: upsertError } = await supabaseAdmin
      .from('student_topic_mastery')
      .upsert(
        {
          student_id: evidence.studentId,
          teacher_subject_id: evidence.teacherSubjectId,
          curriculum_topic_id: evidence.curriculumTopicId,
          mastery_score: newState.masteryScore,
          confidence: newState.confidence,
          last_assessed_at: now,
          updated_at: now,
        },
        { onConflict: 'student_id,teacher_subject_id,curriculum_topic_id' }
      );

    if (upsertError) {
      throw new BadRequestError(`Failed to update student mastery state: ${upsertError.message}`);
    }

    // 4. Record audit entry in student_mastery_history
    const { error: historyError } = await supabaseAdmin
      .from('student_mastery_history')
      .insert({
        student_id: evidence.studentId,
        teacher_subject_id: evidence.teacherSubjectId,
        curriculum_topic_id: evidence.curriculumTopicId,
        mastery_score: newState.masteryScore,
        confidence: newState.confidence,
        assessment_source: evidence.source,
        assessed_at: now,
        source_quiz_id: evidence.sourceQuizId || null,
      });

    if (historyError) {
      console.error('Failed to log mastery history audit:', historyError);
    }

    return newState;
  }

  /**
   * Fetch mastery status across all topics in a class for a student
   */
  async getStudentMastery(subjectId: string, studentId: string) {
    const { data, error } = await supabaseAdmin
      .from('student_topic_mastery')
      .select(`
        mastery_score,
        confidence,
        last_assessed_at,
        updated_at,
        curriculum_topics:curriculum_topic_id (
          id,
          title,
          description,
          node_type,
          parent_topic_id
        )
      `)
      .eq('teacher_subject_id', subjectId)
      .eq('student_id', studentId);

    if (error) throw new BadRequestError(error.message);

    return (data || []).map((row) => ({
      masteryScore: Number(row.mastery_score),
      confidence: Number(row.confidence),
      lastAssessedAt: row.last_assessed_at,
      updatedAt: row.updated_at,
      topic: row.curriculum_topics,
    }));
  }

  /**
   * Fetch student's mastery history timeline
   */
  async getMasteryHistory(subjectId: string, studentId: string, topicId?: string) {
    let query = supabaseAdmin
      .from('student_mastery_history')
      .select(`
        id,
        mastery_score,
        confidence,
        assessment_source,
        assessed_at,
        source_quiz_id,
        curriculum_topics:curriculum_topic_id (id, title)
      `)
      .eq('teacher_subject_id', subjectId)
      .eq('student_id', studentId)
      .order('assessed_at', { ascending: true });

    if (topicId) {
      query = query.eq('curriculum_topic_id', topicId);
    }

    const { data, error } = await query;
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  /**
   * Aggregate class mastery overview for teacher dashboard
   */
  async getClassMasteryOverview(subjectId: string) {
    const { data: topics, error: topicError } = await supabaseAdmin
      .from('curriculum_topics')
      .select('id, title, node_type')
      .eq('teacher_subject_id', subjectId);

    if (topicError) throw new BadRequestError(topicError.message);

    const { data: scores, error: scoreError } = await supabaseAdmin
      .from('student_topic_mastery')
      .select('curriculum_topic_id, mastery_score, confidence')
      .eq('teacher_subject_id', subjectId);

    if (scoreError) throw new BadRequestError(scoreError.message);

    // Group scores by topic
    const topicStats = new Map<string, { totalScore: number; count: number; lowMasteryCount: number }>();

    (scores || []).forEach((row) => {
      const current = topicStats.get(row.curriculum_topic_id) || { totalScore: 0, count: 0, lowMasteryCount: 0 };
      const score = Number(row.mastery_score);
      current.totalScore += score;
      current.count += 1;
      if (score < 0.5) current.lowMasteryCount += 1;
      topicStats.set(row.curriculum_topic_id, current);
    });

    const overview = (topics || []).map((topic) => {
      const stats = topicStats.get(topic.id);
      const studentCount = stats ? stats.count : 0;
      const averageMastery = studentCount > 0 ? Number((stats!.totalScore / studentCount).toFixed(4)) : 0;
      const strugglingStudents = stats ? stats.lowMasteryCount : 0;

      return {
        topicId: topic.id,
        title: topic.title,
        nodeType: topic.node_type,
        studentCount,
        averageMastery,
        strugglingStudentsCount: strugglingStudents,
        isStrugglingTopic: averageMastery < 0.5 && studentCount > 0,
      };
    });

    return overview;
  }
}

export const masteryService = new MasteryService();
