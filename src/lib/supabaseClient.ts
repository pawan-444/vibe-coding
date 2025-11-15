import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side operations
let supabaseAdmin: ReturnType<typeof createClient>;

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);
} else {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not set. Admin operations will fail.');
}

export { supabaseAdmin };
