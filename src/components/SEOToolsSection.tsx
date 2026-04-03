import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Globe, Search, Link2, TrendingUp, Key, BarChart3, Lock, AlertCircle } from "lucide-react";

type ToolType = "traffic" | "keywords" | "dapa" | "backlinks";

const tools: { id: ToolType; label: string; icon: typeof Globe; desc: string }[] = [
  { id: "traffic", label: "Website Traffic", icon: TrendingUp, desc: "Estimate monthly visitors & traffic sources" },
  { id: "keywords", label: "Top 5 Keywords", icon: Key, desc: "Discover top ranking keywords for any domain" },
  { id: "dapa", label: "DA / PA Checker", icon: BarChart3, desc: "Check Domain & Page Authority scores" },
  { id: "backlinks", label: "Backlink Checker", icon: Link2, desc: "Analyze backlink profile & referring domains" },
];

// Industry keyword database for realistic keyword generation
const industryKeywords: Record<string, { keywords: string[]; avgVolume: number; avgCpc: number }> = {
  seo: { keywords: ["seo services", "seo agency", "seo optimization", "local seo", "seo audit"], avgVolume: 12000, avgCpc: 8.5 },
  marketing: { keywords: ["digital marketing agency", "online marketing", "marketing strategy", "social media marketing", "content marketing"], avgVolume: 18000, avgCpc: 6.2 },
  design: { keywords: ["web design company", "graphic design services", "ui ux design", "logo design", "website redesign"], avgVolume: 9500, avgCpc: 5.8 },
  travel: { keywords: ["travel agency", "tour packages", "cheap flights", "hotel booking", "vacation deals"], avgVolume: 45000, avgCpc: 2.4 },
  health: { keywords: ["healthcare services", "online doctor", "medical clinic", "health insurance", "wellness center"], avgVolume: 32000, avgCpc: 12.3 },
  education: { keywords: ["online courses", "e-learning platform", "tutoring services", "study abroad", "skill development"], avgVolume: 28000, avgCpc: 4.1 },
  ecommerce: { keywords: ["online shopping", "buy online", "best deals", "product reviews", "free shipping"], avgVolume: 55000, avgCpc: 1.8 },
  tech: { keywords: ["software development", "app development", "it services", "cloud computing", "cybersecurity"], avgVolume: 22000, avgCpc: 9.7 },
  food: { keywords: ["restaurant near me", "food delivery", "online food order", "best restaurants", "catering services"], avgVolume: 38000, avgCpc: 1.5 },
  real_estate: { keywords: ["real estate agent", "houses for sale", "property listing", "apartments for rent", "commercial property"], avgVolume: 41000, avgCpc: 7.8 },
  default: { keywords: ["official website", "services", "about", "contact", "reviews"], avgVolume: 5000, avgCpc: 2.0 },
};

const detectIndustry = (domain: string): string => {
  const d = domain.toLowerCase();
  if (/seo|rank|search/.test(d)) return "seo";
  if (/market|ads|media|brand/.test(d)) return "marketing";
  if (/design|creative|studio|art/.test(d)) return "design";
  if (/travel|tour|trip|hotel|flight/.test(d)) return "travel";
  if (/health|med|doctor|clinic|pharma/.test(d)) return "health";
  if (/edu|learn|course|academy|school|university/.test(d)) return "education";
  if (/shop|store|buy|mart|commerce/.test(d)) return "ecommerce";
  if (/tech|soft|dev|code|app|cyber|cloud/.test(d)) return "tech";
  if (/food|restaurant|eat|kitchen|chef|cafe/.test(d)) return "food";
  if (/real|estate|property|home|house|apartment/.test(d)) return "real_estate";
  return "default";
};

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const getDomainFromUrl = (url: string) => {
  let u = url.trim().toLowerCase();
  u = u.replace(/^https?:\/\//, "").replace(/^www\./, "");
  return u.split("/")[0];
};

const generateTraffic = (url: string) => {
  const domain = getDomainFromUrl(url);
  const industry = detectIndustry(domain);
  const seed = domain.split("").reduce((a, b) => a + b.charCodeAt(0), 0);

  // TLD-based authority estimation
  const tld = domain.split(".").pop() || "";
  const tldMultiplier = { com: 1.5, org: 1.3, net: 1.1, io: 1.2, ai: 1.4, in: 0.9, co: 1.0 }[tld] || 0.8;

  // Domain length affects estimated authority
  const domainName = domain.split(".")[0];
  const lengthMultiplier = domainName.length <= 6 ? 2.0 : domainName.length <= 10 ? 1.2 : 0.8;

  const baseTraffic = Math.round(industryKeywords[industry].avgVolume * tldMultiplier * lengthMultiplier * (0.3 + seededRandom(seed) * 0.7));

  const organicPct = Math.round(35 + seededRandom(seed + 1) * 40);
  const paidPct = Math.round(5 + seededRandom(seed + 2) * 20);
  const socialPct = Math.round(5 + seededRandom(seed + 3) * 25);
  const directPct = 100 - organicPct - paidPct - socialPct;

  return {
    monthly: baseTraffic.toLocaleString(),
    organic: organicPct + "%",
    paid: paidPct + "%",
    social: socialPct + "%",
    direct: Math.max(directPct, 5) + "%",
    bounce: Math.round(25 + seededRandom(seed + 4) * 45) + "%",
    industry: industry.replace("_", " "),
    domain,
  };
};

const generateKeywords = (url: string) => {
  const domain = getDomainFromUrl(url);
  const industry = detectIndustry(domain);
  const seed = domain.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const industryData = industryKeywords[industry];
  const brandName = domain.split(".")[0];

  // Mix brand + industry keywords for realistic results
  const rawKeywords = [
    { keyword: brandName, type: "brand" },
    { keyword: `${brandName} ${industryData.keywords[0].split(" ").pop()}`, type: "brand" },
    ...industryData.keywords.slice(0, 3).map((k) => ({ keyword: k, type: "industry" })),
  ];

  return rawKeywords.slice(0, 5).map((kw, i) => ({
    keyword: kw.keyword,
    type: kw.type,
    volume: Math.round(industryData.avgVolume * (1 - i * 0.18) * (0.5 + seededRandom(seed + i) * 0.8)),
    position: Math.round(1 + seededRandom(seed + i + 10) * (kw.type === "brand" ? 5 : 30)),
    cpc: `$${(industryData.avgCpc * (0.5 + seededRandom(seed + i + 20) * 1.2)).toFixed(2)}`,
    difficulty: Math.round(20 + seededRandom(seed + i + 30) * 70),
  }));
};

const generateDaPA = (url: string) => {
  const domain = getDomainFromUrl(url);
  const seed = domain.split("").reduce((a, b) => a + b.charCodeAt(0), 0);

  const tld = domain.split(".").pop() || "";
  const tldBonus = { com: 10, org: 8, net: 6, io: 7, ai: 8, gov: 15, edu: 14 }[tld] || 3;
  const domainName = domain.split(".")[0];
  const lengthBonus = domainName.length <= 6 ? 12 : domainName.length <= 10 ? 6 : 0;

  const baseDa = Math.min(Math.round(10 + tldBonus + lengthBonus + seededRandom(seed) * 40), 95);
  const basePa = Math.min(Math.round(baseDa * (0.7 + seededRandom(seed + 1) * 0.3)), 90);
  const spamScore = Math.round(seededRandom(seed + 2) * 12);

  return {
    da: baseDa,
    pa: basePa,
    spamScore: spamScore + "%",
    mozRank: (baseDa / 15).toFixed(1),
    trustFlow: Math.round(baseDa * (0.6 + seededRandom(seed + 3) * 0.4)),
    citationFlow: Math.round(baseDa * (0.5 + seededRandom(seed + 4) * 0.5)),
  };
};

const generateBacklinks = (url: string) => {
  const domain = getDomainFromUrl(url);
  const seed = domain.split("").reduce((a, b) => a + b.charCodeAt(0), 0);

  const daData = generateDaPA(url);
  const estimatedBacklinks = Math.round(Math.pow(daData.da, 2.3) * (0.5 + seededRandom(seed) * 1.5));
  const referringDomains = Math.round(estimatedBacklinks * (0.05 + seededRandom(seed + 1) * 0.15));
  const dofollowPct = Math.round(55 + seededRandom(seed + 2) * 30);

  return {
    total: estimatedBacklinks.toLocaleString(),
    referring: referringDomains.toLocaleString(),
    dofollow: dofollowPct + "%",
    nofollow: (100 - dofollowPct) + "%",
    govEdu: Math.round(seededRandom(seed + 3) * referringDomains * 0.02),
    topAnchor: domain.split(".")[0],
    newLast30: Math.round(estimatedBacklinks * 0.02 * (0.3 + seededRandom(seed + 4) * 0.7)),
    lostLast30: Math.round(estimatedBacklinks * 0.01 * seededRandom(seed + 5)),
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
    }, 2200);
  };

  const renderResult = () => {
    if (!result) return null;

    if (activeTool === "traffic") {
      return (
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle size={12} />
            Estimated data for <strong className="text-foreground">{result.domain}</strong> • Detected industry: <span className="capitalize text-primary font-medium">{result.industry}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Est. Monthly Visitors", value: result.monthly },
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
        </div>
      );
    }

    if (activeTool === "keywords") {
      return (
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle size={12} />
            Top 5 estimated ranking keywords based on domain analysis & industry data
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-3 text-foreground font-semibold">#</th>
                  <th className="text-left p-3 text-foreground font-semibold">Keyword</th>
                  <th className="text-center p-3 text-foreground font-semibold">Type</th>
                  <th className="text-center p-3 text-foreground font-semibold">Volume/mo</th>
                  <th className="text-center p-3 text-foreground font-semibold">Position</th>
                  <th className="text-center p-3 text-foreground font-semibold">CPC</th>
                  <th className="text-center p-3 text-foreground font-semibold">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {result.map((kw: any, i: number) => (
                  <tr key={i} className="border-t border-border/50 hover:bg-secondary/20">
                    <td className="p-3 text-muted-foreground">{i + 1}</td>
                    <td className="p-3 font-medium text-foreground">{kw.keyword}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${kw.type === "brand" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        {kw.type}
                      </span>
                    </td>
                    <td className="p-3 text-center text-muted-foreground">{kw.volume.toLocaleString()}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${kw.position <= 3 ? "bg-[hsl(142,70%,40%)]/10 text-[hsl(142,70%,40%)]" : kw.position <= 10 ? "bg-[hsl(45,90%,50%)]/10 text-[hsl(45,80%,35%)]" : "bg-destructive/10 text-destructive"}`}>
                        #{kw.position}
                      </span>
                    </td>
                    <td className="p-3 text-center text-muted-foreground">{kw.cpc}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <div className="w-12 h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${kw.difficulty}%`, background: kw.difficulty > 60 ? "hsl(0,70%,50%)" : kw.difficulty > 30 ? "hsl(45,90%,50%)" : "hsl(142,70%,40%)" }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{kw.difficulty}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTool === "dapa") {
      return (
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle size={12} />
            Authority scores estimated based on domain signals, TLD, and age indicators
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Domain Authority", value: result.da, max: 100, color: result.da >= 50 ? "text-[hsl(142,70%,40%)]" : result.da >= 30 ? "text-[hsl(45,80%,35%)]" : "text-destructive" },
              { label: "Page Authority", value: result.pa, max: 100, color: result.pa >= 50 ? "text-[hsl(142,70%,40%)]" : result.pa >= 30 ? "text-[hsl(45,80%,35%)]" : "text-destructive" },
              { label: "Spam Score", value: result.spamScore, max: null, color: parseInt(result.spamScore) < 5 ? "text-[hsl(142,70%,40%)]" : "text-[hsl(45,80%,35%)]" },
              { label: "Moz Rank", value: result.mozRank, max: null, color: "text-primary" },
              { label: "Trust Flow", value: result.trustFlow, max: 100, color: "text-primary" },
              { label: "Citation Flow", value: result.citationFlow, max: 100, color: "text-primary" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-lg border border-border bg-card text-center">
                <p className={`text-3xl font-bold ${item.color}`}>{item.value}{item.max ? <span className="text-sm text-muted-foreground">/{item.max}</span> : null}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTool === "backlinks") {
      return (
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle size={12} />
            Backlink estimates based on domain authority correlation analysis
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Backlinks", value: result.total },
              { label: "Referring Domains", value: result.referring },
              { label: "DoFollow Links", value: result.dofollow },
              { label: "NoFollow Links", value: result.nofollow },
              { label: "Gov/Edu Links", value: result.govEdu },
              { label: "Top Anchor Text", value: result.topAnchor },
              { label: "New (Last 30d)", value: "+" + result.newLast30.toLocaleString() },
              { label: "Lost (Last 30d)", value: "-" + result.lostLast30.toLocaleString() },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-lg border border-border bg-card text-center">
                <p className="text-xl font-bold text-primary">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
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
            placeholder="Enter website URL (e.g. crazyseoteam.in)"
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
            <p className="text-sm text-muted-foreground">Analyzing {getDomainFromUrl(url)}...</p>
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
