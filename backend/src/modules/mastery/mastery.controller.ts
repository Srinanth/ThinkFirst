import { Request, Response, NextFunction } from 'express';
import { masteryService } from './mastery.service.js';
import { sendSuccess } from '../../utils/response.util.js';

export class MasteryController {
  async getMyMastery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mastery = await masteryService.getStudentMastery(req.params.subjectId as string, req.user!.id);
      sendSuccess(res, mastery);
    } catch (err) {
      next(err);
    }
  }

  async getStudentMastery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const mastery = await masteryService.getStudentMastery(
        req.params.subjectId as string,
        req.params.studentId as string
      );
      sendSuccess(res, mastery);
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = (req.params.studentId as string) || req.user!.id;
      const topicId = req.query.topicId as string | undefined;
      const history = await masteryService.getMasteryHistory(req.params.subjectId as string, studentId, topicId);
      sendSuccess(res, history);
    } catch (err) {
      next(err);
    }
  }

  async getClassOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = await masteryService.getClassMasteryOverview(req.params.subjectId as string);
      sendSuccess(res, overview);
    } catch (err) {
      next(err);
    }
  }
}

export const masteryController = new MasteryController();
