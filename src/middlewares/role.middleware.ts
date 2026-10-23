import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.util.js';

export const requireRole = (allowedRoles: Array<'superadmin' | 'admin' | 'teacher' | 'student'>) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Superadmin has universal access across all role-gated routes
    if (req.user.role === 'superadmin' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return next(
      new ForbiddenError(
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'`
      )
    );
  };
};
