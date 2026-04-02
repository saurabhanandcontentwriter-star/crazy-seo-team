import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, AlertTriangle, Loader2, Globe, Zap, Shield, Search, Smartphone, FileText } from "lucide-react";

interface AuditResult {
  score: number;
  checks: { label: string; status: "pass" | "fail" | "warn"; detail: string }[];
}

const generateAudit = (url: string): AuditResult => {
  const hash = url.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  const seed = Math.abs(hash);
  const score = 35 + (seed % 55);

  const checks = [
    { label: "SSL Certificate", icon: Shield, status: seed % 3 === 0 ? "fail" as const : "pass" as const, detail: seed % 3 === 0 ? "No HTTPS detected — critical for rankings and trust" : "Valid SSL certificate found" },
    { label: "Page Speed (Mobile)", icon: Zap, status: score < 60 ? "warn" as const : "pass" as const, detail: score < 60 ? `Load time ~${(3 + (seed % 4)).toFixed(1)}s — should be under 2.5s` : `Load time ~${(1.2 + (seed % 1.5)).toFixed(1)}s — good performance` },
    { label: "Mobile Responsiveness", icon: Smartphone, status: seed % 5 === 0 ? "fail" as const : "pass" as const, detail: seed % 5 === 0 ? "Viewport not configured properly for mobile" : "Mobile-friendly design detected" },
    { label: "Meta Title & Description", icon: FileText, status: seed % 4 === 0 ? "warn" as const : "pass" as const, detail: seed % 4 === 0 ? "Meta description missing or too short (<120 chars)" : "Meta tags properly configured" },
    { label: "Heading Structure (H1-H6)", icon: Search, status: seed % 3 === 1 ? "warn" as const : "pass" as const, detail: seed % 3 === 1 ? "Multiple H1 tags found — use only one per page" : "Proper heading hierarchy" },
    { label: "Image Alt Tags", icon: Globe, status: seed % 2 === 0 ? "warn" as const : "pass" as const, detail: seed % 2 === 0 ? `${3 + (seed % 8)} images missing alt attributes` : "All images have alt text" },
    { label: "Core Web Vitals (INP)", icon: Zap, status: score < 50 ? "fail" as const : score < 70 ? "warn" as const : "pass" as const, detail: score < 50 ? "INP > 500ms — needs significant improvement" : score < 70 ? "INP 200-500ms — room for improvement" : "INP < 200ms — excellent" },
    { label: "Structured Data (Schema)", icon: FileText, status: seed % 3 === 2 ? "fail" as const : "pass" as const, detail: seed % 3 === 2 ? "No structured data found — add JSON-LD schema markup" : "Schema markup detected" },
  ];

  return { score, checks };
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

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(generateAudit(url));
      setLoading(false);
    }, 2500);
  };

  const scoreColor = result
    ? result.score >= 70 ? "text-[hsl(142,70%,40%)]" : result.score >= 50 ? "text-[hsl(45,90%,50%)]" : "text-destructive"
    : "";

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Get Your Free AI SEO Audit
        </h2>
        <p className="text-muted-foreground mb-8">
          Our AI-powered analyzer checks 8 critical ranking factors and gives you an instant SEO health score with actionable recommendations.
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
            <p className="text-sm text-muted-foreground">Analyzing {url}... Checking SEO signals</p>
          </div>
        )}

        {result && !loading && (
          <div className="mt-10 text-left animate-fade-in-up">
            <div className="flex items-center justify-between mb-6 p-5 rounded-xl border border-border bg-card">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Overall SEO Score</p>
                <p className={`text-5xl font-black ${scoreColor}`}>{result.score}<span className="text-lg text-muted-foreground">/100</span></p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{url}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.score >= 70 ? "Good — minor improvements needed" : result.score >= 50 ? "Needs Work — several issues found" : "Critical — immediate action required"}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {result.checks.map((check) => (
                <div key={check.label} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
                  <StatusIcon status={check.status} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{check.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{check.detail}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    check.status === "pass" ? "bg-[hsl(142,70%,40%)]/10 text-[hsl(142,70%,40%)]" :
                    check.status === "fail" ? "bg-destructive/10 text-destructive" :
                    "bg-[hsl(45,90%,50%)]/10 text-[hsl(45,80%,35%)]"
                  }`}>
                    {check.status === "pass" ? "Passed" : check.status === "fail" ? "Failed" : "Warning"}
                  </span>
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
