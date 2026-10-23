import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { sendSuccess } from './utils/response.util.js';

const app: Application = express();

// Security & Parsing Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
});
app.use('/api', limiter);

// Root Healthcheck Endpoint
app.get('/health', (_req: Request, res: Response) => {
  return sendSuccess(res, {
    status: 'healthy',
    service: 'thinkfirst-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API v1 placeholder base route
app.get('/api/v1', (_req: Request, res: Response) => {
  return sendSuccess(res, {
    message: 'Welcome to the ThinkFirst API v1',
    documentation: '/docs',
  });
});

// 404 Route Handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

// Global Centralized Error Boundary
app.use(errorHandler);

export default app;
