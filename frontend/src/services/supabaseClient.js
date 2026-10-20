import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iocbkxmnsedtqijbopth.supabase.co';
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
// Automatically sanitize and extract pure JWT token if URL prefix or markdown was copied
const jwtMatch = rawKey.match(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/);
const supabaseAnonKey = jwtMatch ? jwtMatch[0] : rawKey;

export const isSupabaseConfigured = Boolean(
  supabaseAnonKey &&
  supabaseAnonKey !== 'your_supabase_anon_key_here' &&
  supabaseAnonKey.startsWith('eyJ')
);

// Fallback dummy key to prevent client initialization crash if key is not yet set
const safeAnonKey = isSupabaseConfigured
  ? supabaseAnonKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_initialization';

export const supabase = createClient(supabaseUrl, safeAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
