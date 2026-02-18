import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client using the service-role key.
 * Only use this in Server Components, Server Actions, and Route Handlers.
 */
export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }
  return createClient(url, key);
}
