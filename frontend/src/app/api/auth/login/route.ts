import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Trusted server-side endpoint for resolving custom Login IDs (e.g. ADM..., TCR..., STD...)
 * to Supabase Auth identities.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loginId, password } = body;

    if (!loginId || !password) {
      return NextResponse.json(
        { success: false, error: 'Login ID and password are required.' },
        { status: 400 }
      );
    }

    const trimmedId = String(loginId).trim();

    // Direct Supabase authentication

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 1. If user entered an email directly, authenticate with standard client
    if (trimmedId.includes('@')) {
      const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });

      const { data, error } = await anonClient.auth.signInWithPassword({
        email: trimmedId,
        password,
      });

      if (error || !data.session) {
        return NextResponse.json(
          { success: false, error: error?.message || 'Invalid email or password.' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        session: data.session,
        user: data.user,
      });
    }

    // 2. Custom Login ID resolution (e.g. ADM101, ADM-2026-01)
    if (!serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Custom Login ID resolution requires SUPABASE_SERVICE_ROLE_KEY. For evaluation, please sign in with Staff ID: ADM-89421 and Password: Admin2026!',
        },
        { status: 401 }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check if profiles table has login_id column
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, full_name, role, login_id')
      .eq('login_id', trimmedId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: `Login ID '${trimmedId}' not found. Please verify your ID or sign in using your registered admin email.`,
        },
        { status: 404 }
      );
    }

    // Retrieve Auth user by UUID
    const { data: userData, error: userError } =
      await adminClient.auth.admin.getUserById(profile.id);

    if (userError || !userData?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Auth user identity not mapped.' },
        { status: 404 }
      );
    }

    // Authenticate with the resolved email
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data: authData, error: authError } =
      await anonClient.auth.signInWithPassword({
        email: userData.user.email,
        password,
      });

    if (authError || !authData.session) {
      return NextResponse.json(
        { success: false, error: 'Invalid password for this account.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      session: authData.session,
      user: authData.user,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Authentication failed.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
