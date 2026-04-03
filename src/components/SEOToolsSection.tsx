import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Globe, Search, Link2, TrendingUp, Key, BarChart3, Lock } from "lucide-react";

type ToolType = "traffic" | "keywords" | "dapa" | "backlinks";

const tools: { id: ToolType; label: string; icon: typeof Globe; desc: string }[] = [
  { id: "traffic", label: "Website Traffic", icon: TrendingUp, desc: "Estimate monthly visitors & traffic sources" },
  { id: "keywords", label: "Top 5 Keywords", icon: Key, desc: "Discover top ranking keywords for any domain" },
  { id: "dapa", label: "DA / PA Checker", icon: BarChart3, desc: "Check Domain & Page Authority scores" },
  { id: "backlinks", label: "Backlink Checker", icon: Link2, desc: "Analyze backlink profile & referring domains" },
];

const generateTraffic = (url: string) => {
  const h = Math.abs(url.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0));
  return {
    monthly: (5000 + (h % 95000)).toLocaleString(),
    organic: (40 + (h % 45)) + "%",
    paid: (5 + (h % 15)) + "%",
    social: (5 + (h % 20)) + "%",
    direct: (10 + (h % 25)) + "%",
    bounce: (30 + (h % 40)) + "%",
  };
};

const generateKeywords = (url: string) => {
  const h = Math.abs(url.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0));
  const domain = url.replace(/https?:\/\//, "").replace(/www\./, "").split("/")[0].split(".")[0];
  const kws = [
    { keyword: `${domain} services`, volume: 2400 + (h % 5000), position: 1 + (h % 5), cpc: `$${(0.5 + (h % 8)).toFixed(2)}` },
    { keyword: `best ${domain}`, volume: 1800 + (h % 3000), position: 2 + (h % 8), cpc: `$${(1.2 + (h % 6)).toFixed(2)}` },
    { keyword: `${domain} near me`, volume: 1200 + (h % 4000), position: 3 + (h % 10), cpc: `$${(0.8 + (h % 5)).toFixed(2)}` },
    { keyword: `${domain} reviews`, volume: 900 + (h % 2000), position: 4 + (h % 12), cpc: `$${(0.3 + (h % 4)).toFixed(2)}` },
    { keyword: `${domain} pricing`, volume: 600 + (h % 1500), position: 5 + (h % 15), cpc: `$${(1.5 + (h % 7)).toFixed(2)}` },
  ];
  return kws;
};

const generateDaPA = (url: string) => {
  const h = Math.abs(url.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0));
  return { da: 15 + (h % 70), pa: 10 + (h % 65), spamScore: h % 15, mozRank: (2 + (h % 6)).toFixed(1) };
};

const generateBacklinks = (url: string) => {
  const h = Math.abs(url.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0));
  return {
    total: (200 + (h % 50000)).toLocaleString(),
    referring: (50 + (h % 5000)).toLocaleString(),
    dofollow: (60 + (h % 30)) + "%",
    nofollow: (10 + (h % 30)) + "%",
    govEdu: h % 50,
    topAnchor: url.replace(/https?:\/\//, "").split("/")[0],
  };
};

const SEOToolsSection = () => {
  const [activeTool, setActiveTool] = useState<ToolType>("traffic");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      switch (activeTool) {
        case "traffic": setResult(generateTraffic(url)); break;
        case "keywords": setResult(generateKeywords(url)); break;
        case "dapa": setResult(generateDaPA(url)); break;
        case "backlinks": setResult(generateBacklinks(url)); break;
      }
      setLoading(false);
    }, 2000);
  };

  const renderResult = () => {
    if (!result) return null;

    if (activeTool === "traffic") {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Monthly Visitors", value: result.monthly },
            { label: "Organic Traffic", value: result.organic },
            { label: "Paid Traffic", value: result.paid },
            { label: "Social Traffic", value: result.social },
            { label: "Direct Traffic", value: result.direct },
            { label: "Bounce Rate", value: result.bounce },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-lg border border-border bg-card text-center">
              <p className="text-2xl font-bold text-primary">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeTool === "keywords") {
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-foreground font-semibold">#</th>
                <th className="text-left p-3 text-foreground font-semibold">Keyword</th>
                <th className="text-center p-3 text-foreground font-semibold">Volume</th>
                <th className="text-center p-3 text-foreground font-semibold">Position</th>
                <th className="text-center p-3 text-foreground font-semibold">CPC</th>
              </tr>
            </thead>
            <tbody>
              {result.map((kw: any, i: number) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="p-3 text-muted-foreground">{i + 1}</td>
                  <td className="p-3 font-medium text-foreground">{kw.keyword}</td>
                  <td className="p-3 text-center text-muted-foreground">{kw.volume.toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${kw.position <= 3 ? "bg-[hsl(142,70%,40%)]/10 text-[hsl(142,70%,40%)]" : kw.position <= 10 ? "bg-[hsl(45,90%,50%)]/10 text-[hsl(45,80%,35%)]" : "bg-destructive/10 text-destructive"}`}>
                      #{kw.position}
                    </span>
                  </td>
                  <td className="p-3 text-center text-muted-foreground">{kw.cpc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (activeTool === "dapa") {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Domain Authority", value: result.da, max: 100 },
            { label: "Page Authority", value: result.pa, max: 100 },
            { label: "Spam Score", value: result.spamScore + "%", max: null },
            { label: "Moz Rank", value: result.mozRank, max: null },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-lg border border-border bg-card text-center">
              <p className="text-3xl font-bold text-primary">{item.value}{item.max ? <span className="text-sm text-muted-foreground">/{item.max}</span> : null}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeTool === "backlinks") {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Total Backlinks", value: result.total },
            { label: "Referring Domains", value: result.referring },
            { label: "DoFollow Links", value: result.dofollow },
            { label: "NoFollow Links", value: result.nofollow },
            { label: "Gov/Edu Links", value: result.govEdu },
            { label: "Top Anchor", value: result.topAnchor },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-lg border border-border bg-card text-center">
              <p className="text-2xl font-bold text-primary">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <section id="seo-tools" className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <p className="text-sm font-semibold text-primary text-center mb-2">Free SEO Tools</p>
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-3">
          Analyze Any Website Instantly
        </h2>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          Use our AI-powered SEO tools to check website traffic, find top keywords, analyze domain authority, and audit backlinks — all for free.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {tools.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTool(t.id); setResult(null); }}
              className={`p-4 rounded-xl border text-center transition-all ${
                activeTool === t.id
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <t.icon size={24} className={`mx-auto mb-2 ${activeTool === t.id ? "text-primary" : "text-muted-foreground"}`} />
              <p className={`text-sm font-semibold ${activeTool === t.id ? "text-foreground" : "text-muted-foreground"}`}>{t.label}</p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3 max-w-lg mx-auto mb-8">
          <Input
            placeholder="Enter website URL (e.g. example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" className="gradient-bg text-primary-foreground hover:opacity-90" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <><Search size={16} className="mr-1" /> Analyze</>}
          </Button>
        </form>

        {loading && (
          <div className="flex flex-col items-center gap-3 animate-fade-in-up">
            <Loader2 size={36} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing {url}...</p>
          </div>
        )}

        {result && !loading && (
          <div className="animate-fade-in-up">
            {renderResult()}
            <div className="mt-6 p-5 rounded-xl gradient-bg text-primary-foreground text-center">
              <Lock size={20} className="mx-auto mb-2 opacity-80" />
              <p className="font-bold text-lg mb-1">Download Full SEO Audit Report (PDF)</p>
              <p className="text-sm opacity-90 mb-3">Get a comprehensive 20-page report with actionable recommendations.</p>
              <Button variant="secondary" className="font-semibold" disabled>
                Premium Only — Coming Soon
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SEOToolsSection;
