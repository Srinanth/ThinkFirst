import bcrypt from 'bcryptjs';
import { supabase, supabaseAdmin } from '../../config/supabase.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../utils/errors.util.js';

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
  /**
   * Server-side authentication with bcrypt password verification
   */
  async login(emailInput: string, passwordInput: string) {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required.');
    }

    // 1. Locate auth identity
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError || !usersData?.users) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const authUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === email
    );

    if (!authUser) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    // 2. Fetch corresponding profile
    const { data: profile, error: profError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, college, role, password')
      .eq('id', authUser.id)
      .single();

    if (profError || !profile) {
      throw new UnauthorizedError('User profile not found.');
    }

    // 3. Verify password via bcrypt against profiles.password
    let isValid = false;
    if (profile.password && profile.password !== 'NULL') {
      try {
        isValid = await bcrypt.compare(password, profile.password);
      } catch {
        isValid = false;
      }
    }

    // 4. Fallback verification via Supabase Auth
    if (!isValid) {
      const { data: signData, error: signError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!signError && signData?.user) {
        isValid = true;
      }
    }

    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    // 5. Ensure bcrypt hash in profiles and Supabase password are synchronized
    const hashedPassword = await bcrypt.hash(password, 10);
    await supabaseAdmin
      .from('profiles')
      .update({ password: hashedPassword })
      .eq('id', authUser.id);

    try {
      await supabaseAdmin.auth.admin.updateUserById(authUser.id, { password });
    } catch {
      // Ignore if already matching
    }

    // 6. Obtain fresh JWT session token
    let session: { access_token: string; refresh_token: string } | null = null;
    try {
      const { data: signData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signData?.session) {
        session = {
          access_token: signData.session.access_token,
          refresh_token: signData.session.refresh_token,
        };
      }
    } catch {
      // In case session creation fails
    }

    return {
      user: {
        id: authUser.id,
        email: authUser.email,
        role: profile.role,
        full_name: profile.full_name,
        college: profile.college,
      },
      session,
    };
  }

  async getProfile(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, college, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundError('User profile not found');
    }

    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
      const loginId =
        (userData?.user?.user_metadata as Record<string, any> | undefined)?.login_id ||
        (data.role === 'student'
          ? `STD-${data.id.slice(0, 4).toUpperCase()}`
          : data.role === 'teacher'
          ? `TCR-${data.id.slice(0, 4).toUpperCase()}`
          : `ADM-${data.id.slice(0, 4).toUpperCase()}`);

      return {
        ...data,
        email: userData?.user?.email,
        login_id: loginId,
      };
    } catch {
      return data;
    }
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
   * List profiles filtered by optional role, enriched with student roll numbers / login IDs
   */
  async listProfiles(role?: string) {
    let query = supabaseAdmin
      .from('profiles')
      .select('id, full_name, college, role, created_at')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    const { data: profiles, error } = await query;
    if (error) throw new BadRequestError(error.message);

    try {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      if (usersData?.users) {
        const userMap = new Map(usersData.users.map((u) => [u.id, u]));
        return (profiles || []).map((p) => {
          const u = userMap.get(p.id);
          let loginId = (u?.user_metadata as Record<string, any> | undefined)?.login_id;

          if (!loginId || loginId.endsWith('-')) {
            if (p.role === 'admin') {
              loginId = 'ADM-89421';
            } else if (u?.email === 'teacher.demo@thinkfirst.edu') {
              loginId = 'TCR-1042';
            } else if (u?.email === 'student.demo@thinkfirst.edu') {
              loginId = 'STD-8821';
            } else if (loginId?.endsWith('-')) {
              const hash = (parseInt(p.id.replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
              loginId = `${loginId}${hash}`;
            } else {
              const hash = (parseInt(p.id.replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
              loginId = `${p.role === 'student' ? 'STD' : 'TCR'}-2026-${hash}`;
            }
          }

          return {
            ...p,
            email: u?.email || `${p.role}.${p.id.slice(0, 6)}@institution.edu`,
            login_id: loginId,
          };
        });
      }
    } catch {
      // Fallback
    }

    return (profiles || []).map((p) => {
      const hash = (parseInt(p.id.replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
      return {
        ...p,
        email: `${p.role}.${p.id.slice(0, 6)}@institution.edu`,
        login_id:
          p.role === 'admin'
            ? 'ADM-89421'
            : `${p.role === 'student' ? 'STD' : 'TCR'}-2026-${hash}`,
      };
    });
  }

  /**
   * Admin-driven enrollment of faculty or student
   */
  async createUser(input: CreateUserInput) {
    if (!input.email || !input.fullName || !input.role) {
      throw new BadRequestError('Email, full name, and role are required.');
    }

    let finalLoginId = input.loginId?.trim();
    if (!finalLoginId || finalLoginId.endsWith('-') || finalLoginId.length < 8) {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      finalLoginId = finalLoginId?.endsWith('-')
        ? `${finalLoginId}${randomDigits}`
        : `${input.role === 'student' ? 'STD' : 'TCR'}-2026-${randomDigits}`;
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
          login_id: finalLoginId,
        },
      });

    if (createError || !created.user) {
      throw new BadRequestError(
        `Failed to create user in auth: ${createError?.message}`
      );
    }

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: created.user.id,
          full_name: input.fullName,
          role: input.role,
          college: input.college || 'Faculty of Engineering',
          password: hashedPassword,
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
      profile: {
        ...profile,
        login_id: input.loginId,
      },
      email: input.email,
      temporaryPassword: defaultPassword,
      loginId: input.loginId,
    };
  }
}

export const authService = new AuthService();
