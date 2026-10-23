import { Request, Response, NextFunction } from 'express';
import { subjectsService } from './subjects.service.js';
import { sendSuccess } from '../../utils/response.util.js';

export class SubjectsController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subject = await subjectsService.createSubject(req.user!.id, req.body);
      sendSuccess(res, subject, 201);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subjects = await subjectsService.getSubjectsForUser(req.user!.id, req.user!.role);
      sendSuccess(res, subjects);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subject = await subjectsService.getSubjectById(req.params.subjectId as string);
      sendSuccess(res, subject);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await subjectsService.updateSubject(req.params.subjectId as string, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await subjectsService.deleteSubject(req.params.subjectId as string);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async enroll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const membership = await subjectsService.enrollStudent(req.params.subjectId as string, req.body);
      sendSuccess(res, membership, 201);
    } catch (err) {
      next(err);
    }
  }

  async getRoster(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roster = await subjectsService.getRoster(req.params.subjectId as string);
      sendSuccess(res, roster);
    } catch (err) {
      next(err);
    }
  }

  async removeStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await subjectsService.removeStudentFromRoster(
        req.params.subjectId as string,
        req.params.studentId as string
      );
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const subjectsController = new SubjectsController();
