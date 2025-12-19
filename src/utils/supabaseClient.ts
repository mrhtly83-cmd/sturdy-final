import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (typeof window === 'undefined' && supabaseUrl)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient(supabaseUrl, supabaseAnonKey);
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = (typeof window === 'undefined' && supabaseUrl)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
    })
  : createClient(supabaseUrl, supabaseAnonKey);

