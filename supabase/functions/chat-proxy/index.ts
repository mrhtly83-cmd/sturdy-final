import { serve } from "https://deno.land/std/http/server.ts";
import { OpenAI } from "https://deno.land/x/openai/mod.ts";

// Initialize OpenAI Client
const openai = new OpenAI(Deno.env.get("OPENAI_API_KEY")!); // Use your OpenAI API key

serve(async (req) => {
  // Set CORS headers
  const headers = new Headers({
  "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  });

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
      return new Response(null, {
          status: 204,
          headers,
      });
  }

  try {
    const body = await req.json();
    const { userMessage } = body;

    // Call to OpenAI API with the system message
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are the Sturdy Parents AI. Provide concise, expert parenting advice." },
        { role: "user", content: userMessage }
      ]
    });

    return new Response(JSON.stringify({ reply: response.choices[0].message.content }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process the request." }), {
      status: 500,
      headers,
    });
  }
});

