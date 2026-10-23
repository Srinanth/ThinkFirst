import { Request, Response, NextFunction } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { UnauthorizedError } from '../utils/errors.util.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  fullName?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      token?: string;
    }
  }
}

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new UnauthorizedError('Invalid or expired authentication session');
    }

    // Fetch user profile from public.profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new UnauthorizedError('User profile not found');
    }

    req.user = {
      id: profile.id,
      email: user.email || '',
      role: profile.role as 'admin' | 'teacher' | 'student',
      fullName: profile.full_name,
    };
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
};
