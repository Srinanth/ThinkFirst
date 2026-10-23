import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env whether running from project root, backend/ directory, or a monorepo workspace
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  SUPABASE_ANON_KEY: z.string().default('placeholder-anon-key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default('placeholder-service-key'),
  GEMINI_API_KEY: z.string().default('placeholder-gemini-key'),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash'),
  GEMINI_EMBEDDING_MODEL: z.string().default('gemini-embedding-001'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
