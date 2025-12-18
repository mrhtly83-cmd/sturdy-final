import { getSupabaseAdmin } from '../../../_utils/supabaseServer';

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

export async function POST(req: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return json({ error: 'Server missing SUPABASE_SERVICE_ROLE_KEY.' }, 501);

  const token = getBearer(req);
  if (!token) return json({ error: 'Missing Authorization bearer token.' }, 401);

  const {
    data: { user },
    error,
  } = await admin.auth.getUser(token);
  if (error || !user) return json({ error: 'Invalid session.' }, 401);

  const { data: roleRow, error: roleErr } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleErr) return json({ error: roleErr.message }, 500);
  if ((roleRow?.role ?? 'user') !== 'admin') return json({ error: 'Forbidden.' }, 403);

  const { error: updateErr } = await admin
    .from('entitlements')
    .update({ scripts_used: 0, updated_at: new Date().toISOString() })
    .eq('user_id', user.id);

  if (updateErr) return json({ error: updateErr.message }, 500);
  return json({ ok: true });
}

