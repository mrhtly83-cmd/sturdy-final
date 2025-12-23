import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';
import { getSupabaseAdmin } from '../../_utils/supabaseServer';
import { PLANS, type PlanId } from '../../_utils/plans';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const runtime = 'nodejs';

type Tone = 'Gentle' | 'Balanced' | 'Firm';

const MAX_MESSAGE_CHARS = 1600;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 12;

type RateState = { windowStart: number; count: number };
const rateLimitMap = new Map<string, RateState>();

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const asString = (v: unknown, fallback: string) =>
  typeof v === 'string' ? v : fallback;

const getClientIp = (req: Request) => {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || 'unknown';
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  );
};

const checkRateLimit = (ip: string) => {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { windowStart: now, count: 1 });
    return { ok: true, retryAfter: 0 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { 
      ok: false, 
      retryAfter: Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.windowStart)) / 1000) 
    };
  }

  record.count += 1;
  return { ok: true, retryAfter: 0 };
};

const jsonError = (message: string, status = 400, headers?: HeadersInit) => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
};

const getBearer = (req: Request) => {
  const header = req.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
};

const STRUGGLE_RULES: { [key: string]: string } = {
  'Big Emotions': 'Rule: Be the calm container. Focus on naming the feeling and staying present, not problem-solving.',
  'Aggression': 'Rule: Be firm on safety, soft on feelings. Stop the behavior immediately, then validate the underlying emotion.',
  'Resistance/Defiance': 'Rule: Offer limited, acceptable choices (e.g., "red shoes or blue shoes?"). Avoid turning it into a power struggle.',
  'Siblings': 'Rule: Never play the judge. Treat their common problem as a shared issue that requires collaborative repair.',
  'Screen Time': 'Rule: Use a transition warning. Validate the fun and the disappointment of ending it before setting the boundary.',
  'School & Anxiety': 'Rule: Accept the worry, do not dismiss it. Provide specific, predictable routine steps to build security.',
};

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return jsonError('Server misconfigured: missing OPENAI_API_KEY.', 500);
  }

  const ip = getClientIp(req);
  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    return jsonError('Too many requests. Please try again shortly.', 429, {
      'retry-after': String(limit.retryAfter),
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON body.', 400);
  }
  const safeBody = isRecord(body) ? body : {};

  const { 
    message = '', 
    childAge = 'Unknown', 
    gender = 'Neutral', 
    struggle = 'General', 
    profile = 'Neurotypical', 
    tone = 'Balanced', 
    mode = 'script',
    authToken = null,
  } = safeBody;

  const safeMessage = asString(message, '').trim();
  const safeMode = mode === 'coparent' ? 'coparent' : 'script';
  const safeTone = (['Gentle', 'Balanced', 'Firm'].includes(asString(tone, '')) ? tone : 'Balanced') as Tone;
  
  if (!safeMessage) return jsonError('Message/Situation is required.', 400);
  if (safeMessage.length > MAX_MESSAGE_CHARS) return jsonError('Message is too long.', 413);

  const token = getBearer(req) || (typeof authToken === 'string' ? authToken : null);
  const admin = getSupabaseAdmin();

  if (admin && token) {
    const { data: { user }, error: authErr } = await admin.auth.getUser(token);
    
    if (!authErr && user) {
      const { data: ent } = await admin
        .from('entitlements')
        .select('plan, scripts_used')
        .eq('user_id', user.id)
        .maybeSingle();

      if (ent) {
        const plan = PLANS[ent.plan as PlanId];
        if (plan && plan.scriptsIncluded !== 'unlimited') {
           if ((ent.scripts_used || 0) >= plan.scriptsIncluded) {
             return jsonError('Plan limit reached. Please upgrade.', 402);
           }
           admin.from('entitlements').update({ scripts_used: (ent.scripts_used || 0) + 1 }).eq('user_id', user.id).then();
        }
      }
    }
  }

  let systemPrompt = '';
  let userMessage = '';

  if (safeMode === 'coparent') {
    systemPrompt = `
      You are 'Sturdy Co-Parent', a conflict-resolution expert.
      Rewrite the user's text to be BIFF: Brief, Informative, Friendly, Firm.
      Remove sarcasm, blame, and emotion. Output ONLY the rewritten text.
    `;
    userMessage = safeMessage;
  } else {
    const struggleLogic = STRUGGLE_RULES[asString(struggle, 'General')] || 'Rule: Connection before correction.';
    const profileNote = profile !== 'Neurotypical' ? `Child is ${profile}. Keep language concrete and simple.` : '';
    
    systemPrompt = `
      You are 'Sturdy Parent', an empathetic parenting coach.
      CORE PHILOSOPHY: ${struggleLogic}
      TONE: ${safeTone}
      CONTEXT: Child is ${gender}, Age: ${childAge}, Struggle: ${struggle}. ${profileNote}
      
      Your response MUST use the following format with triple hashtags (###) separators:
      SECTION 1: SCRIPT (The exact words to say, 2-3 sentences max)
      ###
      SECTION 2: SUMMARY (1 sentence strategy title)
      ###
      SECTION 3: WHY IT WORKS (2-3 bullet points starting with *)
      ###
      SECTION 4: TROUBLESHOOTING (2 bullet points starting with * for "what if")
    `;
    userMessage = `Situation: ${safeMessage}. Generate the script.`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', 
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    // Fix: Cast response to 'any' to avoid strict TypeScript version mismatch between ai SDK and OpenAI
    const stream = OpenAIStream(response as any);
    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error('OpenAI Error:', error);
    return jsonError('Failed to generate script. Please try again.', 502);
  }
}
