import { supabaseAdmin } from '../../config/supabase.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.util.js';

export interface UpdateProfileInput {
  fullName?: string;
  college?: string;
}

export class AuthService {
  async getProfile(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, college, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundError('User profile not found');
    }

    return data;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const updatePayload: Record<string, unknown> = {};
    if (input.fullName !== undefined) updatePayload.full_name = input.fullName;
    if (input.college !== undefined) updatePayload.college = input.college;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select('id, full_name, college, role, created_at')
      .single();

    if (error) throw new BadRequestError(error.message);
    return data;
  }
}

export const authService = new AuthService();
