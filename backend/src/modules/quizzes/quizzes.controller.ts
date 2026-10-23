import { Request, Response, NextFunction } from 'express';
import { quizzesService } from './quizzes.service.js';
import { sendSuccess } from '../../utils/response.util.js';

export class QuizzesController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quiz = await quizzesService.createQuiz(req.params.subjectId as string, req.user!.id, req.body);
      sendSuccess(res, quiz, 201);
    } catch (err) {
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isStudent = req.user!.role === 'student';
      const studentId = isStudent ? req.user!.id : undefined;
      const quizzes = await quizzesService.listQuizzes(req.params.subjectId as string, studentId, isStudent);
      sendSuccess(res, quizzes);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isStudent = req.user!.role === 'student';
      const includeAnswers = req.user!.role === 'teacher' || req.user!.role === 'admin';
      const quiz = await quizzesService.getQuiz(req.params.quizId as string, includeAnswers, isStudent);
      sendSuccess(res, quiz);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quiz = await quizzesService.updateQuiz(req.params.quizId as string, { status: req.body.status });
      sendSuccess(res, quiz);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quiz = await quizzesService.updateQuiz(req.params.quizId as string, req.body);
      sendSuccess(res, quiz);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await quizzesService.deleteQuiz(req.params.quizId as string);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async addQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const question = await quizzesService.addQuestion(req.params.quizId as string, req.body);
      sendSuccess(res, question, 201);
    } catch (err) {
      next(err);
    }
  }

  async generateQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quiz = await quizzesService.generateQuizWithAgent(req.params.subjectId as string, req.user!.id, req.body);
      sendSuccess(res, quiz, 201);
    } catch (err) {
      next(err);
    }
  }

  async startAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const attempt = await quizzesService.startAttempt(req.params.quizId as string, req.user!.id);
      sendSuccess(res, attempt, 201);
    } catch (err) {
      next(err);
    }
  }

  async submitAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await quizzesService.submitAttempt(req.params.attemptId as string, req.user!.id, req.body);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getResults(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const results = await quizzesService.getAttemptResults(req.params.attemptId as string);
      sendSuccess(res, results);
    } catch (err) {
      next(err);
    }
  }
}

export const quizzesController = new QuizzesController();
