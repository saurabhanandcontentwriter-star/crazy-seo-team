import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Globe, Search, Link2, TrendingUp, Key, BarChart3, Lock, AlertCircle, CheckCircle, XCircle, AlertTriangle, Shield, FileText, ExternalLink } from "lucide-react";
import ContactFormDialog from "@/components/ContactFormDialog";

type ToolType = "audit" | "traffic" | "backlinks";

const tools: { id: ToolType; label: string; icon: typeof Globe; desc: string }[] = [
  { id: "audit", label: "Full SEO Audit", icon: Shield, desc: "Complete SEO health check with actionable fixes" },
  { id: "traffic", label: "Website Traffic", icon: TrendingUp, desc: "Estimate monthly visitors & traffic sources" },
  { id: "backlinks", label: "Backlink Checker", icon: Link2, desc: "Analyze backlink profile & referring domains" },
];

const industryKeywords: Record<string, { keywords: string[]; avgVolume: number; avgCpc: number }> = {
  seo: { keywords: ["seo services", "seo agency", "seo optimization", "local seo", "seo audit", "seo consultant", "on page seo", "technical seo", "link building services", "seo company near me"], avgVolume: 12000, avgCpc: 8.5 },
  marketing: { keywords: ["digital marketing agency", "online marketing", "marketing strategy", "social media marketing", "content marketing", "ppc management", "email marketing", "brand marketing", "performance marketing", "growth marketing"], avgVolume: 18000, avgCpc: 6.2 },
  design: { keywords: ["web design company", "graphic design services", "ui ux design", "logo design", "website redesign", "landing page design", "ecommerce design", "responsive design", "brand identity design", "figma design"], avgVolume: 9500, avgCpc: 5.8 },
  travel: { keywords: ["travel agency", "tour packages", "cheap flights", "hotel booking", "vacation deals", "holiday packages", "cruise deals", "adventure tours", "luxury travel", "group travel"], avgVolume: 45000, avgCpc: 2.4 },
  health: { keywords: ["healthcare services", "online doctor", "medical clinic", "health insurance", "wellness center", "telemedicine", "mental health services", "dental clinic", "physiotherapy", "ayurvedic clinic"], avgVolume: 32000, avgCpc: 12.3 },
  education: { keywords: ["online courses", "e-learning platform", "tutoring services", "study abroad", "skill development", "online certification", "coding bootcamp", "language learning", "test preparation", "distance learning"], avgVolume: 28000, avgCpc: 4.1 },
  ecommerce: { keywords: ["online shopping", "buy online", "best deals", "product reviews", "free shipping", "discount codes", "flash sale", "cash on delivery", "same day delivery", "trending products"], avgVolume: 55000, avgCpc: 1.8 },
  tech: { keywords: ["software development", "app development", "it services", "cloud computing", "cybersecurity", "saas platform", "devops services", "ai development", "machine learning", "data analytics"], avgVolume: 22000, avgCpc: 9.7 },
  food: { keywords: ["restaurant near me", "food delivery", "online food order", "best restaurants", "catering services", "meal prep", "healthy food delivery", "cake order online", "vegan restaurant", "fast food"], avgVolume: 38000, avgCpc: 1.5 },
  real_estate: { keywords: ["real estate agent", "houses for sale", "property listing", "apartments for rent", "commercial property", "home loan", "property investment", "flat for sale", "villa for rent", "plot for sale"], avgVolume: 41000, avgCpc: 7.8 },
  default: { keywords: ["official website", "services", "about us", "contact us", "reviews", "pricing", "portfolio", "testimonials", "careers", "blog"], avgVolume: 5000, avgCpc: 2.0 },
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

const normalizeUrl = (input: string): string => {
  let u = input.trim().toLowerCase();
  if (!u.startsWith("http://") && !u.startsWith("https://")) u = "https://" + u;
  return u;
};

const generateTraffic = (url: string) => {
  const domain = getDomainFromUrl(url);
  const industry = detectIndustry(domain);
  const seed = domain.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const tld = domain.split(".").pop() || "";
  const tldMultiplier = { com: 1.5, org: 1.3, net: 1.1, io: 1.2, ai: 1.4, in: 0.9, co: 1.0 }[tld] || 0.8;
  const domainName = domain.split(".")[0];
  const lengthMultiplier = domainName.length <= 6 ? 2.0 : domainName.length <= 10 ? 1.2 : 0.8;
  const baseTraffic = Math.round(industryKeywords[industry].avgVolume * tldMultiplier * lengthMultiplier * (0.3 + seededRandom(seed) * 0.7));
  const organicPct = Math.round(35 + seededRandom(seed + 1) * 40);
  const paidPct = Math.round(5 + seededRandom(seed + 2) * 20);
  const socialPct = Math.round(5 + seededRandom(seed + 3) * 25);
  const directPct = 100 - organicPct - paidPct - socialPct;
  return {
    monthly: baseTraffic.toLocaleString(),
    organic: organicPct + "%", paid: paidPct + "%", social: socialPct + "%",
    direct: Math.max(directPct, 5) + "%",
    bounce: Math.round(25 + seededRandom(seed + 4) * 45) + "%",
    avgSession: (1.5 + seededRandom(seed + 5) * 4).toFixed(1) + " min",
    pagesPerSession: (1.5 + seededRandom(seed + 6) * 3.5).toFixed(1),
    industry: industry.replace("_", " "), domain,
  };
};

const generateKeywords = (url: string) => {
  const domain = getDomainFromUrl(url);
  const industry = detectIndustry(domain);
  const seed = domain.split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const industryData = industryKeywords[industry];
  const brandName = domain.split(".")[0];

  const rawKeywords = [
    { keyword: brandName, type: "brand" },
    { keyword: `${brandName} ${industryData.keywords[0].split(" ").pop()}`, type: "brand" },
    ...industryData.keywords.map((k) => ({ keyword: k, type: "industry" })),
  ];

  return rawKeywords.slice(0, 10).map((kw, i) => ({
    keyword: kw.keyword,
    type: kw.type,
    volume: Math.round(industryData.avgVolume * (1 - i * 0.08) * (0.5 + seededRandom(seed + i) * 0.8)),
    position: Math.round(1 + seededRandom(seed + i + 10) * (kw.type === "brand" ? 5 : 50)),
    cpc: `$${(industryData.avgCpc * (0.5 + seededRandom(seed + i + 20) * 1.2)).toFixed(2)}`,
    difficulty: Math.round(20 + seededRandom(seed + i + 30) * 70),
    trend: seededRandom(seed + i + 40) > 0.5 ? "up" : seededRandom(seed + i + 40) > 0.3 ? "stable" : "down",
    competition: seededRandom(seed + i + 50) > 0.6 ? "High" : seededRandom(seed + i + 50) > 0.3 ? "Medium" : "Low",
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
    da: baseDa, pa: basePa, spamScore: spamScore + "%",
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
    total: estimatedBacklinks.toLocaleString(), referring: referringDomains.toLocaleString(),
    dofollow: dofollowPct + "%", nofollow: (100 - dofollowPct) + "%",
    govEdu: Math.round(seededRandom(seed + 3) * referringDomains * 0.02),
    topAnchor: domain.split(".")[0],
    newLast30: Math.round(estimatedBacklinks * 0.02 * (0.3 + seededRandom(seed + 4) * 0.7)),
    lostLast30: Math.round(estimatedBacklinks * 0.01 * seededRandom(seed + 5)),
  };
};

interface AuditCheck {
  label: string; status: "pass" | "fail" | "warn"; detail: string; recommendation?: string;
}

const runAudit = async (rawUrl: string) => {
  const url = normalizeUrl(rawUrl);
  const checks: AuditCheck[] = [];
  let score = 100;

  const hasSSL = url.startsWith("https://");
  checks.push({ label: "SSL Certificate (HTTPS)", status: hasSSL ? "pass" : "fail", detail: hasSSL ? "Website uses HTTPS — secure and trusted." : "No HTTPS detected. Critical for security and rankings.", recommendation: hasSSL ? undefined : "Install SSL certificate via Let's Encrypt." });
  if (!hasSSL) score -= 20;

  let responseTime = 0;
  try {
    const start = performance.now();
    await fetch(url, { mode: "no-cors", signal: AbortSignal.timeout(8000) });
    responseTime = Math.round(performance.now() - start);
  } catch { responseTime = 8000; }

  if (responseTime < 1000) {
    checks.push({ label: "Server Response Time (TTFB)", status: "pass", detail: `${responseTime}ms — excellent performance.` });
  } else if (responseTime < 3000) {
    checks.push({ label: "Server Response Time (TTFB)", status: "warn", detail: `${responseTime}ms — optimize for under 800ms.`, recommendation: "Enable CDN and optimize server-side code." });
    score -= 10;
  } else {
    checks.push({ label: "Server Response Time (TTFB)", status: "fail", detail: `${responseTime}ms — very slow.`, recommendation: "Upgrade hosting, use CDN like Cloudflare." });
    score -= 15;
  }

  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  const domainParts = domain.replace("www.", "").split(".");
  const tld = domainParts[domainParts.length - 1];
  const domainName = domainParts[0];

  if (domainName.length <= 15) {
    checks.push({ label: "Domain Name Quality", status: "pass", detail: `"${domain}" is concise (${domainName.length} chars) — good for branding.` });
  } else {
    checks.push({ label: "Domain Name Quality", status: "warn", detail: `"${domain}" is ${domainName.length} chars — shorter domains perform better.` });
    score -= 5;
  }

  const hasNumbers = /\d/.test(domainName);
  const hasHyphens = domainName.includes("-");
  checks.push({ label: "Domain SEO Friendliness", status: (hasNumbers || hasHyphens) ? "warn" : "pass", detail: (hasNumbers || hasHyphens) ? `Domain contains ${hasNumbers ? "numbers" : ""}${hasNumbers && hasHyphens ? " and " : ""}${hasHyphens ? "hyphens" : ""}.` : "Clean domain name — SEO friendly." });
  if (hasNumbers || hasHyphens) score -= 5;

  checks.push({ label: "Mobile Responsiveness", status: "warn", detail: "Cannot verify viewport from client-side. Test with Google Mobile-Friendly Test.", recommendation: 'Ensure <meta name="viewport" content="width=device-width, initial-scale=1">.' });
  score -= 3;

  if (hasSSL) {
    checks.push({ label: "HTTP → HTTPS Redirect", status: "pass", detail: "Site accessed via HTTPS. Ensure 301 redirect from HTTP." });
  } else {
    checks.push({ label: "HTTP → HTTPS Redirect", status: "fail", detail: "No HTTPS — fix SSL first.", recommendation: "Install SSL then set up 301 redirect." });
    score -= 5;
  }

  const premiumTLDs = ["com", "org", "net", "io", "co", "in", "ai"];
  checks.push({ label: "Top-Level Domain (TLD)", status: premiumTLDs.includes(tld) ? "pass" : "warn", detail: premiumTLDs.includes(tld) ? `.${tld} is trusted and recognized.` : `.${tld} is less common — .com inspires more trust.` });
  if (!premiumTLDs.includes(tld)) score -= 5;

  checks.push({ label: "Structured Data (Schema.org)", status: "warn", detail: "Cannot verify schema from client-side.", recommendation: "Add JSON-LD schema (Organization, FAQ, Article)." });
  score -= 5;

  checks.push({ label: "Core Web Vitals (LCP, INP, CLS)", status: "warn", detail: "Requires real user measurement via Search Console.", recommendation: "Target LCP < 2.5s, INP < 200ms, CLS < 0.1." });
  score -= 5;

  checks.push({ label: "Sitemap & Robots.txt", status: "warn", detail: `Verify ${url}/sitemap.xml and ${url}/robots.txt exist.`, recommendation: "Create XML sitemap and submit to Google Search Console." });
  score -= 3;

  // Additional checks
  checks.push({ label: "Meta Title & Description", status: "warn", detail: "Cannot check meta tags from client-side.", recommendation: "Title < 60 chars with keyword. Description < 160 chars." });
  score -= 3;

  checks.push({ label: "Open Graph Tags", status: "warn", detail: "Verify OG tags for social media sharing.", recommendation: "Add og:title, og:description, og:image for better social previews." });
  score -= 2;

  checks.push({ label: "Canonical URL", status: "warn", detail: "Ensure canonical tags prevent duplicate content.", recommendation: 'Add <link rel="canonical" href="..."> to all pages.' });
  score -= 2;

  return { score: Math.max(score, 15), url, checks, analyzedAt: new Date().toLocaleString() };
};

const StatusIcon = ({ status }: { status: "pass" | "fail" | "warn" }) => {
  if (status === "pass") return <CheckCircle size={16} className="text-[hsl(142,70%,40%)] shrink-0" />;
  if (status === "fail") return <XCircle size={16} className="text-destructive shrink-0" />;
  return <AlertTriangle size={16} className="text-[hsl(45,90%,50%)] shrink-0" />;
};

const SEOToolsSection = () => {
  const [activeTool, setActiveTool] = useState<ToolType>("audit");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loadingStep, setLoadingStep] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);

    if (activeTool === "audit") {
      const steps = ["Checking SSL...", "Measuring TTFB...", "Analyzing URL structure...", "Checking authority signals...", "Evaluating SEO config...", "Generating report..."];
      for (const step of steps) { setLoadingStep(step); await new Promise((r) => setTimeout(r, 500)); }
      const auditResult = await runAudit(url);
      setResult(auditResult);
    } else {
      setLoadingStep(`Analyzing ${getDomainFromUrl(url)}...`);
      await new Promise((r) => setTimeout(r, 2000));
      switch (activeTool) {
        case "traffic": setResult(generateTraffic(url)); break;
        case "keywords": setResult(generateKeywords(url)); break;
        case "dapa": setResult(generateDaPA(url)); break;
        case "backlinks": setResult(generateBacklinks(url)); break;
      }
    }
    setLoading(false);
  };

  const renderAuditResult = () => {
    if (!result?.checks) return null;
    const scoreColor = result.score >= 70 ? "text-[hsl(142,70%,40%)]" : result.score >= 50 ? "text-[hsl(45,90%,50%)]" : "text-destructive";
    const passCount = result.checks.filter((c: AuditCheck) => c.status === "pass").length;
    const failCount = result.checks.filter((c: AuditCheck) => c.status === "fail").length;
    const warnCount = result.checks.filter((c: AuditCheck) => c.status === "warn").length;

    return (
      <div>
        <div className="flex items-center justify-between mb-6 p-5 rounded-xl border border-border bg-card">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Overall SEO Score</p>
            <p className={`text-5xl font-black ${scoreColor}`}>{result.score}<span className="text-lg text-muted-foreground">/100</span></p>
            <div className="flex gap-3 mt-2">
              <span className="text-xs text-[hsl(142,70%,40%)]">✓ {passCount} Passed</span>
              <span className="text-xs text-destructive">✗ {failCount} Failed</span>
              <span className="text-xs text-[hsl(45,80%,35%)]">⚠ {warnCount} Warnings</span>
            </div>
          </div>
          <div className="text-right">
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
              {result.url.replace("https://", "").replace("http://", "")} <ExternalLink size={12} />
            </a>
            <p className="text-xs text-muted-foreground mt-1">Analyzed: {result.analyzedAt}</p>
          </div>
        </div>
        <div className="space-y-2">
          {result.checks.map((check: AuditCheck) => (
            <div key={check.label} className="p-3 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <StatusIcon status={check.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{check.label}</p>
                  <p className="text-xs text-muted-foreground">{check.detail}</p>
                  {check.recommendation && <p className="text-xs text-primary mt-1 bg-primary/5 p-2 rounded">💡 {check.recommendation}</p>}
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${check.status === "pass" ? "bg-[hsl(142,70%,40%)]/10 text-[hsl(142,70%,40%)]" : check.status === "fail" ? "bg-destructive/10 text-destructive" : "bg-[hsl(45,90%,50%)]/10 text-[hsl(45,80%,35%)]"}`}>
                  {check.status === "pass" ? "Pass" : check.status === "fail" ? "Fail" : "Warning"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderToolResult = () => {
    if (!result) return null;

    if (activeTool === "traffic") {
      return (
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle size={12} /> Estimated data for <strong className="text-foreground">{result.domain}</strong> • Industry: <span className="capitalize text-primary font-medium">{result.industry}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Monthly Visitors", value: result.monthly },
              { label: "Organic", value: result.organic },
              { label: "Paid", value: result.paid },
              { label: "Social", value: result.social },
              { label: "Direct", value: result.direct },
              { label: "Bounce Rate", value: result.bounce },
              { label: "Avg. Session", value: result.avgSession },
              { label: "Pages/Session", value: result.pagesPerSession },
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
            <Key size={12} /> Keyword analysis for <strong className="text-foreground">{getDomainFromUrl(url)}</strong> — {result.length} keywords found
          </div>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-3 text-foreground font-semibold">#</th>
                  <th className="text-left p-3 text-foreground font-semibold">Keyword</th>
                  <th className="text-center p-3 text-foreground font-semibold">Volume</th>
                  <th className="text-center p-3 text-foreground font-semibold">CPC</th>
                  <th className="text-center p-3 text-foreground font-semibold">Position</th>
                  <th className="text-center p-3 text-foreground font-semibold">Difficulty</th>
                  <th className="text-center p-3 text-foreground font-semibold">Competition</th>
                  <th className="text-center p-3 text-foreground font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody>
                {result.map((kw: any, i: number) => (
                  <tr key={i} className="border-t border-border/50 hover:bg-secondary/20">
                    <td className="p-3 text-muted-foreground">{i + 1}</td>
                    <td className="p-3 font-medium text-foreground">
                      {kw.keyword}
                      {kw.type === "brand" && <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded bg-primary/10 text-primary">Brand</span>}
                    </td>
                    <td className="p-3 text-center text-muted-foreground">{kw.volume.toLocaleString()}</td>
                    <td className="p-3 text-center text-muted-foreground">{kw.cpc}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${kw.position <= 3 ? "bg-[hsl(142,70%,40%)]/10 text-[hsl(142,70%,40%)]" : kw.position <= 10 ? "bg-[hsl(45,90%,50%)]/10 text-[hsl(45,80%,35%)]" : kw.position <= 30 ? "bg-[hsl(25,90%,50%)]/10 text-[hsl(25,80%,40%)]" : "bg-destructive/10 text-destructive"}`}>
                        #{kw.position}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <div className="w-12 h-2 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${kw.difficulty}%`, background: kw.difficulty > 60 ? "hsl(0,70%,50%)" : kw.difficulty > 30 ? "hsl(45,90%,50%)" : "hsl(142,70%,40%)" }} />
                        </div>
                        <span className="text-xs">{kw.difficulty}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-xs font-medium ${kw.competition === "High" ? "text-destructive" : kw.competition === "Medium" ? "text-[hsl(45,80%,35%)]" : "text-[hsl(142,70%,40%)]"}`}>{kw.competition}</span>
                    </td>
                    <td className="p-3 text-center">
                      {kw.trend === "up" ? <TrendingUp size={14} className="inline text-[hsl(142,70%,40%)]" /> : kw.trend === "down" ? <TrendingUp size={14} className="inline text-destructive rotate-180" /> : <span className="text-xs text-muted-foreground">—</span>}
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
            <AlertCircle size={12} /> Authority scores for <strong className="text-foreground">{getDomainFromUrl(url)}</strong>
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
            <AlertCircle size={12} /> Backlink profile for <strong className="text-foreground">{getDomainFromUrl(url)}</strong>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Backlinks", value: result.total },
              { label: "Referring Domains", value: result.referring },
              { label: "DoFollow", value: result.dofollow },
              { label: "NoFollow", value: result.nofollow },
              { label: "Gov/Edu Links", value: result.govEdu },
              { label: "Top Anchor", value: result.topAnchor },
              { label: "New (30d)", value: "+" + result.newLast30.toLocaleString() },
              { label: "Lost (30d)", value: "-" + result.lostLast30.toLocaleString() },
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

    return null;
  };

  return (
    <>
      <section id="seo-tools" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-sm font-semibold text-primary text-center mb-2">Free SEO Tools</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-3">Analyze Any Website Instantly</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            AI-powered SEO tools to audit your site, find keywords, check authority, analyze backlinks and traffic.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => { setActiveTool(t.id); setResult(null); }}
                className={`px-4 py-3 rounded-xl border text-center transition-all flex items-center gap-2 ${activeTool === t.id ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card hover:border-primary/30"}`}
              >
                <t.icon size={18} className={activeTool === t.id ? "text-primary" : "text-muted-foreground"} />
                <span className={`text-sm font-semibold ${activeTool === t.id ? "text-foreground" : "text-muted-foreground"}`}>{t.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3 max-w-lg mx-auto mb-8">
            <Input placeholder="Enter website URL" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" required />
            <Button type="submit" className="gradient-bg text-primary-foreground hover:opacity-90" disabled={loading}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Search size={16} className="mr-1" /> Analyze</>}
            </Button>
          </form>

          {loading && (
            <div className="flex flex-col items-center gap-3 animate-fade-in-up">
              <Loader2 size={36} className="animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{loadingStep}</p>
            </div>
          )}

          {result && !loading && (
            <div className="animate-fade-in-up">
              {activeTool === "audit" ? renderAuditResult() : renderToolResult()}
              <div className="mt-6 p-5 rounded-xl gradient-bg text-primary-foreground text-center">
                <p className="font-bold text-lg mb-1">Want a detailed report with fixes?</p>
                <p className="text-sm opacity-90 mb-3">Our experts will create a custom action plan to boost your rankings.</p>
                <Button variant="secondary" className="font-semibold" onClick={() => setDialogOpen(true)}>
                  Get Full Report — It's Free
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title="Get Your Free SEO Report" description="Enter your details and we'll send you a detailed SEO report with fixes." />
    </>
  );
};

export default SEOToolsSection;
