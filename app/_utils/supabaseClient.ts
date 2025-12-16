import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

const readMeta = (name: string) => {
  if (typeof document === 'undefined') return null;
  return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? null;
};

export const getSupabase = () => {
  if (client) return client;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? readMeta('sturdy:supabase-url') ?? undefined;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    readMeta('sturdy:supabase-anon-key') ??
    undefined;

  if (!url || !anonKey) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
  } catch {
    return null;
  }

  client = createClient(url, anonKey);
  return client;
};
