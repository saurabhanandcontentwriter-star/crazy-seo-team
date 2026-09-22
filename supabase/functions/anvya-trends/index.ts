import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

function clean(v: string) {
  return v.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

function extract(xml: string, tag: string) {
  const re = new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)</" + tag + ">", "i");
  const m = xml.match(re);
  return m ? clean(m[1]) : "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const response = await fetch("https://trends.google.com/trending/rss?geo=IN", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CrazySEOTrends/1.0)" },
    });
    if (!response.ok) throw new Error("Google Trends returned " + response.status);
    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, 12).map((m, index) => {
      const block = m[1];
      const title = extract(block, "title");
      const traffic = extract(block, "ht:approx_traffic");
      const pubDate = extract(block, "pubDate");
      const link = extract(block, "link");
      return { rank: index + 1, title, traffic, pubDate, link };
    }).filter(x => x.title);
    return new Response(JSON.stringify({ country: "IN", updatedAt: new Date().toISOString(), trends: items }), { headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unable to load trends.", trends: [] }), { status: 200, headers: cors });
  }
});