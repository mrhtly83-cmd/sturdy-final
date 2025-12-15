import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const runtime = 'edge';

// --- STRUGGLE-SPECIFIC RULES (Unchanged) ---
const STRUGGLE_RULES: { [key: string]: string } = {
  'Big Emotions': 'Rule: Be the calm container. Focus on naming the feeling and staying present, not problem-solving.',
  'Aggression': 'Rule: Be firm on safety, soft on feelings. Stop the behavior immediately, then validate the underlying emotion.',
  'Resistance/Defiance': 'Rule: Offer limited, acceptable choices (e.g., "red shoes or blue shoes?"). Avoid turning it into a power struggle.',
  'Siblings': 'Rule: Never play the judge. Treat their common problem as a shared issue that requires collaborative repair.',
  'Screen Time': 'Rule: Use a transition warning. Validate the fun and the disappointment of ending it before setting the boundary.',
  'School & Anxiety': 'Rule: Accept the worry, do not dismiss it. Provide specific, predictable routine steps to build security.',
};


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
    // --- MODE 1: PARENTING SCRIPT (UPGRADED with 4th Section) ---
    
    const TONE_ADJUSTMENT = `
      The parent has requested a script with a "${tone}" tone.
      - If "Gentle": Prioritize empathy. Use phrases like "I see," "I wonder," and "Let's explore." Focus on connection.
      - If "Firm": Use directives and clear expectations. Use phrases like "I expect," "The rule is," and "We must." Focus on boundaries.
    `;

    const PROFILE_ADJUSTMENT = profile === 'Neurotypical' ? '' : `
      IMPORTANT: The child has a "${profile}" profile.
      - Scripts must be short, direct, and explicit. Avoid abstract language.
      - Always offer sensory or movement alternatives if the struggle is about big emotions.
    `;
    
    const STRUGGLE_LOGIC = STRUGGLE_RULES[struggle] || 'Rule: Connection before correction.';
    
    SYSTEM_PROMPT = `
      You are 'Sturdy Parent', a therapeutic AI coach providing comprehensive, actionable advice.

      CORE PHILOSOPHY: Connection before correction. Always validate the feeling before fixing the behavior.
      
      ${STRUGGLE_LOGIC} 
      ${PROFILE_ADJUSTMENT}
      ${TONE_ADJUSTMENT}

      CONTEXT: Child is ${gender}, Age: ${childAge}, Struggle: ${struggle}.
      
      Your response MUST be formatted strictly with the following four sections, separated by triple hashtags (###).
      
      SECTION 1: SCRIPT (The exact words to say, 2-3 sentences, using the requested tone.)
      ###
      SECTION 2: SUMMARY (A 1-sentence title or summary of the * strategy* used, e.g., "The Connection First Strategy")
      ###
      SECTION 3: WHY IT WORKS (A bulleted list of 2-3 short, actionable tips explaining the psychology and technique.)
      ###
      SECTION 4: TROUBLESHOOTING (A bulleted list of 2 points that proactively answers common "what if" questions for this struggle, e.g., "What if they keep saying NO?")
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