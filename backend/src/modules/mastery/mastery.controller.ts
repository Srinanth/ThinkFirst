import { Request, Response, NextFunction } from 'express';
import { masteryService } from './mastery.service.js';
import { sendSuccess } from '../../utils/response.util.js';

export class MasteryController {
  async getMyMastery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subjectId = req.params.subjectId as string;
      const rawTopics = await masteryService.getStudentMastery(subjectId, req.user!.id);
      
      const topics = rawTopics.map((r: any) => {
        const score = Number(r.masteryScore);
        const tier: 'Mastered' | 'Developing' | 'Needs Intervention' =
          score >= 0.8 ? 'Mastered' : score >= 0.5 ? 'Developing' : 'Needs Intervention';
        return {
          topicId: r.topic?.id,
          title: r.topic?.title || 'Curriculum Topic',
          masteryScore: score,
          confidence: Number(r.confidence),
          evidenceCount: 1,
          tier,
        };
      });

      const overallMastery = topics.length > 0 
        ? Math.round(topics.reduce((sum: number, t: any) => sum + t.masteryScore, 0) / topics.length * 100)
        : 0;

      sendSuccess(res, {
        subjectId,
        overallMastery,
        topics,
      });
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

  async getClassAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const analytics = await masteryService.getClassAnalytics(req.params.subjectId as string);
      sendSuccess(res, analytics);
    } catch (err) {
      next(err);
    }
  }

  async getStudentProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = (req.query.studentId as string) || req.user!.id;
      const progress = await masteryService.getStudentProgress(req.params.subjectId as string, studentId);
      sendSuccess(res, progress);
    } catch (err) {
      next(err);
    }
  }
}

export const masteryController = new MasteryController();
