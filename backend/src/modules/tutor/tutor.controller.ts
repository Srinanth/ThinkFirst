import { Request, Response, NextFunction } from 'express';
import { tutorService } from './tutor.service.js';
import { sendSuccess } from '../../utils/response.util.js';

export class TutorController {
  async createConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const conv = await tutorService.createConversation(req.user!.id, req.body);
      sendSuccess(res, conv, 201);
    } catch (err) {
      next(err);
    }
  }

  async getActiveSubjectConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const active = await tutorService.getOrCreateSubjectConversation(
        req.user!.id,
        req.params.subjectId as string
      );
      sendSuccess(res, active);
    } catch (err) {
      next(err);
    }
  }

  async listConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const list = await tutorService.listConversations(req.user!.id, req.params.subjectId as string);
      sendSuccess(res, list);
    } catch (err) {
      next(err);
    }
  }

  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const messages = await tutorService.getMessages(req.params.conversationId as string);
      sendSuccess(res, messages);
    } catch (err) {
      next(err);
    }
  }

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const wantsStream = req.body.stream === true || req.headers.accept === 'text/event-stream';

      if (wantsStream) {
        await tutorService.streamChatTurn(req.params.conversationId as string, req.user!.id, req.body, res);
      } else {
        const response = await tutorService.chatTurn(req.params.conversationId as string, req.user!.id, req.body);
        sendSuccess(res, response, 201);
      }
    } catch (err) {
      next(err);
    }
  }
}

export const tutorController = new TutorController();
