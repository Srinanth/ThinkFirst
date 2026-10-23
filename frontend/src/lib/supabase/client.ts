import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for use in browser Client Components.
 * Uses only publishable/anon credentials.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase public environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
