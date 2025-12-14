import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const { message, childAge } = await req.json();

  // Ask OpenAI for a parenting script
  const response = await openai.chat.completions.create({
    model: 'gpt-4', 
    stream: true,
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content: `You are 'Sturdy Parent', an expert parenting coach grounded in Attachment Theory and Neuroscience.
        The child is ${childAge} years old.

        YOUR JOB IS TO DETECT THE USER'S INTENT:

        ---
        
        MODE A: PARENTING SCENARIO (Conflict, behavior issue, "What do I say?")
        If the user describes a specific situation, use this format:
        
        **💡 The Insight:**
        [1 sentence explaining the child's behavior developmentally.]

        **🗣️ The Script:**
        [Physical cue]
        "[The exact words to say]"

        ---

        MODE B: GENERAL QUESTION (Theory, definitions, advice, "Why do kids...?")
        If the user asks a general question, just answer it clearly and helpfully as an expert. 
        Do NOT use the "Insight/Script" format. Just talk to the parent.

        ---

        MODE C: OFF-TOPIC (Math, Coding, History)
        If the question is completely unrelated to parenting/children, answer it briefly, but add a polite reminder that your expertise is in parenting.
        `
      },
      {
        role: 'user',
        content: message
      }
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}