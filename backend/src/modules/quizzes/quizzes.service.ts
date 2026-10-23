import { supabaseAdmin } from '../../config/supabase.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.util.js';
import { generateQuizQuestions } from './quiz-generator.util.js';
import { evaluateStudentAnswer, diagnoseQuizGaps } from '../../agents/evaluator.agent.js';
import { masteryService } from '../mastery/mastery.service.js';
import { materialsService } from '../materials/materials.service.js';
import {
  CreateQuestionInput,
  CreateQuizInput,
  GenerateQuizInput,
  SubmitAttemptInput,
} from './quizzes.schemas.js';

export class QuizzesService {
  /**
   * Create a quiz manually
   */
  async createQuiz(subjectId: string, teacherId: string, input: CreateQuizInput) {
    const { data, error } = await supabaseAdmin
      .from('quizzes')
      .insert({
        teacher_subject_id: subjectId,
        curriculum_topic_id: input.curriculumTopicId || null,
        created_by: teacherId,
        title: input.title,
        description: input.description || null,
        difficulty: input.difficulty,
        exam_duration: input.examDuration,
        status: input.status,
      })
      .select('*')
      .single();

    if (error) throw new BadRequestError(`Failed to create quiz: ${error.message}`);
    return data;
  }

  /**
   * List quizzes for a subject offering
   */
  async listQuizzes(subjectId: string, studentId?: string) {
    const { data: quizzes, error } = await supabaseAdmin
      .from('quizzes')
      .select(`
        id,
        title,
        description,
        difficulty,
        question_count,
        exam_duration,
        status,
        created_at,
        curriculum_topics:curriculum_topic_id (id, title)
      `)
      .eq('teacher_subject_id', subjectId)
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestError(error.message);

    if (studentId) {
      // Fetch student's attempt statuses
      const { data: attempts } = await supabaseAdmin
        .from('quiz_attempts')
        .select('quiz_id, id, score, max_score, status, started_at, submitted_at')
        .eq('student_id', studentId);

      const attemptMap = new Map((attempts || []).map((a) => [a.quiz_id, a]));

      return quizzes.map((q) => ({
        ...q,
        userAttempt: attemptMap.get(q.id) || null,
      }));
    }

    return quizzes;
  }

  /**
   * Get single quiz with its questions
   */
  async getQuiz(quizId: string, includeAnswers = false) {
    const { data: quiz, error: quizError } = await supabaseAdmin
      .from('quizzes')
      .select(`
        id,
        teacher_subject_id,
        curriculum_topic_id,
        title,
        description,
        difficulty,
        question_count,
        exam_duration,
        status,
        created_at,
        curriculum_topics:curriculum_topic_id (id, title)
      `)
      .eq('id', quizId)
      .single();

    if (quizError || !quiz) {
      throw new NotFoundError('Quiz not found');
    }

    // Fetch questions ordered by position
    const { data: questions, error: qError } = await supabaseAdmin
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('position', { ascending: true });

    if (qError) throw new BadRequestError(qError.message);

    return {
      ...quiz,
      questions: (questions || []).map((q) => ({
        id: q.id,
        position: q.position,
        questionText: q.question_text,
        questionType: q.question_type,
        options: q.options,
        difficulty: q.difficulty,
        marks: Number(q.marks),
        curriculumTopicId: q.curriculum_topic_id,
        // Hide correct answer and explanation if requested (e.g. for student taking test)
        correctAnswer: includeAnswers ? q.correct_answer : undefined,
        explanation: includeAnswers ? q.explanation : undefined,
      })),
    };
  }

  /**
   * Add a question to an existing quiz
   */
  async addQuestion(quizId: string, input: CreateQuestionInput) {
    // Determine next position if not specified
    let position = input.position;
    if (position === undefined) {
      const { count } = await supabaseAdmin
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true })
        .eq('quiz_id', quizId);

      position = count || 0;
    }

    const { data, error } = await supabaseAdmin
      .from('quiz_questions')
      .insert({
        quiz_id: quizId,
        curriculum_topic_id: input.curriculumTopicId || null,
        question_text: input.questionText,
        question_type: input.questionType,
        options: input.options || null,
        correct_answer: input.correctAnswer,
        explanation: input.explanation || null,
        difficulty: input.difficulty,
        marks: input.marks,
        position,
      })
      .select('*')
      .single();

    if (error) throw new BadRequestError(`Failed to add question: ${error.message}`);

    // Increment question_count in parent quiz
    const { count: totalQuestions } = await supabaseAdmin
      .from('quiz_questions')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId);

    await supabaseAdmin
      .from('quizzes')
      .update({ question_count: totalQuestions || 1 })
      .eq('id', quizId);

    return data;
  }

  /**
   * Diagnostic Quiz Generator: generates diagnostic questions from topic and notes via LLM
   */
  async generateQuizWithAgent(subjectId: string, teacherId: string, input: GenerateQuizInput) {
    // 1. Fetch curriculum topic details
    const { data: topic, error: topicError } = await supabaseAdmin
      .from('curriculum_topics')
      .select('id, title, description')
      .eq('id', input.curriculumTopicId)
      .single();

    if (topicError || !topic) {
      throw new NotFoundError('Curriculum topic not found');
    }

    // 2. Fetch context notes via vector search
    let contextNotes = '';
    try {
      const searchRes = await materialsService.similaritySearch(subjectId, {
        query: topic.title,
        matchCount: 3,
        matchThreshold: 0.4,
      });
      contextNotes = searchRes.matches.map((m) => m.content).join('\n---\n');
    } catch {
      // Fallback: continue without notes if none uploaded yet
    }

    // 3. Generate diagnostic questions via traditional LLM call
    const generatedQuestions = await generateQuizQuestions({
      topicTitle: topic.title,
      contextNotes,
      difficulty: input.difficulty,
      questionCount: input.questionCount,
    });

    if (generatedQuestions.length === 0) {
      throw new BadRequestError('Failed to generate quiz questions');
    }

    // 4. Create the Quiz container in database
    const { data: quiz, error: quizError } = await supabaseAdmin
      .from('quizzes')
      .insert({
        teacher_subject_id: subjectId,
        curriculum_topic_id: input.curriculumTopicId,
        created_by: teacherId,
        title: input.title,
        description: `AI-generated diagnostic quiz covering ${topic.title}`,
        difficulty: input.difficulty,
        question_count: generatedQuestions.length,
        exam_duration: input.examDuration,
        status: 'published',
      })
      .select('*')
      .single();

    if (quizError || !quiz) {
      throw new BadRequestError(`Failed to save quiz: ${quizError?.message}`);
    }

    // 5. Insert all generated questions
    for (let i = 0; i < generatedQuestions.length; i++) {
      const q = generatedQuestions[i];
      await supabaseAdmin
        .from('quiz_questions')
        .insert({
          quiz_id: quiz.id,
          curriculum_topic_id: input.curriculumTopicId,
          question_text: q.questionText,
          question_type: q.questionType,
          options: q.options || null,
          correct_answer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          marks: q.marks || 1,
          position: i,
        });
    }

    return this.getQuiz(quiz.id, true);
  }

  /**
   * Start a quiz attempt by a student
   */
  async startAttempt(quizId: string, studentId: string) {
    // Check if attempt already exists
    const { data: existing } = await supabaseAdmin
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('student_id', studentId)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'graded' || existing.status === 'submitted') {
        throw new BadRequestError('You have already submitted an attempt for this quiz');
      }
      return existing;
    }

    // Fetch quiz total marks
    const { data: questions } = await supabaseAdmin
      .from('quiz_questions')
      .select('marks')
      .eq('quiz_id', quizId);

    const maxScore = (questions || []).reduce((acc, q) => acc + Number(q.marks), 0);

    const { data: attempt, error } = await supabaseAdmin
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        student_id: studentId,
        max_score: maxScore,
        status: 'in_progress',
      })
      .select('*')
      .single();

    if (error) throw new BadRequestError(`Failed to start attempt: ${error.message}`);
    return attempt;
  }

  /**
   * Submit an attempt, run Evaluator Agent, and trigger Deterministic Mastery Engine!
   */
  async submitAttempt(attemptId: string, studentId: string, input: SubmitAttemptInput) {
    const { data: attempt, error: attError } = await supabaseAdmin
      .from('quiz_attempts')
      .select('*, quizzes:quiz_id (id, teacher_subject_id, curriculum_topic_id)')
      .eq('id', attemptId)
      .single();

    if (attError || !attempt) throw new NotFoundError('Quiz attempt not found');
    if (attempt.student_id !== studentId) throw new BadRequestError('Unauthorized attempt submission');
    if (attempt.status === 'graded') throw new BadRequestError('Attempt has already been graded');

    const quiz = attempt.quizzes;
    let totalScore = 0;
    let totalMax = 0;

    // Fetch questions
    const questionIds = input.responses.map((r) => r.questionId);
    const { data: questions, error: qError } = await supabaseAdmin
      .from('quiz_questions')
      .select('*')
      .in('id', questionIds);

    if (qError || !questions) throw new BadRequestError('Failed to fetch questions for evaluation');

    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const missedQuestions: Array<{
      questionText: string;
      studentAnswer: unknown;
      correctAnswer: unknown;
      feedback: string;
    }> = [];

    // Evaluate each response
    for (const res of input.responses) {
      const q = questionMap.get(res.questionId);
      if (!q) continue;

      const maxMarks = Number(q.marks);
      totalMax += maxMarks;

      // Evaluator Agent evaluates the answer
      const evaluation = await evaluateStudentAnswer({
        questionText: q.question_text,
        questionType: q.question_type,
        studentAnswer: res.studentAnswer,
        correctAnswer: q.correct_answer,
        maxMarks,
      });

      totalScore += evaluation.marksAwarded;

      if (!evaluation.isCorrect) {
        missedQuestions.push({
          questionText: q.question_text,
          studentAnswer: res.studentAnswer,
          correctAnswer: q.correct_answer,
          feedback: evaluation.feedback,
        });
      }

      // Insert response into quiz_responses
      await supabaseAdmin
        .from('quiz_responses')
        .upsert(
          {
            quiz_attempt_id: attemptId,
            question_id: res.questionId,
            student_answer: res.studentAnswer,
            is_correct: evaluation.isCorrect,
            marks_awarded: evaluation.marksAwarded,
            feedback: evaluation.feedback,
            answered_at: new Date().toISOString(),
          },
          { onConflict: 'quiz_attempt_id,question_id' }
        );

      // Deterministic Mastery Engine hook: update mastery for topic
      const topicId = q.curriculum_topic_id || quiz.curriculum_topic_id;
      if (topicId) {
        await masteryService.recordEvidence({
          studentId,
          teacherSubjectId: quiz.teacher_subject_id,
          curriculumTopicId: topicId,
          evidenceScore: evaluation.evidenceScore,
          source: 'quiz',
          sourceQuizId: quiz.id,
        });
      }
    }

    const now = new Date().toISOString();

    // Update attempt record
    const { data: updatedAttempt, error: updateError } = await supabaseAdmin
      .from('quiz_attempts')
      .update({
        score: totalScore,
        max_score: totalMax,
        status: 'graded',
        submitted_at: now,
        graded_at: now,
      })
      .eq('id', attemptId)
      .select('*')
      .single();

    if (updateError) throw new BadRequestError(`Failed to finalize attempt: ${updateError.message}`);

    // Autonomous Gap Diagnosis & Teacher Insight Creation
    let remediationMission: any = null;
    const targetTopicId = quiz.curriculum_topic_id;

    if (targetTopicId) {
      let topicTitle = quiz.title;
      const { data: topic } = await supabaseAdmin
        .from('curriculum_topics')
        .select('title')
        .eq('id', targetTopicId)
        .maybeSingle();

      if (topic?.title) {
        topicTitle = topic.title;
      }

      let courseNotesContext = '';
      try {
        const searchRes = await materialsService.similaritySearch(quiz.teacher_subject_id, {
          query: topicTitle,
          matchCount: 2,
          matchThreshold: 0.45,
        });
        courseNotesContext = searchRes.matches.map((m) => m.content).join('\n---\n');
      } catch {
        // Continue if notes unavailable
      }

      const diagnosis = await diagnoseQuizGaps({
        topicTitle,
        totalScore,
        maxScore: totalMax,
        missedQuestions,
        courseNotesContext,
      });

      if (diagnosis) {
        // Check for existing active insight for this student & topic to avoid duplicates
        const { data: existingInsight } = await supabaseAdmin
          .from('teacher_insights')
          .select('id')
          .eq('student_id', studentId)
          .eq('curriculum_topic_id', targetTopicId)
          .eq('status', 'active')
          .maybeSingle();

        let insightId = existingInsight?.id;

        if (!insightId) {
          const { data: insertedInsight } = await supabaseAdmin
            .from('teacher_insights')
            .insert({
              teacher_subject_id: quiz.teacher_subject_id,
              insight_type: 'weak_areas',
              title: diagnosis.title,
              description: diagnosis.diagnosedGap,
              curriculum_topic_id: targetTopicId,
              student_id: studentId,
              evidence: {
                initialScore: totalMax > 0 ? Number((totalScore / totalMax).toFixed(2)) : 0,
                missedQuestions: missedQuestions.map((m) => m.questionText),
                actionPlan: diagnosis.actionPlan,
                actionWidgets: diagnosis.actionWidgets,
                progressTrace: [],
                teacherAdvice: diagnosis.teacherAdvice,
              },
              status: 'active',
            })
            .select('id')
            .single();

          insightId = insertedInsight?.id;
        }

        remediationMission = {
          insightId,
          topicId: targetTopicId,
          title: diagnosis.title,
          diagnosedGap: diagnosis.diagnosedGap,
          actionPlan: diagnosis.actionPlan,
          openingPrompt: diagnosis.openingPrompt,
          actionWidgets: diagnosis.actionWidgets,
        };
      }
    }

    return {
      attempt: updatedAttempt,
      score: totalScore,
      maxScore: totalMax,
      percentage: totalMax > 0 ? Number(((totalScore / totalMax) * 100).toFixed(1)) : 0,
      remediationMission,
    };
  }

  /**
   * Get graded attempt results with question-by-question breakdown and remediation mission
   */
  async getAttemptResults(attemptId: string) {
    const { data: attempt, error: attError } = await supabaseAdmin
      .from('quiz_attempts')
      .select(`
        id,
        quiz_id,
        student_id,
        score,
        max_score,
        status,
        started_at,
        submitted_at,
        graded_at,
        quizzes:quiz_id (id, title, difficulty, curriculum_topic_id, teacher_subject_id)
      `)
      .eq('id', attemptId)
      .single();

    if (attError || !attempt) throw new NotFoundError('Attempt not found');

    const { data: responses, error: resError } = await supabaseAdmin
      .from('quiz_responses')
      .select(`
        id,
        question_id,
        student_answer,
        is_correct,
        marks_awarded,
        feedback,
        answered_at,
        quiz_questions:question_id (
          id,
          question_text,
          question_type,
          options,
          correct_answer,
          explanation,
          marks,
          position
        )
      `)
      .eq('quiz_attempt_id', attemptId);

    if (resError) throw new BadRequestError(resError.message);

    // Retrieve any active or recently resolved gap mission for this topic
    let remediationMission: any = null;
    const quizData = attempt.quizzes as any;
    if (quizData?.curriculum_topic_id) {
      const { data: insight } = await supabaseAdmin
        .from('teacher_insights')
        .select('*')
        .eq('student_id', attempt.student_id)
        .eq('curriculum_topic_id', quizData.curriculum_topic_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (insight) {
        const evidence = (insight.evidence as Record<string, any>) || {};
        remediationMission = {
          insightId: insight.id,
          topicId: insight.curriculum_topic_id,
          title: insight.title,
          diagnosedGap: insight.description,
          actionPlan: evidence.actionPlan || '',
          actionWidgets: evidence.actionWidgets || [],
          status: insight.status,
        };
      }
    }

    return {
      ...attempt,
      responses,
      remediationMission,
    };
  }
}

export const quizzesService = new QuizzesService();
