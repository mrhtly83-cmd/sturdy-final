import crypto from 'node:crypto';
import { getSupabaseAdmin } from '../../../_utils/supabaseServer';
import { PLANS, type PlanId } from '../../../_utils/plans';

export const runtime = 'nodejs';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const timingSafeEqual = (a: string, b: string) => {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
};

const verifyStripeSignature = (payload: string, sigHeader: string, secret: string) => {
  // Stripe-Signature: t=1492774577,v1=5257a869e7...,v0=...
  const parts = Object.fromEntries(
    sigHeader.split(',').map((kv) => {
      const [k, v] = kv.split('=');
      return [k?.trim(), v?.trim()];
    })
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;

  const signedPayload = `${t}.${payload}`;
  const expected = crypto.createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');
  return timingSafeEqual(expected, v1);
};

const planFromPaymentLink = (paymentLinkId: string | null): PlanId | null => {
  if (!paymentLinkId) return null;
  const weekly = process.env.STRIPE_WEEKLY_PAYMENT_LINK_ID;
  const monthly = process.env.STRIPE_MONTHLY_PAYMENT_LINK_ID;
  const lifetime = process.env.STRIPE_LIFETIME_PAYMENT_LINK_ID;
  if (weekly && paymentLinkId === weekly) return 'weekly';
  if (monthly && paymentLinkId === monthly) return 'monthly';
  if (lifetime && paymentLinkId === lifetime) return 'lifetime';
  return null;
};

const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return json({ error: 'Missing STRIPE_WEBHOOK_SECRET.' }, 501);

  const sig = req.headers.get('stripe-signature');
  if (!sig) return json({ error: 'Missing Stripe-Signature header.' }, 400);

  const payload = await req.text();
  if (!verifyStripeSignature(payload, sig, secret)) return json({ error: 'Invalid signature.' }, 400);

  let event: unknown;
  try {
    event = JSON.parse(payload);
  } catch {
    return json({ error: 'Invalid JSON.' }, 400);
  }

  // We only handle checkout.session.completed (Payment Links + Checkout).
  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v);

  if (!isRecord(event)) return json({ error: 'Invalid event.' }, 400);
  if (event.type !== 'checkout.session.completed') return json({ ok: true });

  const data = isRecord(event.data) ? event.data : null;
  const session = data && isRecord(data.object) ? data.object : null;

  const customerDetails = session && isRecord(session.customer_details) ? session.customer_details : null;
  const customerEmail =
    (customerDetails && typeof customerDetails.email === 'string' ? customerDetails.email : null) ??
    (session && typeof session.customer_email === 'string' ? session.customer_email : null);
  const paymentLinkId = session && typeof session.payment_link === 'string' ? session.payment_link : null;

  const planId = planFromPaymentLink(paymentLinkId);
  if (!planId) return json({ ok: true, ignored: true, reason: 'Unknown payment_link id.' });
  if (!customerEmail) return json({ error: 'Missing customer email in session.' }, 400);

  const admin = getSupabaseAdmin();
  if (!admin) return json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY.' }, 501);

  // Find user by email. User must sign in before purchase so the email matches.
  const { data: userList, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) return json({ error: listErr.message }, 500);

  const user = userList?.users?.find((u) => (u.email || '').toLowerCase() === customerEmail.toLowerCase());
  if (!user) return json({ error: 'No Supabase user found for that email.' }, 404);

  const now = new Date();
  const plan = PLANS[planId];
  const periodStart = now.toISOString();
  const periodEnd =
    plan.period === 'week'
      ? addDays(now, 7).toISOString()
      : plan.period === 'month'
        ? addDays(now, 30).toISOString()
        : null;

  const { error: upsertErr } = await admin.from('entitlements').upsert(
    {
      user_id: user.id,
      plan: planId,
      journal: plan.journal,
      period_start: periodStart,
      period_end: periodEnd,
      scripts_used: 0,
      updated_at: now.toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (upsertErr) return json({ error: upsertErr.message }, 500);
  return json({ ok: true });
}
