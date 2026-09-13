import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import DOMPurify from "dompurify";
import { Loader2, Newspaper, Pause, Play, Square, Volume2, Clock, User, Search, RefreshCw, Zap, Radio } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";

type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  source: string | null;
  image_url: string | null;
  image_alt: string | null;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  nlp_keywords: string[] | null;
  faqs: Array<{ q: string; a: string }> | null;
  reading_minutes: number | null;
  author: string | null;
  published_at: string;
};

const CATEGORIES = [
  "All",
  "SEO",
  "AI SEO",
  "Technical SEO",
  "Google Updates",
  "ChatGPT SEO",
  "AI Tools",
  "Digital Marketing",
  "AI Automation",
  "Machine Learning",
  "Generative AI",
  "Voice AI",
  "Business Intelligence",
];

const LANGS = [
  { code: "en-US", label: "English (US)" }, { code: "en-GB", label: "English (UK)" },
  { code: "hi-IN", label: "हिन्दी (Hindi)" }, { code: "bn-IN", label: "বাংলা (Bengali)" },
  { code: "ur-PK", label: "اردو (Urdu)" }, { code: "ta-IN", label: "தமிழ் (Tamil)" },
  { code: "te-IN", label: "తెలుగు (Telugu)" }, { code: "mr-IN", label: "मराठी (Marathi)" },
  { code: "gu-IN", label: "ગુજરાતી (Gujarati)" }, { code: "pa-IN", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "fr-FR", label: "Français" }, { code: "de-DE", label: "Deutsch" },
  { code: "es-ES", label: "Español" }, { code: "ar-SA", label: "العربية" },
  { code: "ja-JP", label: "日本語" }, { code: "ko-KR", label: "한국어" },
  { code: "zh-CN", label: "中文" }, { code: "ru-RU", label: "Русский" },
];

const REFRESH_MS = 60 * 60 * 1000;
const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const News = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("en-US");
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female");
  const [rate, setRate] = useState(1);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const load = async (manual = false) => {
    if (manual) setRefreshing(true);
    const { data, error } = await supabase
      .from("news_articles")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(20);
    if (!error && data) {
      setArticles(data as unknown as NewsArticle[]);
      setLastUpdated(new Date());
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
    const timer = window.setInterval(() => load(), REFRESH_MS);
    return () => {
      window.clearInterval(timer);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      const categoryMatch = category === "All" || a.category === category;
      const text = `${a.title} ${a.summary} ${a.category} ${a.source ?? ""} ${(a.nlp_keywords ?? []).join(" ")}`.toLowerCase();
      return categoryMatch && (!q || text.includes(q));
    });
  }, [articles, category, query]);

  const flashItems = useMemo(() => articles.slice(0, 8), [articles]);

  const pickVoice = (langCode: string): SpeechSynthesisVoice | undefined => {
    const matching = voices.filter((v) => v.lang?.toLowerCase().startsWith(langCode.toLowerCase().slice(0, 2)));
    if (!matching.length) return voices[0];
    const wantsFemale = voiceGender === "female";
    const byGender = matching.find((v) => {
      const n = v.name.toLowerCase();
      if (wantsFemale) return /female|woman|samantha|zira|google.*female|nat|aria|jenny|priya|raveena/.test(n);
      return /male|man|david|mark|google.*male|alex|fred|guy/.test(n);
    });
    return byGender ?? matching[0];
  };

  const speak = (a: NewsArticle) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (playingId === a.id && !paused) { window.speechSynthesis.pause(); setPaused(true); return; }
    if (playingId === a.id && paused) { window.speechSynthesis.resume(); setPaused(false); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`${a.title}. ${a.summary}. ${stripHtml(a.content)}`);
    u.lang = lang; u.rate = rate;
    const v = pickVoice(lang); if (v) u.voice = v;
    u.onend = () => { setPlayingId(null); setPaused(false); };
    u.onerror = () => { setPlayingId(null); setPaused(false); };
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setPlayingId(a.id); setPaused(false);
  };

  const stop = () => { window.speechSynthesis?.cancel(); setPlayingId(null); setPaused(false); };

  const newsListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: filtered.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: `https://crazyseoteam.in/news#${a.slug}`, name: a.title })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Latest SEO, AI & Google Search News | Crazy SEO Team</title>
        <meta name="description" content="Live SEO, AI Search, Google, ChatGPT, Gemini, AI agents and technology news from Crazy SEO Team. Updated automatically every hour." />
        <link rel="canonical" href="https://crazyseoteam.in/news" />
        <meta property="og:title" content="Latest SEO, AI & Google Search News — Crazy SEO Team" />
        <meta property="og:description" content="Breaking SEO, AI Search, Google and technology updates from Crazy SEO Team." />
        <meta property="og:url" content="https://crazyseoteam.in/news" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(newsListJsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20 container mx-auto px-4 max-w-6xl">
        <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/80 p-6 md:p-10 mb-7 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
          <div className="relative text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide mb-4">
              <Radio className="w-3.5 h-3.5 animate-pulse" /> LIVE NEWSROOM
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-foreground mb-3">Latest SEO, AI & Technology News</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">Google Search, AI Overviews, ChatGPT, Gemini, AI agents, technical SEO, automation and the latest digital technology — monitored in one newsroom.</p>
          </div>
        </section>

        {flashItems.length > 0 && (
          <section className="mb-7 rounded-2xl border border-primary/20 bg-card overflow-hidden shadow-lg">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1 text-xs font-black"><Zap className="w-3.5 h-3.5" /> LATEST FLASH</span>
              <span className="text-xs text-muted-foreground">Freshest stories first · auto-updates hourly</span>
            </div>
            <div className="divide-y divide-border">
              {flashItems.slice(0, 5).map((a) => (
                <button key={a.id} onClick={() => document.getElementById(a.slug)?.scrollIntoView({ behavior: "smooth", block: "start" })} className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <span className="text-sm font-semibold text-foreground">{a.title}</span>
                  <span className="ml-auto text-[10px] uppercase font-bold text-primary whitespace-nowrap">{a.category}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="rounded-2xl border border-border bg-card p-4 mb-6 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search SEO, AI, Google, ChatGPT, Gemini, technology..." className="w-full h-10 rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary" />
          </div>
          <div className="flex items-center gap-2 justify-end">
            {lastUpdated && <span className="text-[11px] text-muted-foreground hidden sm:inline">Updated {lastUpdated.toLocaleTimeString()}</span>}
            <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${category === c ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:border-primary/40"}`}>{c}</button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 mb-8 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div><label className="text-xs font-semibold text-muted-foreground mb-1 block">Language</label><Select value={lang} onValueChange={setLang}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="max-h-72">{LANGS.map((l) => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="text-xs font-semibold text-muted-foreground mb-1 block">Voice</label><Select value={voiceGender} onValueChange={(v: any) => setVoiceGender(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="female">Female</SelectItem><SelectItem value="male">Male</SelectItem></SelectContent></Select></div>
          <div><label className="text-xs font-semibold text-muted-foreground mb-1 block">Speed: {rate.toFixed(1)}x</label><Slider value={[rate]} min={0.6} max={1.6} step={0.1} onValueChange={(v) => setRate(v[0])} /></div>
          <div className="flex justify-end">{playingId && <Button variant="destructive" size="sm" onClick={stop}><Square className="w-4 h-4 mr-2" /> Stop</Button>}</div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No news matched your search or category.</div>
        ) : (
          <div className="space-y-6">
            {filtered.map((a) => {
              const isActive = playingId === a.id;
              return (
                <article key={a.id} id={a.slug} className="rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-xl">
                  {a.image_url && <img src={a.image_url} alt={a.image_alt || a.title} loading="lazy" className="w-full h-56 md:h-72 object-cover" />}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-muted-foreground">
                      <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-semibold">{a.category}</span>
                      {a.source && <span>{a.source}</span>}<span>·</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {a.reading_minutes ?? 4} min read</span><span>·</span>
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {a.author ?? "Newsroom"}</span><span>·</span>
                      <span>{new Date(a.published_at).toLocaleString()}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">{a.title}</h2>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{a.summary}</p>
                    {a.nlp_keywords && a.nlp_keywords.length > 0 && <div className="flex flex-wrap gap-1.5 mb-4">{a.nlp_keywords.slice(0, 10).map((k) => <span key={k} className="px-2 py-0.5 text-[10px] rounded bg-muted text-muted-foreground">#{k}</span>)}</div>}
                    <details className="text-sm text-foreground/80 mb-4 group"><summary className="cursor-pointer text-primary font-medium select-none">Read full story</summary>
                      <div className="mt-4 prose prose-sm dark:prose-invert max-w-none [&_h2]:text-foreground [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-2 [&_p]:my-3 [&_ul]:my-3 [&_li]:my-1" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(a.content) }} />
                      {a.faqs && a.faqs.length > 0 && <div className="mt-6 border-t border-border pt-4"><h3 className="font-bold text-foreground mb-3">FAQs</h3><div className="space-y-3">{a.faqs.map((f, i) => <div key={i}><p className="font-semibold text-foreground text-sm">{f.q}</p><p className="text-muted-foreground text-sm mt-1">{f.a}</p></div>)}</div></div>}
                    </details>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant={isActive ? "default" : "outline"} onClick={() => speak(a)}>{isActive && !paused ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Listen</>}</Button>
                      {isActive && <span className="inline-flex items-center gap-1.5 text-xs text-primary"><Volume2 className="w-3.5 h-3.5 animate-pulse" /><span className="flex items-end gap-0.5 h-4">{[...Array(5)].map((_, i) => <span key={i} className="w-0.5 bg-primary animate-pulse" style={{ height: `${30 + ((i * 17) % 60)}%`, animationDelay: `${i * 0.1}s` }} />)}</span>{paused ? "Paused" : "Playing"}</span>}
                    </div>
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                      "@context": "https://schema.org", "@type": "NewsArticle", headline: a.title, description: a.meta_description || a.summary,
                      image: a.image_url ? [a.image_url] : undefined, datePublished: a.published_at,
                      author: { "@type": "Organization", name: a.author || "Crazy SEO Team Newsroom" },
                      publisher: { "@type": "Organization", name: "Crazy SEO Team" }, articleSection: a.category, keywords: a.nlp_keywords?.join(", "),
                      mainEntity: a.faqs?.length ? { "@type": "FAQPage", mainEntity: a.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) } : undefined,
                    }) }} />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default News;