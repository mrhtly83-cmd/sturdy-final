import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { createClient } from '@supabase/supabase-js';

// 1. Setup OpenAI (The Classic Way)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. Setup Database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const runtime = 'edge';

export async function POST(req: Request) {
  const { message, childAge } = await req.json();

  // 3. Ask OpenAI
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [
      {
        role: 'system',
        content: 'You are STURDY, an expert parenting coach. VALIDATE first. Provide a direct script in quotes. TONE: Firm but kind.'
      },
      {
        role: 'user',
        content: `Child Age: ${childAge}. Parent says: "${message}"`
      }
    ],
  });

  // 4. Turn it into a Stream
  const stream = OpenAIStream(response, {
    // 5. Save to Database when finished
    onCompletion: async (completion) => {
      try {
        await supabase.from('generated_scripts').insert({
          age_group: childAge,
          situation: message,
          script: completion
        });
        console.log("✅ Saved to Database!");
      } catch (error) {
        console.error("❌ Failed to save:", error);
      }
    },
  });

  // 6. Send it to the Frontend
  return new StreamingTextResponse(stream);
}