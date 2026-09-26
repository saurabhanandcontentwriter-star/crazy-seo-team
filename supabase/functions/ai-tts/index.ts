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
        instructions: instructions || "Speak as Sneha, a warm Indian female voice assistant. Use a natural Indian English/Hinglish accent, friendly conversational tone, smooth connected speech, natural pauses, and confident human-like delivery. Do not sound robotic, overly slow, or word-by-word.",
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
