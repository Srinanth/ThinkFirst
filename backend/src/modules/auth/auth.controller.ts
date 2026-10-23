import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { sendSuccess } from '../../utils/response.util.js';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await authService.getProfile(req.user!.id);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await authService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  async getProfileById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await authService.getProfile(req.params.id as string);
      sendSuccess(res, profile);
    } catch (err) {
      next(err);
    }
  }

  async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await authService.getStats();
      sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  }

  async listProfiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = req.query.role as string | undefined;
      const profiles = await authService.listProfiles(role);
      sendSuccess(res, profiles);
    } catch (err) {
      next(err);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.createUser(req.body);
      sendSuccess(res, result, 201);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
