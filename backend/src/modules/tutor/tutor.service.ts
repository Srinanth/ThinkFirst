import { Response } from 'express';
import { supabaseAdmin } from '../../config/supabase.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.util.js';
import {
  generateSocraticResponse,
  streamSocraticResponse,
  TutorMessageHistory,
} from '../../agents/tutor.agent.js';
import { materialsService } from '../materials/materials.service.js';
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

    return { conv, history, topicTitle, studentMasteryLevel };
  }

  /**
   * Standard JSON turn in Socratic tutor dialogue
   */
  async chatTurn(conversationId: string, studentId: string, input: SendMessageInput) {
    const { conv, history, topicTitle, studentMasteryLevel } = await this.getConversationContext(
      conversationId,
      studentId,
      input.curriculumTopicId
    );

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

    // Generate Socratic response from Tutor Agent
    const assistantContent = await generateSocraticResponse({
      studentMessage: input.message,
      history,
      contextNotes,
      topicTitle,
      studentMasteryLevel,
    });

    // Save assistant response
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

    // Update conversation updated_at
    await supabaseAdmin
      .from('tutor_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return assistantMsg;
  }

  /**
   * Real-time Server-Sent Events (SSE) streaming turn
   */
  async streamChatTurn(conversationId: string, studentId: string, input: SendMessageInput, res: Response) {
    const { conv, history, topicTitle, studentMasteryLevel } = await this.getConversationContext(
      conversationId,
      studentId,
      input.curriculumTopicId
    );

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
