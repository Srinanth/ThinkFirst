import { Request, Response, NextFunction } from 'express';
import { curriculumService } from './curriculum.service.js';
import { sendSuccess } from '../../utils/response.util.js';

export class CurriculumController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const topic = await curriculumService.createTopic(req.params.subjectId as string, req.body);
      sendSuccess(res, topic, 201);
    } catch (err) {
      next(err);
    }
  }

  async getTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tree = await curriculumService.getCurriculumTree(req.params.subjectId as string);
      sendSuccess(res, tree);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await curriculumService.updateTopic(req.params.topicId as string, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await curriculumService.deleteTopic(req.params.topicId as string);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async generateFromSyllabus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await curriculumService.generateFromSyllabus(
        req.params.subjectId as string,
        req.body.syllabusText
      );
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }
}

export const curriculumController = new CurriculumController();
