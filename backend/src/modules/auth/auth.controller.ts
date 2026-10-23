import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { sendSuccess } from '../../utils/response.util.js';

export class AuthController {
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
}

export const authController = new AuthController();
