import { supabase, supabaseAdmin } from '../src/config/supabase.js';

export interface TestAuthSession {
  userId: string;
  email: string;
  role: 'teacher' | 'student';
  fullName: string;
  accessToken: string;
}

export async function getOrCreateTestUser(
  email: string,
  role: 'teacher' | 'student',
  fullName: string
): Promise<TestAuthSession> {
  const password = 'TestSecurePassword2026!';

  // 1. Check if user already exists in auth.users
  const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Failed to list users: ${listError.message}`);
  }

  let user = usersList.users.find((u) => u.email === email);

  if (!user) {
    console.log(`Creating test user: ${email} (${role})...`);
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

    if (createError || !created.user) {
      throw new Error(`Failed to create test user ${email}: ${createError?.message}`);
    }
    user = created.user;
  }

  // 2. Ensure profile exists in public.profiles
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!existingProfile) {
    console.log(`Creating public.profiles entry for ${email}...`);
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: user.id,
      full_name: fullName,
      role: role,
      college: 'ThinkFirst Institute of AI & Cognitive Sciences',
    });

    if (profileError) {
      console.warn(`Warning inserting profile for ${email}:`, profileError.message);
    }
  }

  // 3. Sign in to obtain live JWT token
  const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !sessionData.session) {
    throw new Error(`Failed to sign in test user ${email}: ${signInError?.message}`);
  }

  return {
    userId: user.id,
    email,
    role,
    fullName,
    accessToken: sessionData.session.access_token,
  };
}
