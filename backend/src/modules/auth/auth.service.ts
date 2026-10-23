import { supabaseAdmin } from '../../config/supabase.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.util.js';

export interface UpdateProfileInput {
  fullName?: string;
  college?: string;
}

export interface CreateUserInput {
  email: string;
  password?: string;
  fullName: string;
  role: 'teacher' | 'student';
  college?: string;
  loginId?: string;
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

  /**
   * System-wide counts and telemetry for Institutional Admin
   */
  async getStats() {
    const [studentsRes, teachersRes, subjectsRes, quizzesRes, materialsRes] =
      await Promise.all([
        supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'student'),
        supabaseAdmin
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'teacher'),
        supabaseAdmin
          .from('teacher_subjects')
          .select('*', { count: 'exact', head: true }),
        supabaseAdmin
          .from('quizzes')
          .select('*', { count: 'exact', head: true }),
        supabaseAdmin
          .from('learning_materials')
          .select('*', { count: 'exact', head: true }),
      ]);

    return {
      totalStudents: studentsRes.count || 0,
      totalTeachers: teachersRes.count || 0,
      totalSubjects: subjectsRes.count || 0,
      totalQuizzes: quizzesRes.count || 0,
      totalMaterials: materialsRes.count || 0,
    };
  }

  /**
   * List profiles filtered by optional role
   */
  async listProfiles(role?: string) {
    let query = supabaseAdmin
      .from('profiles')
      .select('id, full_name, college, role, created_at')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;
    if (error) throw new BadRequestError(error.message);
    return data;
  }

  /**
   * Admin-driven enrollment of faculty or student
   */
  async createUser(input: CreateUserInput) {
    if (!input.email || !input.fullName || !input.role) {
      throw new BadRequestError('Email, full name, and role are required.');
    }

    const defaultPassword =
      input.password ||
      `${input.role.charAt(0).toUpperCase() + input.role.slice(1)}@2026`;

    const { data: created, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email: input.email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          full_name: input.fullName,
          role: input.role,
          college: input.college || 'Faculty of Engineering',
          login_id: input.loginId,
        },
      });

    if (createError || !created.user) {
      throw new BadRequestError(
        `Failed to create user in auth: ${createError?.message}`
      );
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: created.user.id,
          full_name: input.fullName,
          role: input.role,
          college: input.college || 'Faculty of Engineering',
        },
        { onConflict: 'id' }
      )
      .select('id, full_name, college, role, created_at')
      .single();

    if (profileError) {
      throw new BadRequestError(
        `Failed to persist profile: ${profileError.message}`
      );
    }

    return {
      profile,
      email: input.email,
      temporaryPassword: defaultPassword,
      loginId: input.loginId,
    };
  }
}

export const authService = new AuthService();
