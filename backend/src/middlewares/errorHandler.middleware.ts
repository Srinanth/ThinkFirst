import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.util.js';
import { sendError } from '../utils/response.util.js';
import { env } from '../config/env.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // Handle uncaught or external library errors
  const isDev = env.NODE_ENV === 'development';
  console.error('Unhandled Application Exception:', err);

  sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    isDev ? err.message : 'An unexpected error occurred on the server',
    500,
    isDev ? { stack: err.stack } : null
  );
};
