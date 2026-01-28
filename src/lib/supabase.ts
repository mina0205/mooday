import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rmkpzptjwptkqoeidhem.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_j-aAFik8xQp6K10cub63PA_YbdBvYC1';
console.log('🔥 SUPABASE_URL:', SUPABASE_URL);

export const supabase = createClient(
    SUPABASE_URL, 
    SUPABASE_ANON_KEY,
    {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);
