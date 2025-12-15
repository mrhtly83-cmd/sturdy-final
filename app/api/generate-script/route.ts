import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const { message, childAge, gender, struggle, profile, tone, mode } = await req.json();

  let SYSTEM_PROMPT = '';
  let USER_MESSAGE = '';

  if (mode === 'coparent') {
    // --- MODE 2: CO-PARENTING TEXT REWRITER (Unchanged) ---
    SYSTEM_PROMPT = `
      You are 'Sturdy Co-Parent', a conflict-resolution expert.
      Your goal is to rewrite the user's angry/frustrated text message to their co-parent (ex-partner).
      RULES: Remove all emotion, sarcasm, and blame. Keep it "BIFF": Brief, Informative, Friendly, Firm.
      Output ONLY the rewritten text message. No intro, no explanations.
    `;
    USER_MESSAGE = message;
    
  } else {
    // --- MODE 1: PARENTING SCRIPT (UPGRADED for Smarter Answers and Tone) ---
    
    // 1. TONE ADJUSTMENT RULES
    const TONE_ADJUSTMENT = `
      The parent has requested a script with a "${tone}" tone.
      - If "Gentle": Prioritize empathy. Use phrases like "I see," "I wonder," and "Let's explore." Focus on connection.
      - If "Firm": Use directives and clear expectations. Use phrases like "I expect," "The rule is," and "We must." Focus on boundaries.
    `;

    // 2. PROFILE ADJUSTMENT RULES
    const PROFILE_ADJUSTMENT = profile === 'Neurotypical' ? '' : `
      IMPORTANT: The child has a "${profile}" profile.
      - Scripts must be short, direct, and explicit. Avoid abstract language.
      - Always offer sensory or movement alternatives if the struggle is about big emotions.
    `;
    
    // 3. NEW AI OUTPUT STRUCTURE (TO BE PARSED ON FRONT END)
    SYSTEM_PROMPT = `
      You are 'Sturdy Parent', a therapeutic AI coach. Your goal is to provide comprehensive, actionable advice.

      CORE PHILOSOPHY: Connection before correction. Always validate the feeling before fixing the behavior.
      
      ${PROFILE_ADJUSTMENT}
      ${TONE_ADJUSTMENT}

      CONTEXT: Child is ${gender}, Age: ${childAge}, Struggle: ${struggle}.
      
      Your response MUST be formatted strictly with the following three sections, separated by triple hashtags (###).
      
      SECTION 1: SCRIPT (The exact words to say, 2-3 sentences, using the requested tone.)
      ###
      SECTION 2: SUMMARY (A 1-sentence title or summary of the *strategy* used, e.g., "The Connection First Strategy")
      ###
      SECTION 3: WHY IT WORKS (A bulleted list of 2-3 short, actionable tips explaining the psychology and technique.)
    `;

    USER_MESSAGE = `Situation: ${message}. Generate the full structured response.`;
  }

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
}