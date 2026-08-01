import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, FileText, Shield, Bot, Globe2, MessageSquareQuote, Tag,
  Code2, FileCode, Map, Eye, Users, CalendarDays, Link2, Cpu, ArrowRight, Sparkles,
} from "lucide-react";
import ContactFormDialog from "@/components/ContactFormDialog";

type Tool = {
  title: string;
  desc: string;
  icon: typeof Search;
  action:
    | { kind: "scroll"; to: string }
    | { kind: "route"; to: string }
    | { kind: "request" };
  badge?: string;
};

const TOOLS: Tool[] = [
  { title: "Keyword Research", desc: "Discover high-intent keywords with volume, difficulty & CPC.", icon: Search, action: { kind: "scroll", to: "seo-tools-interactive" }, badge: "Live" },
  { title: "AI Article Generator", desc: "Long-form, SEO-optimized articles powered by Gemini.", icon: FileText, action: { kind: "route", to: "/ai-tools" }, badge: "Live" },
  { title: "Website Audit", desc: "Full technical SEO health check with prioritized fixes.", icon: Shield, action: { kind: "scroll", to: "seo-tools-interactive" }, badge: "Live" },
  { title: "LLM Checker", desc: "See how ChatGPT, Gemini & Claude describe your brand.", icon: Bot, action: { kind: "request" } },
  { title: "GEO Checker", desc: "Generative Engine Optimization visibility score.", icon: Globe2, action: { kind: "request" } },
  { title: "AEO Checker", desc: "Answer Engine readiness — snippets, PAA, voice.", icon: MessageSquareQuote, action: { kind: "request" } },
  { title: "Meta Generator", desc: "AI-crafted title tags & meta descriptions that earn clicks.", icon: Tag, action: { kind: "route", to: "/ai-tools" } },
  { title: "Schema Generator", desc: "Structured data JSON-LD for Article, FAQ, Product, LocalBiz.", icon: Code2, action: { kind: "route", to: "/ai-tools" } },
  { title: "Robots.txt Generator", desc: "Production-ready robots.txt with crawl rules.", icon: FileCode, action: { kind: "route", to: "/ai-tools" } },
  { title: "Sitemap Generator", desc: "XML sitemap generation for any site.", icon: Map, action: { kind: "route", to: "/ai-tools" } },
  { title: "SERP Preview", desc: "Preview your Google SERP snippet before publishing.", icon: Eye, action: { kind: "route", to: "/ai-tools" } },
  { title: "Competitor Analysis", desc: "Benchmark keywords, backlinks & content vs rivals.", icon: Users, action: { kind: "request" } },
  { title: "Content Planner", desc: "Data-driven editorial calendar with topical clusters.", icon: CalendarDays, action: { kind: "request" } },
  { title: "Internal Link Generator", desc: "Discover contextual internal linking opportunities.", icon: Link2, action: { kind: "request" } },
  { title: "NLP Analyzer", desc: "Entity, sentiment & topic analysis for any content.", icon: Cpu, action: { kind: "request" } },
];

const SEOToolsGrid = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requested, setRequested] = useState<string>("");

  const handleClick = (tool: Tool) => {
    if (tool.action.kind === "scroll") {
      document.getElementById(tool.action.to)?.scrollIntoView({ behavior: "smooth" });
    } else if (tool.action.kind === "request") {
      setRequested(tool.title);
      setDialogOpen(true);
    }
  };

  return (
    <>
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Mesh backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-40"
          style={{ background: "radial-gradient(600px circle at 20% 10%, hsl(230 90% 50% / 0.25), transparent 60%), radial-gradient(500px circle at 80% 80%, hsl(280 90% 60% / 0.22), transparent 60%)" }} />

        <div className="container mx-auto max-w-7xl relative">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-200 bg-cyan-50 text-xs font-semibold text-cyan-700 mb-4">
              <Sparkles size={14} /> Free SEO Toolkit
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              15 Enterprise SEO Tools —{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Free Forever
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Rank on Google, ChatGPT, Gemini, Claude & Perplexity. Instant results — no signup required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const inner = (
                <div className="group relative h-full glass-card glass-sheen p-6">
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ background: "linear-gradient(135deg, hsl(230 90% 50% / 0.08), hsl(280 90% 60% / 0.08))" }} />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_8px_30px_-8px_hsl(230_90%_60%/0.7)]">
                        <Icon size={22} className="text-white" />
                      </div>
                      {tool.badge && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 uppercase tracking-wider">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{tool.title}</h3>
                    <p className="text-sm text-slate-600 mb-5 leading-relaxed">{tool.desc}</p>
                    <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:text-violet-600 transition-colors">
                      {tool.action.kind === "request" ? "Request Access" : "Open Tool"}
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );

              if (tool.action.kind === "route") {
                return <Link key={tool.title} to={tool.action.to}>{inner}</Link>;
              }
              return (
                <button
                  key={tool.title}
                  onClick={() => handleClick(tool)}
                  className="text-left h-full"
                >
                  {inner}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <ContactFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={requested ? `Request access to ${requested}` : "Request tool access"}
        description="Our team will reach out within 24 hours to give you free access to this enterprise tool."
      />
    </>
  );
};

export default SEOToolsGrid;
