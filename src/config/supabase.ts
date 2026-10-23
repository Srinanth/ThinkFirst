import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

// Standard Supabase client (using anon key)
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// Privileged Supabase Admin client (using service role key, bypasses RLS for system jobs)
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper to create an authenticated client per user JWT
export const createScopedSupabaseClient = (jwtToken: string) => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
  });
};
