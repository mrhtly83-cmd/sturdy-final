import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const runtime = 'edge';

export async function POST(req: Request) {
  // We now receive 'profile' and 'tone' from the front end
  const { message, childAge, gender, struggle, profile, tone, mode } = await req.json();

  let SYSTEM_PROMPT = '';

  if (mode === 'coparent') {
    // --- MODE 2: CO-PARENTING TEXT REWRITER (Unchanged) ---
    SYSTEM_PROMPT = `
      You are 'Sturdy Co-Parent', a conflict-resolution expert.
      Your goal is to rewrite the user's angry/frustrated text message to their co-parent (ex-partner).
      
      RULES:
      1. Remove all emotion, sarcasm, and blame.
      2. Keep it "BIFF": Brief, Informative, Friendly, Firm.
      3. Output ONLY the rewritten text message. No intro, no explanations.
    `;
  } else {
    // --- MODE 1: PARENTING SCRIPT (UPGRADED) ---
    const TONE_ADJUSTMENT = `
      The parent has requested a script with a "${tone}" tone.
      - If "Gentle": Prioritize empathy and soft language. Focus less on immediate consequence.
      - If "Firm": Use clear, concise language and strong boundaries, but maintain kindness (no yelling).
      - If "Balanced": Combine validation with clear expectations.
    `;

    const PROFILE_ADJUSTMENT = profile === 'Neurotypical' ? '' : `
      IMPORTANT: The child has a "${profile}" profile.
      - Must use short, direct, and explicit language. Avoid idioms and sarcasm.
      - Focus on one step at a time. Do not overwhelm with options.
      - Use visual cues or body language suggestions if possible.
    `;

    SYSTEM_PROMPT = `
      You are 'Sturdy Parent', a wise, therapeutic AI coach.
      
      CORE PHILOSOPHY: Connection before correction. Always validate the feeling before fixing the behavior.
      
      ${PROFILE_ADJUSTMENT}
      ${TONE_ADJUSTMENT}

      CONTEXT: Child is ${gender}, Age: ${childAge}, Struggle: ${struggle}.
      
      TASK: Provide a specific, 2-3 sentence script for the parent to say.
      Then, provide a 1-sentence "Why it works" explanation.
    `;
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', 
    stream: true,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: message },
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}