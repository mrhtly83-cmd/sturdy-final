import { getSupabaseAdmin } from '../../_utils/supabaseServer';
import { PLANS, type PlanId } from '../../_utils/plans';

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
  const admin = getSupabaseAdmin();
  if (!admin) return json({ error: 'Server missing SUPABASE_SERVICE_ROLE_KEY.' }, 501);

  const token = getBearer(req);
  if (!token) return json({ error: 'Missing Authorization bearer token.' }, 401);

  const {
    data: { user },
    error,
  } = await admin.auth.getUser(token);
  if (error || !user) return json({ error: 'Invalid session.' }, 401);

  const { data, error: readErr } = await admin
    .from('entitlements')
    .select('plan, period_start, period_end, scripts_used, journal')
    .eq('user_id', user.id)
    .maybeSingle();

  if (readErr) return json({ error: readErr.message }, 500);

  const planId = (data?.plan as PlanId | undefined) ?? null;
  const plan = planId ? PLANS[planId] : null;

  return json({
    userId: user.id,
    plan: planId,
    entitlements: plan,
    usage: data
      ? {
          periodStart: data.period_start,
          periodEnd: data.period_end,
          scriptsUsed: data.scripts_used,
          journal: data.journal,
        }
      : null,
  });
}

