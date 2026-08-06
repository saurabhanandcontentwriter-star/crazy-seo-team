import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileDown, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Audit = {
  domain: string;
  seoScore: number;
  aiVisibility: number;
  llmScore: number;
  performance: number;
  accessibility: number;
  bestPractices: number;
  issues: { severity: "high" | "medium" | "low"; title: string; recommendation: string }[];
  competitors: { name: string; seo: number; ai: number }[];
};

const mockAudit = (domain: string): Audit => {
  // Deterministic pseudo-random per domain
  let h = 0;
  for (let i = 0; i < domain.length; i++) h = (h * 31 + domain.charCodeAt(i)) >>> 0;
  const r = (min: number, max: number, salt = 0) => min + (((h + salt) % 1000) / 1000) * (max - min);
  return {
    domain,
    seoScore: Math.round(r(72, 96, 1)),
    aiVisibility: Math.round(r(60, 95, 2)),
    llmScore: Math.round(r(55, 92, 3)),
    performance: Math.round(r(70, 98, 4)),
    accessibility: Math.round(r(80, 99, 5)),
    bestPractices: Math.round(r(75, 96, 6)),
    issues: [
      { severity: "high", title: "Missing structured data (FAQPage schema)", recommendation: "Add FAQPage JSON-LD on top 10 pages to boost AI Overview visibility." },
      { severity: "high", title: "No canonical tags on blog pages", recommendation: "Add <link rel='canonical'> to every indexed URL." },
      { severity: "medium", title: "Thin content on 8 pages (<300 words)", recommendation: "Expand to 800+ words with semantic entities." },
      { severity: "medium", title: "Slow LCP on mobile (3.4s)", recommendation: "Preload hero image and serve WebP/AVIF." },
      { severity: "low", title: "Missing alt text on 12 images", recommendation: "Add descriptive alt text including focus keywords." },
    ],
    competitors: [
      { name: "competitor-a.com", seo: Math.round(r(70, 92, 11)), ai: Math.round(r(55, 88, 12)) },
      { name: "competitor-b.com", seo: Math.round(r(70, 92, 13)), ai: Math.round(r(55, 88, 14)) },
      { name: "competitor-c.com", seo: Math.round(r(70, 92, 15)), ai: Math.round(r(55, 88, 16)) },
    ],
  };
};

const drawScoreBar = (doc: jsPDF, label: string, value: number, x: number, y: number, w: number) => {
  doc.setFontSize(10);
  doc.setTextColor(60);
  doc.text(label, x, y);
  doc.text(`${value}/100`, x + w, y, { align: "right" });
  doc.setFillColor(230, 230, 235);
  doc.roundedRect(x, y + 2, w, 5, 2, 2, "F");
  const color: [number, number, number] = value >= 90 ? [34, 197, 94] : value >= 75 ? [59, 130, 246] : value >= 60 ? [245, 158, 11] : [239, 68, 68];
  doc.setFillColor(...color);
  doc.roundedRect(x, y + 2, (w * value) / 100, 5, 2, 2, "F");
};

const generatePdf = (a: Audit) => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const M = 40;

  // Header band
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, W, 90, "F");
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 80, W, 10, "F");
  doc.setTextColor(255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Crazy SEO Team", M, 38);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("AI-Powered SEO, GEO, AEO & LLM Visibility Report", M, 56);
  doc.setFontSize(9);
  doc.text(`Generated ${new Date().toLocaleString()}`, W - M, 38, { align: "right" });

  // Title block
  let y = 120;
  doc.setTextColor(20);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Website SEO & AI Visibility Audit", M, y);
  y += 22;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80);
  doc.text(`Domain: ${a.domain}`, M, y);
  y += 30;

  // Scores
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20);
  doc.text("Overall Scores", M, y);
  y += 14;
  const colW = (W - M * 2 - 20) / 2;
  const scores: [string, number][] = [
    ["SEO Score", a.seoScore],
    ["AI Visibility (Overview/ChatGPT/Gemini)", a.aiVisibility],
    ["LLM Optimization Score", a.llmScore],
    ["Performance", a.performance],
    ["Accessibility", a.accessibility],
    ["Best Practices", a.bestPractices],
  ];
  scores.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    drawScoreBar(doc, s[0], s[1], M + col * (colW + 20), y + row * 28, colW);
  });
  y += Math.ceil(scores.length / 2) * 28 + 18;

  // Issues table
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Recommendations & Issues", M, y);
  y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Severity", "Issue", "Recommendation"]],
    body: a.issues.map((i) => [i.severity.toUpperCase(), i.title, i.recommendation]),
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 6 },
    columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 180 } },
    margin: { left: M, right: M },
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  if (y > 700) { doc.addPage(); y = 60; }

  // Competitors
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20);
  doc.text("Competitor Snapshot", M, y);
  y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Competitor", "SEO Score", "AI Visibility"]],
    body: a.competitors.map((c) => [c.name, c.seo, c.ai]),
    headStyles: { fillColor: [124, 58, 237], textColor: 255 },
    styles: { fontSize: 10, cellPadding: 6 },
    margin: { left: M, right: M },
  });

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setDrawColor(220);
    doc.line(M, 800, W - M, 800);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text("Crazy SEO Team — crazyseoteam.in · AI-Powered SEO, GEO, AEO & LLM Optimization", M, 815);
    doc.text(`Page ${p} of ${pageCount}`, W - M, 815, { align: "right" });
  }

  doc.save(`${a.domain.replace(/[^a-z0-9]/gi, "-")}-seo-audit.pdf`);
};

const exportCsv = (a: Audit) => {
  const rows = [
    ["Metric", "Score"],
    ["SEO Score", a.seoScore],
    ["AI Visibility", a.aiVisibility],
    ["LLM Score", a.llmScore],
    ["Performance", a.performance],
    ["Accessibility", a.accessibility],
    ["Best Practices", a.bestPractices],
    [],
    ["Severity", "Issue", "Recommendation"],
    ...a.issues.map((i) => [i.severity, i.title, i.recommendation]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a2 = document.createElement("a");
  a2.href = url;
  a2.download = `${a.domain}-report.csv`;
  a2.click();
  URL.revokeObjectURL(url);
};

const Reports = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [domain, setDomain] = useState("");
  const [generating, setGenerating] = useState(false);
  const [audit, setAudit] = useState<Audit | null>(null);

  // Access control is handled by AdminGuard on the /admin route.


  const run = async () => {
    const d = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
    if (!d) {
      toast.error("Enter a domain like example.com");
      return;
    }
    setGenerating(true);
    // Simulate AI audit; could be swapped with edge function later
    await new Promise((r) => setTimeout(r, 800));
    const a = mockAudit(d);
    setAudit(a);
    setGenerating(false);
    toast.success(`Audit ready for ${d}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>PDF Report Center — Crazy SEO Team Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm"><Link to="/admin/analytics"><ArrowLeft className="w-4 h-4 mr-1" /> Analytics</Link></Button>
            <h1 className="text-xl font-bold text-foreground">PDF Report Center</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Generate Branded SEO + AI Visibility Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <Label htmlFor="domain">Website</Label>
                <Input id="domain" placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} />
              </div>
              <Button onClick={run} disabled={generating} size="lg">
                {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Run Audit
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Generates SEO, AI Visibility, LLM Optimization, Performance, Accessibility & Best Practices scores
              with recommendations and competitor snapshots — exportable as branded PDF or CSV.
            </p>
          </CardContent>
        </Card>

        {audit && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Audit Preview · {audit.domain}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => exportCsv(audit)}><FileDown className="w-4 h-4 mr-2" />CSV</Button>
                <Button size="sm" onClick={() => generatePdf(audit)}><FileDown className="w-4 h-4 mr-2" />Download PDF</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  ["SEO Score", audit.seoScore],
                  ["AI Visibility", audit.aiVisibility],
                  ["LLM Score", audit.llmScore],
                  ["Performance", audit.performance],
                  ["Accessibility", audit.accessibility],
                  ["Best Practices", audit.bestPractices],
                ].map(([label, v]) => {
                  const value = v as number;
                  const color = value >= 90 ? "text-emerald-500" : value >= 75 ? "text-primary" : value >= 60 ? "text-amber-500" : "text-destructive";
                  return (
                    <div key={label as string} className="p-4 rounded-xl border border-border bg-card">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{label}</p>
                      <p className={`text-3xl font-black ${color} mt-1`}>{value}<span className="text-base text-muted-foreground font-medium">/100</span></p>
                    </div>
                  );
                })}
              </div>

              <div>
                <h3 className="font-bold text-foreground mb-2">Top Recommendations</h3>
                <div className="space-y-2">
                  {audit.issues.map((i, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-border bg-card text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${i.severity === "high" ? "bg-destructive/15 text-destructive" : i.severity === "medium" ? "bg-amber-500/15 text-amber-500" : "bg-primary/15 text-primary"}`}>{i.severity}</span>
                        <span className="font-semibold text-foreground">{i.title}</span>
                      </div>
                      <p className="text-muted-foreground text-xs ml-1">{i.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Reports;
