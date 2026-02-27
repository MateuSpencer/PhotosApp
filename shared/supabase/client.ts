/**
 * Shared Supabase client for the PhotosApp.
 * Works with both React (web/Next.js) and React Native (mobile).
 *
 * Usage:
 *   import { createSupabaseClient } from '../shared/supabase/client';
 *   const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Create a typed Supabase client.
 * The caller is responsible for providing the URL and anon key
 * (from environment variables or app config).
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
  options?: {
    auth?: {
      storage?: any;
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
  }
): TypedSupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      ...options?.auth,
    },
  });
}

export type { Database };
