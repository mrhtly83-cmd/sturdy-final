import { createClient } from '@supabase/supabase-js';

// Use environment variables for security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// This is the "Admin" client for backend tasks
export const getSupabaseAdmin = () => {
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};