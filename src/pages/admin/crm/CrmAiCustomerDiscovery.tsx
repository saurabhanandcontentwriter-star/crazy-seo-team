import { useEffect, useState } from "react";
import { Bot, BrainCircuit, CheckCircle2, Clock3, Globe2, History, Lightbulb, Loader2, Search, Target, TrendingUp, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/crm/CrmUI";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Discovery = {
  personas: { name: string; description: string; pain_points: string[]; buying_triggers: string[] }[];
  search_intent: { intent: string; example_queries: string[]; why_it_matters: string }[];
  keywords: { keyword: string; intent: string; priority: "High" | "Medium" | "Low" }[];
  channels: { channel: string; reason: string; content_angle: string }[];
  growth_opportunities: { opportunity: string; action: string; expected_signal: string }[];
  summary: string;
};

type Run = { id: string; website: string; target_market: string; created_at: string; result: Discovery };

const initial = { website: "", offer: "", targetMarket: "", location: "", goal: "" };

function getMapConfig(location: string) {
  const value = location.trim().toLowerCase();
  const isDelhiNcr = /delhi|ncr|gurugram|gurgaon|noida|greater noida|ghaziabad|faridabad|sonipat|meerut|rohtak|rewari|palwal|jhajjar|baghpat|hapur|bulandshahr|alwar|bhiwadi/.test(value);
  const isIndia = /india|bharat/.test(value);

  if (isDelhiNcr) {
    return {
      label: "Delhi NCR market map",
      title: "Delhi NCR market map",
      src: "https://www.openstreetmap.org/export/embed.html?bbox=76.4%2C27.7%2C78.0%2C29.6&layer=mapnik",
    };
  }

  if (isIndia) {
    return {
      label: "India market map",
      title: "India market map",
      src: "https://www.openstreetmap.org/export/embed.html?bbox=68%2C6%2C98%2C36&layer=mapnik",
    };
  }

  return {
    label: "World market map",
    title: "World market map",
    src: "https://www.openstreetmap.org/export/embed.html?bbox=-180%2C-60%2C180%2C85&layer=mapnik",
  };
}

function buildFallbackDiscovery(input: typeof initial): Discovery {
  const offer = input.offer.trim() || "products and services";
  const market = input.targetMarket.trim() || "potential customers";
  const location = input.location.trim() || "the target market";
  const goal = input.goal.trim() || "qualified leads and demand";
  const clean = (value: string) => value.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const site = clean(input.website.trim()) || "the website";
  const phrases = [
    offer + " for " + market,
    "best " + offer + " in " + location,
    offer + " near me",
    market + " " + offer,
    offer + " services " + location,
    offer + " company " + location,
    offer + " pricing",
    offer + " agency",
    offer + " solutions",
    offer + " for startups",
  ];
  return {
    personas: [
      { name: market + " Decision Maker", description: "People responsible for choosing " + offer + " for their organisation.", pain_points: ["Finding a trustworthy " + offer + " provider", "Comparing options quickly", "Proving business value"], buying_triggers: ["Clear ROI", "Relevant case studies", "Fast response"] },
      { name: "Research-First Buyer", description: "Prospects researching " + offer + " before contacting a provider in " + location + ".", pain_points: ["Too many similar options", "Unclear pricing or scope", "Low confidence in vendors"], buying_triggers: ["Useful guides", "Transparent packages", "Reviews and proof"] },
      { name: "Growth-Focused Prospect", description: "Customers looking for " + offer + " to support the goal of " + goal + ".", pain_points: ["Limited time or internal resources", "Need measurable outcomes", "Unclear next steps"], buying_triggers: ["Actionable strategy", "Simple onboarding", "Measurable milestones"] },
    ],
    search_intent: [
      { intent: "Problem discovery", example_queries: ["how to improve " + offer, offer + " problems", "need " + offer], why_it_matters: "Captures prospects before they choose a provider." },
      { intent: "Commercial research", example_queries: ["best " + offer, offer + " companies", offer + " providers"], why_it_matters: "Reaches people actively comparing solutions." },
      { intent: "Local intent", example_queries: [offer + " in " + location, offer + " near me", offer + " " + location], why_it_matters: "Targets location-specific demand when geography influences purchase." },
      { intent: "Transactional", example_queries: ["hire " + offer, "buy " + offer, offer + " pricing"], why_it_matters: "Targets users closer to conversion." },
      { intent: "Trust and proof", example_queries: [offer + " reviews", offer + " case studies", offer + " results"], why_it_matters: "Addresses objections before the sales conversation." },
    ],
    keywords: phrases.map((keyword, i) => ({ keyword, intent: i < 3 ? "Commercial" : i < 6 ? "Local / Commercial" : "Transactional / Research", priority: i < 5 ? "High" : i < 8 ? "Medium" : "Low" })),
    channels: [
      { channel: "Google Search / SEO", reason: "Capture existing demand around " + offer + ".", content_angle: "Service pages, comparison pages and high-intent landing pages." },
      { channel: "LinkedIn", reason: "Reach decision makers interested in " + offer + ".", content_angle: "Proof-led posts, insights and case-study content." },
      { channel: "Short-form video", reason: "Explain the problem and demonstrate the solution quickly.", content_angle: "Before/after, FAQs and practical tips." },
      { channel: "Email / CRM", reason: "Nurture prospects who are not ready to buy immediately.", content_angle: "Educational sequences, proof and clear CTAs." },
      { channel: "Retargeting", reason: "Bring back visitors who researched but did not convert.", content_angle: "Objection handling, testimonials and offer reminders." },
    ],
    growth_opportunities: [
      { opportunity: "Build intent-led landing pages", action: "Create dedicated pages around the highest-value " + offer + " searches.", expected_signal: "More qualified organic visits and enquiries." },
      { opportunity: "Strengthen conversion proof", action: "Add case studies, outcomes, testimonials and clear trust signals.", expected_signal: "Higher lead-to-contact rate." },
      { opportunity: "Create a comparison content cluster", action: "Publish pages answering which " + offer + " option fits different customer situations.", expected_signal: "More commercial-intent traffic." },
      { opportunity: "Add lead capture by intent", action: "Use tailored CTAs and forms for research, commercial and transactional visitors.", expected_signal: "Better lead quality and conversion rate." },
      { opportunity: "Retarget engaged visitors", action: "Create audiences from high-intent pages and serve proof-led follow-up campaigns.", expected_signal: "More returning visitors and assisted conversions." },
    ],
    summary: "For " + site + ", the clearest opportunity is to align " + offer + " messaging with the needs of " + market + " in " + location + ". Build intent-led pages, support them with proof and nurture visitors toward " + goal + ". This strategic baseline is generated from the supplied inputs; validate demand with Search Console, keyword tools and CRM conversion data.",
  };
}

export default function CrmAiCustomerDiscovery() {
  const [form, setForm] = useState(initial);
  const [result, setResult] = useState<Discovery | null>(null);
  const [used, setUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Run[]>([]);
  const mapConfig = getMapConfig(form.location);

  const load = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const client = supabase as any;
    const [usage, runs] = await Promise.all([
      client.from("ai_customer_discovery_usage").select("usage_count").eq("user_id", user.user.id).maybeSingle(),
      client.from("ai_customer_discovery_runs").select("id,website,target_market,created_at,result").eq("user_id", user.user.id).order("created_at", { ascending: false }).limit(10),
    ]);
    if (!usage.error) setUsed(Number(usage.data?.usage_count ?? 0));
    if (!runs.error) setHistory((runs.data ?? []) as Run[]);
  };

  useEffect(() => { void load(); }, []);

  const generate = async () => {
    if (!form.website.trim() || !form.offer.trim() || !form.targetMarket.trim()) {
      toast({ title: "Complete the required fields", description: "Website, offer and target market are required.", variant: "destructive" });
      return;
    }
    if (used >= 3) {
      toast({ title: "Three free runs used", description: "Your admin account has used all three Customer Discovery runs.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const localOutcome = buildFallbackDiscovery(form);
    setResult(localOutcome);

    try {
      const { data, error } = await supabase.functions.invoke("ai-customer-discovery", {
        body: {
          website: form.website.trim(),
          offer: form.offer.trim(),
          target_market: form.targetMarket.trim(),
          location: form.location.trim(),
          goal: form.goal.trim(),
        },
      });

      if (error || data?.error || !data?.result) {
        toast({ title: "Customer map generated", description: "Your discovery outcome is ready. The AI service was unavailable, so the local strategy engine was used and no AI credit was counted." });
        return;
      }

      setResult(data.result as Discovery);
      setUsed(Number(data.used ?? used + 1));
      await load();
      toast({ title: "Customer map generated", description: Math.max(0, 3 - Number(data.used ?? used + 1)) + " free run(s) remaining." });
    } catch {
      toast({ title: "Customer map generated", description: "Your discovery outcome is ready. The AI service could not be reached, so the local strategy engine was used and no AI credit was counted." });
    } finally {
      setLoading(false);
    }
  };

  const openRun = (run: Run) => {
    setResult(run.result);
    setForm(v => ({ ...v, website: run.website, targetMarket: run.target_market }));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-primary/15 bg-gradient-to-r from-primary/10 via-violet-500/10 to-cyan-500/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary"><BrainCircuit size={20}/><span className="text-xs font-black uppercase tracking-[0.16em]">Admin AI Tool</span></div>
            <h1 className="mt-2 text-2xl md:text-3xl font-black">AI Customer Discovery</h1>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">Turn a website, offer and target market into personas, search intent, keyword ideas, channels and growth opportunities.</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/80 px-4 py-3 text-center min-w-[150px]">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Free admin runs</p>
            <p className="mt-1 text-2xl font-black">{Math.max(0, 3 - used)} <span className="text-sm font-semibold text-muted-foreground">/ 3 left</span></p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4"><Target size={18} className="text-primary"/><h2 className="font-black">Customer inputs</h2></div>
          <div className="space-y-4">
            <label className="block text-sm font-semibold">Website URL <span className="text-destructive">*</span><Input value={form.website} onChange={e=>setForm({...form,website:e.target.value})} placeholder="https://example.com" className="mt-1.5 rounded-xl"/></label>
            <label className="block text-sm font-semibold">Offer / services <span className="text-destructive">*</span><Textarea value={form.offer} onChange={e=>setForm({...form,offer:e.target.value})} placeholder="What do you sell and why should customers choose it?" className="mt-1.5 min-h-24 rounded-xl"/></label>
            <label className="block text-sm font-semibold">Target market <span className="text-destructive">*</span><Textarea value={form.targetMarket} onChange={e=>setForm({...form,targetMarket:e.target.value})} placeholder="Who are you trying to reach?" className="mt-1.5 min-h-20 rounded-xl"/></label>
            <label className="block text-sm font-semibold">Location <span className="text-xs font-normal text-muted-foreground">(optional)</span><Input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="India, Delhi NCR, global..." className="mt-1.5 rounded-xl"/></label>
            <label className="block text-sm font-semibold">Growth goal <span className="text-xs font-normal text-muted-foreground">(optional)</span><Input value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})} placeholder="Leads, sales, awareness, local discovery..." className="mt-1.5 rounded-xl"/></label>
            <Button onClick={generate} disabled={loading || used >= 3} className="w-full rounded-xl h-11 gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin"/>Generating...</> : <><Bot size={16}/>Generate Customer Map</>}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">Admin-only · 3 AI generations per account</p>
          </div>
        </GlassCard>

        <div className="space-y-5">
          <GlassCard className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 p-4 border-b"><div><p className="font-black">World market map</p><p className="text-xs text-muted-foreground">Global market view for Customer Discovery.</p></div><Globe2 size={20} className="text-primary"/></div>
            <iframe title="World market map" src="https://www.openstreetmap.org/export/embed.html?bbox=-180%2C-60%2C180%2C85&layer=mapnik" className="w-full h-[360px] border-0" loading="eager" />
          </GlassCard>
          {!result ? (
            <GlassCard className="p-8 min-h-[300px] flex items-center justify-center text-center">
              <div className="max-w-md"><Globe2 size={42} className="mx-auto text-primary/50"/><h2 className="mt-4 text-xl font-black">Your customer map will appear here</h2><p className="mt-2 text-sm text-muted-foreground">Enter the customer details and generate a practical discovery report. Results are saved inside the admin CRM only.</p></div>
            </GlassCard>
          ) : (
            <>
              <GlassCard className="overflow-hidden">
                <div className="flex items-center justify-between gap-3 p-4 border-b"><div><p className="font-black">World market map</p><p className="text-xs text-muted-foreground">Global context for the generated customer discovery.</p></div><Globe2 size={20} className="text-primary"/></div>
                <iframe title="World market map" src="https://www.openstreetmap.org/export/embed.html?bbox=-180%2C-60%2C180%2C85&layer=mapnik" className="w-full h-[360px] border-0" loading="lazy" />
              </GlassCard>
              <GlassCard className="p-5">
                <div className="flex items-center gap-2"><Users2 size={18} className="text-primary"/><h2 className="font-black">Customer Personas</h2></div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">{result.personas?.map((p,i)=><div key={i} className="rounded-2xl border border-border p-4"><p className="font-black">{p.name}</p><p className="mt-2 text-sm text-muted-foreground">{p.description}</p><p className="mt-3 text-xs font-bold">Pain points</p><ul className="mt-1 list-disc pl-4 text-xs text-muted-foreground">{(p.pain_points||[]).slice(0,4).map((x,j)=><li key={j}>{x}</li>)}</ul></div>)}</div>
              </GlassCard>
              <div className="grid gap-5 lg:grid-cols-2">
                <GlassCard className="p-5"><div className="flex items-center gap-2"><Search size={18} className="text-primary"/><h2 className="font-black">Search Intent</h2></div><div className="mt-4 space-y-3">{result.search_intent?.map((x,i)=><div key={i} className="rounded-xl border border-border p-3"><p className="font-bold text-sm">{x.intent}</p><p className="mt-1 text-xs text-muted-foreground">{x.why_it_matters}</p><div className="mt-2 flex flex-wrap gap-1.5">{(x.example_queries||[]).slice(0,3).map((q,j)=><span key={j} className="rounded-full bg-muted px-2 py-1 text-[11px]">{q}</span>)}</div></div>)}</div></GlassCard>
                <GlassCard className="p-5"><div className="flex items-center gap-2"><TrendingUp size={18} className="text-primary"/><h2 className="font-black">Top Search Keywords</h2></div><div className="mt-4 space-y-2">{result.keywords?.map((k,i)=><div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5"><div><p className="text-sm font-bold">{k.keyword}</p><p className="text-[11px] text-muted-foreground">{k.intent}</p></div><span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold">{k.priority}</span></div>)}</div></GlassCard>
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <GlassCard className="p-5"><div className="flex items-center gap-2"><Lightbulb size={18} className="text-primary"/><h2 className="font-black">Growth Opportunities</h2></div><div className="mt-4 space-y-3">{result.growth_opportunities?.map((x,i)=><div key={i} className="rounded-xl border border-border p-3"><p className="font-bold text-sm">{x.opportunity}</p><p className="mt-1 text-xs text-muted-foreground">{x.action}</p><p className="mt-2 text-[11px]">Signal: {x.expected_signal}</p></div>)}</div></GlassCard>
                <GlassCard className="p-5"><div className="flex items-center gap-2"><Bot size={18} className="text-primary"/><h2 className="font-black">Recommended Channels</h2></div><div className="mt-4 space-y-3">{result.channels?.map((x,i)=><div key={i} className="rounded-xl border border-border p-3"><p className="font-bold text-sm">{x.channel}</p><p className="mt-1 text-xs text-muted-foreground">{x.reason}</p><p className="mt-2 text-[11px]">Angle: {x.content_angle}</p></div>)}</div></GlassCard>
              </div>
              <GlassCard className="p-5"><div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-600"/><h2 className="font-black">AI Summary</h2></div><p className="mt-3 text-sm leading-7 text-muted-foreground">{result.summary}</p></GlassCard>
            </>
          )}
        </div>
      </div>

      <GlassCard className="p-5">
        <div className="flex items-center gap-2"><History size={18} className="text-primary"/><h2 className="font-black">Recent discovery runs</h2></div>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {history.length ? history.map(run => <button type="button" key={run.id} onClick={()=>openRun(run)} className="text-left rounded-2xl border border-border p-4 hover:bg-muted/50 transition"><p className="font-bold truncate">{run.website}</p><p className="mt-1 text-xs text-muted-foreground truncate">{run.target_market}</p><p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground"><Clock3 size={11}/>{new Date(run.created_at).toLocaleString()}</p></button>) : <p className="text-sm text-muted-foreground">No discovery runs yet.</p>}
        </div>
      </GlassCard>
    </div>
  );
}
