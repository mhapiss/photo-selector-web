import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // In dev, warn; supabase is optional for the core gallery flow.
  console.warn('[supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabaseUrl = url ?? '';
export const supabaseAnonKey = anonKey ?? '';

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
