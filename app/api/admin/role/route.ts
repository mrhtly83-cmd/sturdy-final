import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const getBearer = (req: Request) => {
  const header = req.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
};

export async function GET(req: Request) {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return json({ error: 'Missing Supabase env vars.' }, 501);

  const token = getBearer(req);
  if (!token) return json({ error: 'Missing Authorization bearer token.' }, 401);

  const sb = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error,
  } = await sb.auth.getUser(token);
  if (error || !user) return json({ error: 'Invalid session.' }, 401);

  const { data: roleRow, error: roleErr } = await sb
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleErr) return json({ error: roleErr.message }, 500);

  return json({
    userId: user.id,
    email: user.email ?? null,
    role: roleRow?.role ?? 'user',
  });
}

