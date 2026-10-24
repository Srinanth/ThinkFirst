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

  /**
   * Full database-driven analytics for Teacher Class Workspace
   */
  async getClassAnalytics(subjectId: string) {
    // 1. Fetch Topics
    const { data: topics, error: topicErr } = await supabaseAdmin
      .from('curriculum_topics')
      .select('id, title, node_type')
      .eq('teacher_subject_id', subjectId);
    if (topicErr) throw new BadRequestError(topicErr.message);

    // 2. Fetch Roster & Profiles
    const { data: roster, error: rosterErr } = await supabaseAdmin
      .from('memberships')
      .select(`
        student_id,
        joined_at,
        profiles:student_id (id, full_name, college)
      `)
      .eq('teacher_subject_id', subjectId);
    if (rosterErr) throw new BadRequestError(rosterErr.message);

    // Map Auth Users for emails & login ids
    let userMap = new Map<string, any>();
    try {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      if (usersData?.users) {
        userMap = new Map(usersData.users.map((u) => [u.id, u]));
      }
    } catch {
      // Non-fatal if auth listing fails
    }

    // 3. Fetch Quizzes
    const { data: quizzes, error: quizErr } = await supabaseAdmin
      .from('quizzes')
      .select('id, title, created_at, status, exam_duration, question_count')
      .eq('teacher_subject_id', subjectId)
      .order('created_at', { ascending: true });
    if (quizErr) throw new BadRequestError(quizErr.message);

    const quizIds = (quizzes || []).map((q) => q.id);

    // 4. Fetch Attempts
    let attempts: any[] = [];
    if (quizIds.length > 0) {
      const { data: attData } = await supabaseAdmin
        .from('quiz_attempts')
        .select('id, quiz_id, student_id, score, max_score, status, submitted_at, started_at')
        .in('quiz_id', quizIds);
      attempts = attData || [];
    }

    // 5. Fetch Topic Mastery
    const { data: masteryRecords, error: mErr } = await supabaseAdmin
      .from('student_topic_mastery')
      .select('student_id, curriculum_topic_id, mastery_score, confidence, last_assessed_at')
      .eq('teacher_subject_id', subjectId);
    if (mErr) throw new BadRequestError(mErr.message);

    // 6. Fetch Insights
    const { data: insights } = await supabaseAdmin
      .from('teacher_insights')
      .select('id, insight_type, title, description, status, evidence, created_at')
      .eq('teacher_subject_id', subjectId)
      .order('created_at', { ascending: false });

    // A. Overall Mastery Calculation
    const overallMastery =
      masteryRecords && masteryRecords.length > 0
        ? Math.round(
            (masteryRecords.reduce((sum, r) => sum + Number(r.mastery_score), 0) / masteryRecords.length) * 100
          )
        : 0;

    // B. Performance Progression Trend Data
    const trendData = (quizzes || []).map((q, idx) => {
      const quizAtts = attempts.filter(
        (a) => a.quiz_id === q.id && (a.status === 'graded' || a.status === 'submitted')
      );
      const avgScore =
        quizAtts.length > 0
          ? Math.round(
              quizAtts.reduce(
                (sum, a) => sum + (Number(a.score) / (Number(a.max_score) || 1)) * 100,
                0
              ) / quizAtts.length
            )
          : 0;

      const shortTitle = q.title.replace(/^Quiz \d+:\s*/i, '').slice(0, 18);
      return {
        quiz: `Q${idx + 1}: ${shortTitle}`,
        fullTitle: q.title,
        avgScore,
        benchmark: 70,
      };
    });

    // Growth Rate
    let growthRate = '+0% Growth';
    if (trendData.length >= 2) {
      const first = trendData[0].avgScore;
      const last = trendData[trendData.length - 1].avgScore;
      const delta = last - first;
      growthRate = delta >= 0 ? `+${delta}% Growth` : `${delta}% Shift`;
    }

    // C. Score Tier Distribution Data
    let masteredCount = 0;
    let developingCount = 0;
    let supportCount = 0;

    (roster || []).forEach((m) => {
      const stRecords = (masteryRecords || []).filter((r) => r.student_id === m.student_id);
      const stAvg =
        stRecords.length > 0
          ? stRecords.reduce((sum, r) => sum + Number(r.mastery_score), 0) / stRecords.length
          : 0;

      if (stAvg >= 0.8) masteredCount++;
      else if (stAvg >= 0.5) developingCount++;
      else supportCount++;
    });

    const distributionData = [
      { name: 'Mastered', value: masteredCount, color: '#00d2ff' },
      { name: 'Developing', value: developingCount, color: '#38bdf8' },
      { name: 'Needs Support', value: supportCount, color: '#8b5cf6' },
    ];

    // D. Strong Areas & Mastery
    const topicScoreMap = new Map<string, { total: number; count: number }>();
    (masteryRecords || []).forEach((r) => {
      const cur = topicScoreMap.get(r.curriculum_topic_id) || { total: 0, count: 0 };
      cur.total += Number(r.mastery_score);
      cur.count += 1;
      topicScoreMap.set(r.curriculum_topic_id, cur);
    });

    const strongAreas = (topics || [])
      .map((t) => {
        const stats = topicScoreMap.get(t.id);
        const avg = stats && stats.count > 0 ? stats.total / stats.count : 0;
        return {
          topic: t.title,
          avgScore: Math.round(avg * 100),
          praise: `Students demonstrate solid proficiency with ${t.title.toLowerCase()} concepts.`,
        };
      })
      .filter((s) => s.avgScore >= 70)
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 4);

    // E. Performance Shifts Variation Summary
    const variationSummary: Array<{
      quizTitle: string;
      change: string;
      isPositive: boolean;
      detail: string;
    }> = [];

    for (let i = 1; i < trendData.length; i++) {
      const prev = trendData[i - 1].avgScore;
      const curr = trendData[i].avgScore;
      const delta = curr - prev;
      variationSummary.push({
        quizTitle: trendData[i].fullTitle,
        change: delta >= 0 ? `+${delta}% Shift` : `${delta}% Shift`,
        isPositive: delta >= 0,
        detail:
          delta >= 0
            ? `Positive progression of ${delta}% over prior assessment.`
            : `Score shift of ${Math.abs(delta)}%; revision recommended.`,
      });
    }

    // F. Student-Wise Analytics for Teacher Roster Drilldown
    const students = (roster || []).map((m) => {
      const user = userMap.get(m.student_id);
      const profile = (m as any).profiles;
      const stAttempts = attempts.filter(
        (a) => a.student_id === m.student_id && (a.status === 'graded' || a.status === 'submitted')
      );
      const avgScore =
        stAttempts.length > 0
          ? Math.round(
              stAttempts.reduce(
                (sum, a) => sum + (Number(a.score) / (Number(a.max_score) || 1)) * 100,
                0
              ) / stAttempts.length
            )
          : 0;

      const stRecords = (masteryRecords || []).filter((r) => r.student_id === m.student_id);
      const stAvgMastery =
        stRecords.length > 0
          ? stRecords.reduce((sum, r) => sum + Number(r.mastery_score), 0) / stRecords.length
          : 0;
      const masteryPct = Math.round(stAvgMastery * 100);
      const tier: 'Mastered' | 'Developing' | 'Needs Support' =
        masteryPct >= 80 ? 'Mastered' : masteryPct >= 50 ? 'Developing' : 'Needs Support';

      // Chronological quiz trend for this student
      const studentTrend = (quizzes || []).map((q, idx) => {
        const att = stAttempts.find((a) => a.quiz_id === q.id);
        const score = att ? Math.round((Number(att.score) / (Number(att.max_score) || 1)) * 100) : 0;
        return {
          quiz: `Q${idx + 1}`,
          quizTitle: q.title,
          score,
          hasTaken: !!att,
        };
      });

      const topicBreakdown = stRecords.map((r) => {
        const topic = (topics || []).find((t) => t.id === r.curriculum_topic_id);
        const score = Math.round(Number(r.mastery_score) * 100);
        return {
          topicId: r.curriculum_topic_id,
          title: topic?.title || 'Curriculum Topic',
          score,
          tier: score >= 80 ? 'Mastered' : score >= 50 ? 'Developing' : 'Needs Support',
        };
      });

      return {
        id: m.student_id,
        fullName: profile?.full_name || user?.user_metadata?.full_name || 'Enrolled Student',
        email: user?.email || '',
        loginId: user?.user_metadata?.login_id || 'STD-2026',
        college: profile?.college || 'Faculty of Engineering',
        joinedAt: m.joined_at,
        overallMastery: masteryPct,
        tier,
        quizzesCompleted: stAttempts.length,
        totalQuizzes: (quizzes || []).length,
        avgScore,
        studentTrend,
        topicBreakdown,
      };
    });

    return {
      overallMastery,
      growthRate,
      trendData,
      distributionData,
      strongAreas,
      variationSummary,
      insights: insights || [],
      students,
    };
  }

  /**
   * Student-facing progress & topic readiness (Deterministic State Law: qualitative tiers, no raw numeric scores)
   */
  async getStudentProgress(subjectId: string, studentId: string) {
    // 1. Quizzes & Student Attempts
    const { data: quizzes, error: qErr } = await supabaseAdmin
      .from('quizzes')
      .select('id, title, exam_duration, question_count, created_at, status')
      .eq('teacher_subject_id', subjectId)
      .eq('status', 'published')
      .order('created_at', { ascending: true });
    if (qErr) throw new BadRequestError(qErr.message);

    const quizIds = (quizzes || []).map((q) => q.id);
    let attempts: any[] = [];
    if (quizIds.length > 0) {
      const { data: attData } = await supabaseAdmin
        .from('quiz_attempts')
        .select('id, quiz_id, score, max_score, status, submitted_at, started_at')
        .eq('student_id', studentId)
        .in('quiz_id', quizIds);
      attempts = attData || [];
    }

    // 2. Class topic mastery for qualitative standing
    const { data: topicRecords } = await supabaseAdmin
      .from('student_topic_mastery')
      .select(`
        mastery_score,
        confidence,
        last_assessed_at,
        curriculum_topics:curriculum_topic_id (id, title, description)
      `)
      .eq('teacher_subject_id', subjectId)
      .eq('student_id', studentId);

    const completedQuizzes = (quizzes || [])
      .filter((q) => {
        const att = attempts.find((a) => a.quiz_id === q.id);
        return att && (att.status === 'graded' || att.status === 'submitted');
      })
      .map((q, idx) => {
        const att = attempts.find((a) => a.quiz_id === q.id)!;
        return {
          id: q.id,
          number: `Quiz ${idx + 1}`,
          title: q.title,
          submittedAt: att.submitted_at,
          score: Number(att.score) || 0,
          maxScore: Number(att.max_score) || 1,
          duration: `${q.exam_duration || 20} mins`,
        };
      });

    const topicReadiness = (topicRecords || []).map((row: any) => {
      const score = Number(row.mastery_score);
      const tier: 'Mastered' | 'Developing' | 'Needs Review' =
        score >= 0.8 ? 'Mastered' : score >= 0.5 ? 'Developing' : 'Needs Review';
      return {
        topicId: row.curriculum_topics?.id,
        title: row.curriculum_topics?.title || 'Topic',
        description: row.curriculum_topics?.description || '',
        status: tier,
        lastAssessedAt: row.last_assessed_at,
      };
    });

    const masteredCount = topicReadiness.filter((t) => t.status === 'Mastered').length;
    const overallStanding =
      masteredCount >= Math.ceil(topicReadiness.length * 0.6)
        ? 'On Track'
        : topicReadiness.length > 0
        ? 'Developing'
        : 'Enrolled';

    return {
      completedQuizzes,
      topicReadiness,
      overallStanding,
      completedCount: completedQuizzes.length,
      totalQuizzes: (quizzes || []).length,
    };
  }
}

export const masteryService = new MasteryService();
