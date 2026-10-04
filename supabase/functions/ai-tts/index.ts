import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { text, voice = "shimmer", speed = 0.95, instructions } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) throw new Error("LOVABLE_API_KEY missing");

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text.slice(0, 4000),
        voice,
        speed,
        instructions: instructions || "Speak as Sneha, a youthful Indian woman around 25 years old. Use a warm, friendly, natural and confident young-adult female voice with a conversational Indian accent. Match the user’s supported language automatically, including Hindi, Hinglish, Bhojpuri, Maithili, Bengali, Marathi, Gujarati, Punjabi, Tamil, Telugu, Kannada, Malayalam, Odia, Assamese, Nepali, Sanskrit and English. Never speak Urdu and never use Urdu, Arabic, or Persian pronunciation. Keep the delivery smooth, expressive, natural, and human-like with short pauses; do not sound robotic, overly slow, childish, or word-by-word.",
        response_format: "mp3",
      }),
    });
    if (!upstream.ok) {
      const t = await upstream.text();
      return new Response(JSON.stringify({ error: `TTS failed: ${upstream.status} ${t}` }), { status: upstream.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(upstream.body, { headers: { ...corsHeaders, "Content-Type": "audio/mpeg" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
