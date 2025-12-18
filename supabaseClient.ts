import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'your-supabase-url'; // Replace with your Supabase URL
const supabaseAnonKey = 'your-supabase-anon-key'; // Replace with your Supabase Anon Key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
