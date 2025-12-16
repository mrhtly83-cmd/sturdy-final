import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const runtime = 'nodejs';

type Mode = 'script' | 'coparent';
type Tone = 'Gentle' | 'Balanced' | 'Firm';

const MAX_MESSAGE_CHARS = 1600;
const MAX_SITUATION_CHARS = 900;

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 12; // per IP per minute

type RateState = {
  windowStart: number;
  count: number;
};

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
    req.headers.get('x-vercel-forwarded-for') ||
    'unknown'
  );
};

const rateLimit = (key: string) => {
  const g = globalThis as unknown as { __sturdyRateLimit?: Map<string, RateState> };
  if (!g.__sturdyRateLimit) g.__sturdyRateLimit = new Map();
  const store = g.__sturdyRateLimit;

  const now = Date.now();
  const existing = store.get(key);
  if (!existing || now - existing.windowStart >= RATE_LIMIT_WINDOW_MS) {
    store.set(key, { windowStart: now, count: 1 });
    return { ok: true, retryAfterMs: 0, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - existing.windowStart);
    return { ok: false, retryAfterMs, remaining: 0 };
  }

  existing.count += 1;
  return { ok: true, retryAfterMs: 0, remaining: RATE_LIMIT_MAX - existing.count };
};

const jsonError = (message: string, status = 400, headers?: HeadersInit) => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
};

// --- STRUGGLE-SPECIFIC RULES ---
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
  const bucket = rateLimit(`generate-script:${ip}`);
  if (!bucket.ok) {
    const retrySeconds = Math.max(1, Math.ceil(bucket.retryAfterMs / 1000));
    return jsonError('Too many requests. Please try again shortly.', 429, {
      'retry-after': String(retrySeconds),
    });
  }

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return jsonError('Expected application/json body.', 415);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError('Invalid JSON body.', 400);
  }

  // Use destructured variables with default fallbacks to prevent undefined errors
  const safeBody = isRecord(body) ? body : {};

  const { 
    message = '', 
    childAge = 'Unknown', 
    gender = 'Neutral', 
    struggle = 'General', 
    profile = 'Neurotypical', 
    tone = 'Balanced', 
    mode = 'script' 
  } = safeBody;

  const safeMode: Mode = mode === 'coparent' ? 'coparent' : 'script';
  const safeTone: Tone = tone === 'Gentle' || tone === 'Firm' ? tone : 'Balanced';
  const safeMessage = asString(message, '').trim();
  const safeChildAge = asString(childAge, 'Unknown');
  const safeGender = asString(gender, 'Neutral');
  const safeStruggle = asString(struggle, 'General');
  const safeProfile = asString(profile, 'Neurotypical');

  if (!safeMessage) return jsonError('Message is required.', 400);
  if (safeMessage.length > MAX_MESSAGE_CHARS) return jsonError('Message is too long.', 413);

  let SYSTEM_PROMPT = '';
  let USER_MESSAGE = '';

  if (safeMode === 'coparent') {
    // --- MODE 2: CO-PARENTING TEXT REWRITER ---
    SYSTEM_PROMPT = `
      You are 'Sturdy Co-Parent', a conflict-resolution expert.
      Your goal is to rewrite the user's angry/frustrated text message to their co-parent (ex-partner).
      RULES: Remove all emotion, sarcasm, and blame. Keep it "BIFF": Brief, Informative, Friendly, Firm.
      Output ONLY the rewritten text message. No intro, no explanations.
    `;
    USER_MESSAGE = safeMessage;
    
  } else {
    // --- MODE 1: PARENTING SCRIPT (Hardened Logic) ---
    
    // 1. TONE ADJUSTMENT RULES
    const TONE_ADJUSTMENT = `
      The parent has requested a script with a "${safeTone}" tone.
      - If "Gentle": Prioritize empathy. Use phrases like "I see," "I wonder," and "Let's explore." Focus on connection.
      - If "Firm": Use directives and clear expectations. Use phrases like "I expect," "The rule is," and "We must." Focus on boundaries.
    `;

    // 2. PROFILE ADJUSTMENT RULES
    const PROFILE_ADJUSTMENT = profile === 'Neurotypical' ? '' : `
      IMPORTANT: The child has a "${safeProfile}" profile.
      - Scripts must be short, direct, and explicit. Avoid abstract language.
      - Always offer sensory or movement alternatives if the struggle is about big emotions.
    `;
    
    // 3. CORE STRUGGLE LOGIC
    const STRUGGLE_LOGIC = STRUGGLE_RULES[safeStruggle] || 'Rule: Connection before correction.';
    
    // 4. FINAL SYSTEM PROMPT (4 Sections Required for Front-End)
    SYSTEM_PROMPT = `
      You are 'Sturdy Parent', a therapeutic AI coach providing comprehensive, actionable advice.

      CORE PHILOSOPHY: Connection before correction. Always validate the feeling before fixing the behavior.
      
      ${STRUGGLE_LOGIC} 
      ${PROFILE_ADJUSTMENT}
      ${TONE_ADJUSTMENT}

      CONTEXT: Child is ${safeGender}, Age: ${safeChildAge}, Struggle: ${safeStruggle}.
      
      Your response MUST be formatted strictly with the following four sections, separated by triple hashtags (###) with a double line break before and after.
      
      SECTION 1: SCRIPT (The exact words to say, 2-3 sentences, using the requested tone.)
      
      ###
      
      SECTION 2: SUMMARY (A 1-sentence title or summary of the *strategy* used, e.g., "The Connection First Strategy")
      
      ###
      
      SECTION 3: WHY IT WORKS (A bulleted list of 2-3 short, actionable tips explaining the psychology and technique. Must use * for bullets.)
      
      ###
      
      SECTION 4: TROUBLESHOOTING (A bulleted list of 2 points that proactively answers common "what if" questions for this struggle, e.g., "What if they keep saying NO?". Must use * for bullets.)
    `;

    const situation = safeMessage.length > MAX_SITUATION_CHARS ? `${safeMessage.slice(0, MAX_SITUATION_CHARS)}…` : safeMessage;
    USER_MESSAGE = `Situation: ${situation}. Generate the full structured response.`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_MESSAGE },
      ],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : 'Unable to generate right now. Please try again.';
    return jsonError(message, 502);
  }
}
