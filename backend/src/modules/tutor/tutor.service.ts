import { Response } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.util.js';
import {
  generateInteractiveSocraticTurn,
  streamSocraticResponse,
  TutorMessageHistory,
  PedagogicalMode,
  DifficultyBreakdown,
} from '../../agents/tutor.agent.js';
import { materialsService } from '../materials/materials.service.js';
import { masteryService } from '../mastery/mastery.service.js';
import { CreateConversationInput, SendMessageInput } from './tutor.schemas.js';

export class TutorService {
  /**
   * Start a new Socratic tutor conversation thread
   */
  async createConversation(studentId: string, input: CreateConversationInput) {
    const { data, error } = await supabaseAdmin
      .from('tutor_conversations')
      .insert({
        student_id: studentId,
        teacher_subject_id: input.teacherSubjectId,
        title: input.title || 'New Tutoring Session',
        session_type: input.sessionType,
      })
      .select('*')
      .single();

    if (error) throw new BadRequestError(`Failed to create conversation: ${error.message}`);
    return data;
  }

  /**
   * Get or create the isolated active conversation for a student in a specific subject
   */
  async getOrCreateSubjectConversation(studentId: string, subjectId: string) {
    // 1. Check for existing conversation for this student and subject
    const { data: existing } = await supabaseAdmin
      .from('tutor_conversations')
      .select('*')
      .eq('student_id', studentId)
      .eq('teacher_subject_id', subjectId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Fetch its messages
      const { data: messages } = await supabaseAdmin
        .from('tutor_messages')
        .select('id, conversation_id, role, content, curriculum_topic_id, created_at')
        .eq('conversation_id', existing.id)
        .order('created_at', { ascending: true });

      return {
        conversation: existing,
        messages: messages || [],
      };
    }

    // 2. Fetch subject details to personalize title
    const { data: subject } = await supabaseAdmin
      .from('teacher_subjects')
      .select('id, subjects (name, code)')
      .eq('id', subjectId)
      .maybeSingle();

    const subjData = subject?.subjects as unknown as { name?: string; code?: string } | undefined;
    const title = subjData?.code ? `${subjData.code} Socratic Session` : 'Socratic Session';

    // 3. Create new conversation
    const { data: conv, error: convError } = await supabaseAdmin
      .from('tutor_conversations')
      .insert({
        student_id: studentId,
        teacher_subject_id: subjectId,
        title,
        session_type: 'ai_tutor',
      })
      .select('*')
      .single();

    if (convError || !conv) {
      throw new BadRequestError(`Failed to create tutor conversation: ${convError?.message}`);
    }

    // 4. Create initial welcome message for this subject
    const welcomeText = `Hello! I'm your Socratic AI Tutor for ${subjData?.name || 'this course'}. How can I guide your understanding today?`;
    const { data: welcomeMsg } = await supabaseAdmin
      .from('tutor_messages')
      .insert({
        conversation_id: conv.id,
        role: 'assistant',
        content: welcomeText,
      })
      .select('id, conversation_id, role, content, curriculum_topic_id, created_at')
      .single();

    return {
      conversation: conv,
      messages: welcomeMsg ? [welcomeMsg] : [],
    };
  }

  /**
   * List conversations for a student in a subject
   */
  async listConversations(studentId: string, subjectId: string) {
    const { data, error } = await supabaseAdmin
      .from('tutor_conversations')
      .select('id, title, session_type, started_at, ended_at, created_at, updated_at')
      .eq('student_id', studentId)
      .eq('teacher_subject_id', subjectId)
      .order('updated_at', { ascending: false });

    if (error) throw new BadRequestError(error.message);
    return data;
  }

  /**
   * Fetch conversation messages
   */
  async getMessages(conversationId: string) {
    const { data, error } = await supabaseAdmin
      .from('tutor_messages')
      .select('id, conversation_id, role, content, curriculum_topic_id, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw new BadRequestError(error.message);
    return data;
  }

  /**
   * Diagnose student's question difficulty performance and generate recommendation
   */
  async getDiagnosticRecommendation(studentId: string, subjectId: string) {
    // 1. Fetch recent completed quiz attempts for this subject
    const { data: attempts } = await supabaseAdmin
      .from('quiz_attempts')
      .select(`
        id,
        quiz_id,
        score,
        max_score,
        status,
        submitted_at,
        quizzes!inner (
          id,
          title,
          difficulty,
          curriculum_topic_id,
          teacher_subject_id
        )
      `)
      .eq('student_id', studentId)
      .eq('quizzes.teacher_subject_id', subjectId)
      .in('status', ['submitted', 'graded'])
      .order('submitted_at', { ascending: false })
      .limit(3);

    const latestAttempt = attempts && attempts.length > 0 ? attempts[0] : null;

    if (latestAttempt) {
      const quiz = (latestAttempt as any).quizzes;
      // Fetch responses for this attempt
      const { data: responses } = await supabaseAdmin
        .from('quiz_responses')
        .select(`
          id,
          is_correct,
          marks_awarded,
          question_id,
          quiz_questions!inner (
            id,
            question_text,
            difficulty,
            curriculum_topic_id,
            marks
          )
        `)
        .eq('quiz_attempt_id', latestAttempt.id);

      const resList = responses || [];
      const easyMissed = resList.filter(
        (r: any) => !r.is_correct && r.quiz_questions?.difficulty === 'easy'
      ).length;
      const mediumMissed = resList.filter(
        (r: any) => !r.is_correct && r.quiz_questions?.difficulty === 'medium'
      ).length;
      const hardMissed = resList.filter(
        (r: any) => !r.is_correct && r.quiz_questions?.difficulty === 'hard'
      ).length;
      const totalMissed = resList.filter((r: any) => !r.is_correct).length;
      const totalQuestions = resList.length;

      // Determine topic
      let targetTopicId = quiz?.curriculum_topic_id;
      const missedWithTopic = resList.find(
        (r: any) => !r.is_correct && r.quiz_questions?.curriculum_topic_id
      );
      if (missedWithTopic) {
        targetTopicId = (missedWithTopic as any).quiz_questions.curriculum_topic_id;
      }

      let topicTitle = quiz?.title || 'Subject Fundamentals';
      if (targetTopicId) {
        const { data: topic } = await supabaseAdmin
          .from('curriculum_topics')
          .select('id, title')
          .eq('id', targetTopicId)
          .maybeSingle();
        if (topic?.title) topicTitle = topic.title;
      }

      // Mastery score
      let masteryScore = 0.5;
      if (targetTopicId) {
        const { data: mast } = await supabaseAdmin
          .from('student_topic_mastery')
          .select('mastery_score')
          .eq('student_id', studentId)
          .eq('curriculum_topic_id', targetTopicId)
          .maybeSingle();
        if (mast?.mastery_score !== undefined) {
          masteryScore = Number(mast.mastery_score);
        }
      }

      // Check active insight
      const { data: activeInsight } = await supabaseAdmin
        .from('teacher_insights')
        .select('*')
        .eq('student_id', studentId)
        .eq('teacher_subject_id', subjectId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Determine pedagogical mode & advice
      let pedagogicalMode: PedagogicalMode = 'conceptual_reinforcement';
      let urgency: 'high' | 'medium' | 'low' = 'medium';
      let recommendationReason = '';
      let speechBubblePrompt = '';
      let openingPrompt = '';
      let actionWidgets: Array<{ type: 'pill'; label: string; value: string }> = [];

      if (easyMissed > 0) {
        pedagogicalMode = 'foundational_assistance';
        urgency = 'high';
        recommendationReason = `You had difficulty with fundamental questions in ${quiz?.title || 'your recent quiz'}. Foundational personal assistance recommended.`;
        speechBubblePrompt = `Study Recommended: ${topicTitle} — You had trouble with basic questions. Let's build your foundations together!`;
        openingPrompt = `Hello! In your recent quiz on ${topicTitle}, you encountered some tricky foundational questions. Let's take it from first principles together. How would you describe the main purpose of ${topicTitle} in your own words?`;
        actionWidgets = [
          { type: 'pill', label: 'Start with the basics', value: 'Can you explain the basic definition in simple words?' },
          { type: 'pill', label: 'Use a real-world analogy', value: 'Give me a real-world analogy to understand this.' },
          { type: 'pill', label: 'Walk me step-by-step', value: 'Walk me through a simple example step by step.' },
        ];
      } else if (mediumMissed > 0) {
        pedagogicalMode = 'conceptual_reinforcement';
        urgency = 'medium';
        recommendationReason = `You grasped the definitions well, but missed applied questions in ${quiz?.title || 'your recent quiz'}. Guided problem-solving recommended.`;
        speechBubblePrompt = `Study Recommended: ${topicTitle} — Practice applied reasoning with your AI Tutor!`;
        openingPrompt = `Hi! You have a solid grasp of the basics in ${topicTitle}, but hit some friction on multi-step applied questions. Where did you feel the most resistance during the quiz?`;
        actionWidgets = [
          { type: 'pill', label: 'Review application steps', value: 'How do I apply this concept to multi-step problems?' },
          { type: 'pill', label: 'Practice similar scenario', value: 'Give me a practice scenario to work through.' },
          { type: 'pill', label: 'Clarify tricky rules', value: 'What common pitfalls should I avoid here?' },
        ];
      } else if (hardMissed > 0) {
        pedagogicalMode = 'advanced_challenge';
        urgency = 'low';
        recommendationReason = `Great work on the fundamentals! You only missed stretch/challenge questions in ${quiz?.title || 'your recent quiz'}. Edge-case mastery recommended.`;
        speechBubblePrompt = `Level Up: ${topicTitle} — Master tricky edge cases & advanced problems!`;
        openingPrompt = `Impressive work! You breezed through the foundational questions in ${topicTitle} and only hit resistance on the toughest challenge problems. Ready to dissect the subtle edge cases?`;
        actionWidgets = [
          { type: 'pill', label: 'Explore tricky edge cases', value: 'What are the most subtle edge cases for this topic?' },
          { type: 'pill', label: 'Discuss performance tradeoffs', value: 'What are the performance tradeoffs here?' },
          { type: 'pill', label: 'Challenge problem', value: 'Give me a hard challenge problem to solve.' },
        ];
      } else {
        pedagogicalMode = 'socratic_mastery';
        urgency = 'low';
        recommendationReason = `Outstanding mastery across all question tiers in ${quiz?.title || 'your recent quiz'}! Socratic trade-off debate recommended.`;
        speechBubblePrompt = `Top Performer: ${topicTitle} — Ready for architectural trade-off challenges?`;
        openingPrompt = `Outstanding performance! You have strong mastery of ${topicTitle}. Let's push into real-world architecture and engineering trade-offs. What do you see as the biggest limitation of this approach?`;
        actionWidgets = [
          { type: 'pill', label: 'Real-world system tradeoffs', value: 'What system trade-offs do engineers face when using this?' },
          { type: 'pill', label: 'Critique a flawed design', value: 'Give me a flawed design scenario to critique.' },
          { type: 'pill', label: 'Advanced architectural questions', value: 'Ask me an advanced architecture design question.' },
        ];
      }

      return {
        hasRecommendation: true,
        topicId: targetTopicId,
        topicTitle,
        quizTitle: quiz?.title || 'Recent Quiz',
        pedagogicalMode,
        urgency,
        recommendationReason,
        speechBubblePrompt,
        openingPrompt,
        actionWidgets,
        difficultyBreakdown: {
          easyMissed,
          mediumMissed,
          hardMissed,
          totalMissed,
          totalQuestions,
        },
        masteryScore,
        activeInsight: activeInsight || null,
      };
    }

    // Fallback if no quizzes taken yet
    const { data: lowestMastery } = await supabaseAdmin
      .from('student_topic_mastery')
      .select('curriculum_topic_id, mastery_score, curriculum_topics (id, title)')
      .eq('student_id', studentId)
      .order('mastery_score', { ascending: true })
      .limit(1)
      .maybeSingle();

    let fallbackTopicId = lowestMastery?.curriculum_topic_id;
    let fallbackTopicTitle = (lowestMastery?.curriculum_topics as any)?.title;

    if (!fallbackTopicId) {
      const { data: firstTopic } = await supabaseAdmin
        .from('curriculum_topics')
        .select('id, title')
        .eq('teacher_subject_id', subjectId)
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle();
      fallbackTopicId = firstTopic?.id;
      fallbackTopicTitle = firstTopic?.title;
    }

    return {
      hasRecommendation: Boolean(fallbackTopicId),
      topicId: fallbackTopicId || null,
      topicTitle: fallbackTopicTitle || 'Course Concepts',
      quizTitle: null,
      pedagogicalMode: 'conceptual_reinforcement' as PedagogicalMode,
      urgency: 'medium' as const,
      recommendationReason: 'Welcome! Start exploring your course concepts with the Socratic AI Tutor.',
      speechBubblePrompt: fallbackTopicTitle
        ? `Study Recommended: ${fallbackTopicTitle} — Get a head start with your Socratic AI Tutor!`
        : 'Socratic AI Tutor Ready — Ask questions and practice your understanding!',
      openingPrompt: `Hello! I'm your Socratic AI Tutor for this course. Would you like to explore ${fallbackTopicTitle || 'our key topics'} together?`,
      actionWidgets: [
        { type: 'pill', label: 'Start with the basics', value: 'Can you introduce the core concepts of this course?' },
        { type: 'pill', label: 'Test my current understanding', value: 'Ask me a guiding question to test what I know.' },
      ],
      difficultyBreakdown: {
        easyMissed: 0,
        mediumMissed: 0,
        hardMissed: 0,
        totalMissed: 0,
        totalQuestions: 0,
      },
      masteryScore: lowestMastery?.mastery_score ? Number(lowestMastery.mastery_score) : 0.5,
      activeInsight: null,
    };
  }

  /**
   * Helper to fetch conversation metadata and context
   */
  private async getConversationContext(conversationId: string, studentId: string, topicId?: string) {
    const { data: conv, error } = await supabaseAdmin
      .from('tutor_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (error || !conv) throw new NotFoundError('Conversation not found');
    if (conv.student_id !== studentId) throw new BadRequestError('Unauthorized conversation access');

    // 1. Fetch recent messages for history
    const { data: rawHistory } = await supabaseAdmin
      .from('tutor_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10);

    const history: TutorMessageHistory[] = (rawHistory || []).map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    // 2. Fetch topic title and student mastery if topic is provided
    let topicTitle = '';
    let studentMasteryLevel: number | undefined;

    if (topicId) {
      const { data: topic } = await supabaseAdmin
        .from('curriculum_topics')
        .select('title')
        .eq('id', topicId)
        .maybeSingle();

      if (topic) topicTitle = topic.title;

      const { data: mastery } = await supabaseAdmin
        .from('student_topic_mastery')
        .select('mastery_score')
        .eq('student_id', studentId)
        .eq('curriculum_topic_id', topicId)
        .maybeSingle();

      if (mastery) studentMasteryLevel = Number(mastery.mastery_score);
    }

    // 3. Question difficulty diagnosis & pedagogical mode
    let pedagogicalMode: PedagogicalMode | undefined;
    let difficultyBreakdown: DifficultyBreakdown | undefined;

    try {
      const rec = await this.getDiagnosticRecommendation(studentId, conv.teacher_subject_id);
      if (rec.hasRecommendation) {
        pedagogicalMode = rec.pedagogicalMode;
        difficultyBreakdown = rec.difficultyBreakdown;
        if (!topicTitle && rec.topicTitle) {
          topicTitle = rec.topicTitle;
        }
      }
    } catch {
      // Continue if diagnostic query encounters issues
    }

    return { conv, history, topicTitle, studentMasteryLevel, pedagogicalMode, difficultyBreakdown };
  }

  /**
   * Standard JSON turn in Socratic tutor dialogue (Method 2: Interactive Chat with Action Widgets)
   */
  async chatTurn(conversationId: string, studentId: string, input: SendMessageInput) {
    const { conv, history, topicTitle, studentMasteryLevel, pedagogicalMode, difficultyBreakdown } =
      await this.getConversationContext(conversationId, studentId, input.curriculumTopicId);

    // Save student message to tutor_messages
    await supabaseAdmin
      .from('tutor_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: input.message,
        curriculum_topic_id: input.curriculumTopicId || null,
      });

    // Vector retrieval of relevant notes
    let contextNotes = '';
    try {
      const searchRes = await materialsService.similaritySearch(conv.teacher_subject_id, {
        query: input.message,
        matchCount: 3,
        matchThreshold: 0.45,
      });
      contextNotes = searchRes.matches.map((m) => m.content).join('\n---\n');
    } catch {
      // Continue even if vector search yields no matches
    }

    // Check for an active diagnosed gap in teacher_insights
    const targetTopicId = input.curriculumTopicId || null;
    let activeInsight: any = null;
    if (targetTopicId) {
      const { data: ins } = await supabaseAdmin
        .from('teacher_insights')
        .select('*')
        .eq('student_id', studentId)
        .eq('curriculum_topic_id', targetTopicId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      activeInsight = ins;
    }

    // Generate Method 2 Interactive Socratic response from Tutor Agent
    const turnResult = await generateInteractiveSocraticTurn({
      studentMessage: input.message,
      history,
      contextNotes,
      topicTitle,
      studentMasteryLevel,
      pedagogicalMode,
      difficultyBreakdown,
      activeGapDescription: activeInsight ? activeInsight.description : undefined,
    });

    // Save assistant response
    const assistantContent =
      turnResult.message ||
      (turnResult as any).content ||
      'Let\'s break down this concept together. What do you think our first step should be?';

    const { data: assistantMsg, error: msgError } = await supabaseAdmin
      .from('tutor_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: assistantContent,
        curriculum_topic_id: input.curriculumTopicId || null,
      })
      .select('*')
      .single();

    if (msgError) throw new BadRequestError(msgError.message);

    // Deterministic Mastery Update if topic is active
    let updatedMasteryScore = studentMasteryLevel ?? 0;
    if (targetTopicId && turnResult.understandingScore > 0) {
      try {
        const masteryRecord = await masteryService.recordEvidence({
          studentId,
          teacherSubjectId: conv.teacher_subject_id,
          curriculumTopicId: targetTopicId,
          evidenceScore: turnResult.understandingScore,
          source: 'ai_tutor',
        });
        updatedMasteryScore = masteryRecord.masteryScore;
      } catch {
        // Continue if mastery recording fails
      }
    }

    // Update teacher_insights record with progress trace and resolution status
    if (activeInsight) {
      const currentEvidence = (activeInsight.evidence as Record<string, any>) || {};
      const progressTrace = Array.isArray(currentEvidence.progressTrace) ? currentEvidence.progressTrace : [];

      progressTrace.push({
        turn: progressTrace.length + 1,
        studentMessage: input.message,
        understandingScore: turnResult.understandingScore,
        teacherNote: turnResult.teacherNote,
        timestamp: new Date().toISOString(),
      });

      const newStatus = turnResult.isGapResolved ? 'resolved' : 'active';

      await supabaseAdmin
        .from('teacher_insights')
        .update({
          status: newStatus,
          evidence: {
            ...currentEvidence,
            actionWidgets: turnResult.actionWidgets,
            progressTrace,
            teacherAdvice: turnResult.teacherNote,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', activeInsight.id);
    }

    // Update conversation updated_at
    await supabaseAdmin
      .from('tutor_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return {
      ...assistantMsg,
      actionWidgets: turnResult.actionWidgets,
      understandingScore: turnResult.understandingScore,
      isResolved: turnResult.isGapResolved,
      currentMastery: updatedMasteryScore,
    };
  }

  /**
   * Real-time Server-Sent Events (SSE) streaming turn
   */
  async streamChatTurn(conversationId: string, studentId: string, input: SendMessageInput, res: Response) {
    const { conv, history, topicTitle, studentMasteryLevel, pedagogicalMode, difficultyBreakdown } =
      await this.getConversationContext(conversationId, studentId, input.curriculumTopicId);

    // Save student message
    await supabaseAdmin
      .from('tutor_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: input.message,
        curriculum_topic_id: input.curriculumTopicId || null,
      });

    // Vector retrieval
    let contextNotes = '';
    try {
      const searchRes = await materialsService.similaritySearch(conv.teacher_subject_id, {
        query: input.message,
        matchCount: 3,
        matchThreshold: 0.45,
      });
      contextNotes = searchRes.matches.map((m) => m.content).join('\n---\n');
    } catch {
      // Continue
    }

    // Set up SSE response headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let fullResponse = '';

    try {
      const generator = streamSocraticResponse({
        studentMessage: input.message,
        history,
        contextNotes,
        topicTitle,
        studentMasteryLevel,
        pedagogicalMode,
        difficultyBreakdown,
      });

      for await (const chunk of generator) {
        fullResponse += chunk;
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      // Save complete assistant message to tutor_messages
      const { data: savedMsg } = await supabaseAdmin
        .from('tutor_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: fullResponse,
          curriculum_topic_id: input.curriculumTopicId || null,
        })
        .select('id, created_at')
        .single();

      await supabaseAdmin
        .from('tutor_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      res.write(`data: ${JSON.stringify({ done: true, messageId: savedMsg?.id })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  }
}

export const tutorService = new TutorService();
