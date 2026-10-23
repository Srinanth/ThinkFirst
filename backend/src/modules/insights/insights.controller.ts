import { Request, Response, NextFunction } from 'express';
import { insightsService } from './insights.service.js';
import { sendSuccess } from '../../utils/response.util.js';

export class InsightsController {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const list = await insightsService.listInsights(req.params.subjectId as string, status);
      sendSuccess(res, list);
    } catch (err) {
      next(err);
    }
  }

  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await insightsService.generateInsights(req.params.subjectId as string);
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await insightsService.updateStatus(req.params.insightId as string, req.body.status);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await insightsService.deleteInsight(req.params.insightId as string);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const insightsController = new InsightsController();
