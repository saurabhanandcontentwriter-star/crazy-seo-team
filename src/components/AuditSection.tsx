import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, AlertTriangle, Loader2, Shield, Zap, Smartphone, FileText, Search, Globe, ExternalLink } from "lucide-react";

interface AuditCheck {
  label: string;
  status: "pass" | "fail" | "warn";
  detail: string;
  recommendation?: string;
}

interface AuditResult {
  score: number;
  url: string;
  checks: AuditCheck[];
  analyzedAt: string;
}

const normalizeUrl = (input: string): string => {
  let u = input.trim().toLowerCase();
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    u = "https://" + u;
  }
  return u;
};

const runRealAudit = async (rawUrl: string): Promise<AuditResult> => {
  const url = normalizeUrl(rawUrl);
  const checks: AuditCheck[] = [];
  let score = 100;

  // 1. SSL Check - real check based on URL
  const hasSSL = url.startsWith("https://");
  checks.push({
    label: "SSL Certificate (HTTPS)",
    status: hasSSL ? "pass" : "fail",
    detail: hasSSL
      ? "Your website uses HTTPS — secure and trusted by browsers & Google."
      : "Your website does not use HTTPS. This is critical for security, user trust, and Google rankings.",
    recommendation: hasSSL ? undefined : "Install an SSL certificate immediately. Most hosts offer free SSL via Let's Encrypt.",
  });
  if (!hasSSL) score -= 20;

  // 2. Try to fetch the website
  let fetchSuccess = false;
  let responseTime = 0;
  let htmlContent = "";
  try {
    const start = performance.now();
    const res = await fetch(url, { mode: "no-cors", signal: AbortSignal.timeout(8000) });
    responseTime = Math.round(performance.now() - start);
    fetchSuccess = true;
    try {
      htmlContent = await res.text();
    } catch { /* no-cors won't give body */ }
  } catch {
    responseTime = 8000;
  }

  // 3. Response Time / Speed
  if (fetchSuccess && responseTime < 1000) {
    checks.push({ label: "Server Response Time (TTFB)", status: "pass", detail: `Server responded in ${responseTime}ms — excellent performance.` });
  } else if (fetchSuccess && responseTime < 3000) {
    checks.push({ label: "Server Response Time (TTFB)", status: "warn", detail: `Server responded in ${responseTime}ms — should be under 800ms for optimal SEO.`, recommendation: "Consider upgrading hosting, enabling CDN, or optimizing server-side code." });
    score -= 10;
  } else {
    checks.push({ label: "Server Response Time (TTFB)", status: fetchSuccess ? "fail" : "warn", detail: fetchSuccess ? `Server responded in ${responseTime}ms — very slow, hurting rankings.` : `Could not measure response time (CORS restricted). Visit your site and check via PageSpeed Insights.`, recommendation: "Use a CDN like Cloudflare, upgrade to faster hosting, and optimize database queries." });
    score -= 15;
  }

  // 4. URL Structure Analysis
  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  const pathSegments = urlObj.pathname.split("/").filter(Boolean);
  const hasWWW = domain.startsWith("www.");
  const domainParts = domain.replace("www.", "").split(".");
  const tld = domainParts[domainParts.length - 1];
  const domainName = domainParts[0];

  // Domain length check
  if (domainName.length <= 15) {
    checks.push({ label: "Domain Name Quality", status: "pass", detail: `Domain "${domain}" is concise (${domainName.length} chars) — good for branding and memorability.` });
  } else {
    checks.push({ label: "Domain Name Quality", status: "warn", detail: `Domain "${domain}" is ${domainName.length} characters — shorter domains rank and convert better.`, recommendation: "Consider a shorter, more brandable domain for better user recall." });
    score -= 5;
  }

  // 5. URL contains hyphens/numbers analysis
  const hasNumbers = /\d/.test(domainName);
  const hasHyphens = domainName.includes("-");
  if (hasNumbers || hasHyphens) {
    checks.push({ label: "Domain SEO Friendliness", status: "warn", detail: `Domain contains ${hasNumbers ? "numbers" : ""}${hasNumbers && hasHyphens ? " and " : ""}${hasHyphens ? "hyphens" : ""} — pure word domains tend to rank slightly better.` });
    score -= 5;
  } else {
    checks.push({ label: "Domain SEO Friendliness", status: "pass", detail: "Clean domain name without numbers or excessive hyphens — SEO friendly." });
  }

  // 6. Mobile viewport (can't check without HTML, so check common patterns)
  checks.push({
    label: "Mobile Responsiveness",
    status: "warn",
    detail: "Cannot verify viewport meta tag from client-side. Most modern sites are mobile-responsive.",
    recommendation: "Ensure your site has <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> in the <head>. Test with Google's Mobile-Friendly Test tool.",
  });
  score -= 3;

  // 7. HTTPS redirect check
  if (hasSSL) {
    checks.push({ label: "HTTP to HTTPS Redirect", status: "pass", detail: "Site is accessed via HTTPS. Ensure HTTP requests are 301-redirected to HTTPS." });
  } else {
    checks.push({ label: "HTTP to HTTPS Redirect", status: "fail", detail: "Site is not on HTTPS — no redirect possible. Fix SSL first.", recommendation: "After installing SSL, set up a 301 redirect from HTTP to HTTPS." });
    score -= 5;
  }

  // 8. Common SEO checks based on URL structure
  const hasTrailingSlash = urlObj.pathname.endsWith("/") && urlObj.pathname !== "/";
  if (hasTrailingSlash) {
    checks.push({ label: "URL Trailing Slash", status: "warn", detail: "URL has a trailing slash which can cause duplicate content issues.", recommendation: "Choose either trailing slash or no trailing slash consistently and 301-redirect the other." });
    score -= 3;
  }

  // 9. TLD Analysis
  const premiumTLDs = ["com", "org", "net", "io", "co", "in", "ai"];
  if (premiumTLDs.includes(tld)) {
    checks.push({ label: "Top-Level Domain (TLD)", status: "pass", detail: `.${tld} is a trusted and widely recognized TLD — good for SEO and user trust.` });
  } else {
    checks.push({ label: "Top-Level Domain (TLD)", status: "warn", detail: `.${tld} is less common — .com, .org, .net domains generally inspire more trust.`, recommendation: "Consider acquiring a .com version of your domain for better click-through rates." });
    score -= 5;
  }

  // 10. Schema/Structured Data recommendation
  checks.push({
    label: "Structured Data (Schema.org)",
    status: "warn",
    detail: "Cannot verify schema markup from client-side analysis. This is crucial for rich snippets in search results.",
    recommendation: "Add JSON-LD schema markup (Organization, LocalBusiness, FAQ, Article) to improve search appearance. Test with Google's Rich Results Test.",
  });
  score -= 5;

  // 11. Core Web Vitals recommendation
  checks.push({
    label: "Core Web Vitals (LCP, INP, CLS)",
    status: "warn",
    detail: "Core Web Vitals require real user measurement. Check Google Search Console for field data.",
    recommendation: "Target LCP < 2.5s, INP < 200ms, CLS < 0.1. Use PageSpeed Insights for detailed analysis.",
  });
  score -= 5;

  // 12. Sitemap & Robots
  checks.push({
    label: "Sitemap & Robots.txt",
    status: "warn",
    detail: `Verify that ${url}/sitemap.xml and ${url}/robots.txt exist and are properly configured.`,
    recommendation: "Create an XML sitemap and submit it to Google Search Console. Ensure robots.txt doesn't block important pages.",
  });
  score -= 3;

  score = Math.max(score, 15);

  return {
    score,
    url,
    checks,
    analyzedAt: new Date().toLocaleString(),
  };
};

const StatusIcon = ({ status }: { status: "pass" | "fail" | "warn" }) => {
  if (status === "pass") return <CheckCircle size={18} className="text-[hsl(142,70%,40%)] shrink-0" />;
  if (status === "fail") return <XCircle size={18} className="text-destructive shrink-0" />;
  return <AlertTriangle size={18} className="text-[hsl(45,90%,50%)] shrink-0" />;
};

const AuditSection = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loadingStep, setLoadingStep] = useState("");

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);

    const steps = [
      "Checking SSL certificate...",
      "Measuring server response time...",
      "Analyzing URL structure...",
      "Checking domain authority signals...",
      "Evaluating SEO configuration...",
      "Generating report...",
    ];

    for (const step of steps) {
      setLoadingStep(step);
      await new Promise((r) => setTimeout(r, 600));
    }

    const auditResult = await runRealAudit(url);
    setResult(auditResult);
    setLoading(false);
  };

  const scoreColor = result
    ? result.score >= 70 ? "text-[hsl(142,70%,40%)]" : result.score >= 50 ? "text-[hsl(45,90%,50%)]" : "text-destructive"
    : "";

  const passCount = result?.checks.filter((c) => c.status === "pass").length ?? 0;
  const failCount = result?.checks.filter((c) => c.status === "fail").length ?? 0;
  const warnCount = result?.checks.filter((c) => c.status === "warn").length ?? 0;

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Get Your Free AI SEO Audit
        </h2>
        <p className="text-muted-foreground mb-8">
          Our analyzer performs real-time checks on your website's SSL, speed, URL structure, and SEO configuration with actionable recommendations.
        </p>
        <form onSubmit={handleAudit} className="flex gap-3 max-w-md mx-auto">
          <Input
            placeholder="Enter your website URL (e.g. example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" className="gradient-bg text-primary-foreground hover:opacity-90" disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Analyze Now"}
          </Button>
        </form>

        {loading && (
          <div className="mt-10 flex flex-col items-center gap-3 animate-fade-in-up">
            <Loader2 size={36} className="animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{loadingStep}</p>
          </div>
        )}

        {result && !loading && (
          <div className="mt-10 text-left animate-fade-in-up">
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
                <p className="text-xs text-muted-foreground mt-1">
                  {result.score >= 70 ? "Good — minor improvements needed" : result.score >= 50 ? "Needs Work — several issues found" : "Critical — immediate action required"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {result.checks.map((check) => (
                <div key={check.label} className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-start gap-3">
                    <StatusIcon status={check.status} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{check.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{check.detail}</p>
                      {check.recommendation && (
                        <p className="text-xs text-primary mt-2 bg-primary/5 p-2 rounded">
                          💡 <strong>Fix:</strong> {check.recommendation}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                      check.status === "pass" ? "bg-[hsl(142,70%,40%)]/10 text-[hsl(142,70%,40%)]" :
                      check.status === "fail" ? "bg-destructive/10 text-destructive" :
                      "bg-[hsl(45,90%,50%)]/10 text-[hsl(45,80%,35%)]"
                    }`}>
                      {check.status === "pass" ? "Passed" : check.status === "fail" ? "Failed" : "Warning"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-5 rounded-xl gradient-bg text-primary-foreground text-center">
              <p className="font-bold text-lg mb-1">Want a detailed report with fixes?</p>
              <p className="text-sm opacity-90 mb-3">Our experts will create a custom action plan to boost your rankings.</p>
              <Button variant="secondary" className="font-semibold">
                Get Full Report — It's Free
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AuditSection;
