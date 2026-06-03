import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, Newspaper, Pause, Play, RefreshCw, Volume2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  source: string | null;
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
];

const REFRESH_MS = 30 * 60 * 1000; // 30 minutes

const News = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState("All");
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("news_articles")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(5);
    if (!error && data) setArticles(data as NewsArticle[]);
    setLoading(false);
  };

  const triggerRefresh = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      await supabase.functions.invoke("refresh-news");
      await load();
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  useEffect(() => {
    (async () => {
      await load();
      // If no news yet, fetch immediately
      const { count } = await supabase
        .from("news_articles")
        .select("*", { count: "exact", head: true });
      if (!count) await triggerRefresh(true);
    })();

    const id = setInterval(() => triggerRefresh(true), REFRESH_MS);
    return () => {
      clearInterval(id);
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () => (category === "All" ? articles : articles.filter((a) => a.category === category)),
    [articles, category],
  );

  const speak = (a: NewsArticle) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (speakingId === a.id) {
      setSpeakingId(null);
      return;
    }
    const u = new SpeechSynthesisUtterance(`${a.title}. ${a.summary}. ${a.content}`);
    u.rate = 1;
    u.pitch = 1;
    u.onend = () => setSpeakingId(null);
    u.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(u);
    setSpeakingId(a.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Live SEO & AI News — Crazy SEO Team</title>
        <meta
          name="description"
          content="Live SEO, AI search and Google updates news center. Auto-refreshing every 30 minutes with built-in AI audio news reader."
        />
        <link rel="canonical" href="https://nimble-echo-engine.lovable.app/news" />
        <meta property="og:title" content="Live SEO & AI News — Crazy SEO Team" />
        <meta
          property="og:description"
          content="The latest SEO, AI SEO, Google updates and AI tools news — refreshed every 30 minutes."
        />
        <meta property="og:url" content="https://nimble-echo-engine.lovable.app/news" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20 container mx-auto px-4 max-w-5xl">
        <header className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-4">
            <Newspaper className="w-3.5 h-3.5" /> Live News Center
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-3">
            SEO & AI Search News
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The latest 5 stories across SEO, AI search and digital marketing. Auto-refreshed every
            30 minutes — listen with the built-in AI audio reader.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerRefresh()}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh Now
            </Button>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5" /> Audio reader available
            </span>
          </div>
        </header>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                category === c
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border hover:border-primary/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No news in this category yet. Click Refresh Now to pull the latest.
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map((a) => (
              <article
                key={a.id}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                  <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary font-semibold">
                    {a.category}
                  </span>
                  {a.source && <span>{a.source}</span>}
                  <span>·</span>
                  <span>{new Date(a.published_at).toLocaleString()}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">{a.title}</h2>
                <p className="text-muted-foreground mb-4">{a.summary}</p>
                <details className="text-sm text-foreground/80 mb-4">
                  <summary className="cursor-pointer text-primary font-medium">Read full story</summary>
                  <div className="mt-3 whitespace-pre-line leading-relaxed">{a.content}</div>
                </details>
                <Button
                  size="sm"
                  variant={speakingId === a.id ? "default" : "outline"}
                  onClick={() => speak(a)}
                >
                  {speakingId === a.id ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" /> Stop Audio
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" /> Listen
                    </>
                  )}
                </Button>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default News;
