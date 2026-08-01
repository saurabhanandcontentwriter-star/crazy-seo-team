import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, Sparkles, Bot, BrainCircuit, Megaphone, LineChart,
  Gauge, Building2, PenLine, Layers, Code2, Workflow, ArrowRight,
} from "lucide-react";

const items = [
  { icon: Search, title: "AI SEO", desc: "Rank in Google and in AI answers with entity-first optimization.", slug: "technical-seo" },
  { icon: Sparkles, title: "GEO Optimization", desc: "Generative Engine Optimization for AI Overviews and assistants.", slug: "geo-optimization" },
  { icon: BrainCircuit, title: "AEO Optimization", desc: "Answer Engine Optimization built around real user questions.", slug: "aeo-optimization" },
  { icon: Bot, title: "LLM Optimization", desc: "Get cited by ChatGPT, Gemini, Claude and Perplexity.", slug: "llm-seo-optimization" },
  { icon: Megaphone, title: "Google Ads", desc: "Search, Performance Max and shopping campaigns that convert.", slug: "google-search-ads" },
  { icon: LineChart, title: "Performance Marketing", desc: "Full-funnel paid growth with clean attribution.", slug: "conversion-tracking" },
  { icon: Gauge, title: "SEO Audit", desc: "180-point technical, content and AI-visibility audit.", slug: "technical-seo-audits" },
  { icon: Building2, title: "Enterprise SEO", desc: "Governance, scale and stakeholder-ready reporting.", slug: "semantic-seo" },
  { icon: PenLine, title: "Content Marketing", desc: "Editorial systems that compound organic traffic.", slug: "monthly-blog-management" },
  { icon: Layers, title: "Programmatic SEO", desc: "Template-driven pages built at scale, safely.", slug: "entity-seo" },
  { icon: Code2, title: "AI Software Development", desc: "Custom SaaS, dashboards and integrations.", slug: "custom-saas-development" },
  { icon: Workflow, title: "AI Automation & Agents", desc: "Agents and workflows that remove manual work.", slug: "ai-agents" },
];

const ServicesPreview = () => (
  <section id="services" className="relative py-24 px-4">
    <div className="container mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
          <Sparkles size={11} /> What we do
        </span>
        <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
          Services built for{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI-era search
          </span>
        </h2>
        <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
          From technical SEO to AI agents — one team covering visibility, content, ads and software.
        </p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
            whileHover={{ y: -6 }}
            className="group relative"
          >
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-blue-500/40 via-indigo-500/30 to-purple-500/40 opacity-0 blur transition-opacity duration-300 group-hover:opacity-100" />
            <Link
              to={`/services/${item.slug}`}
              className="relative flex h-full flex-col rounded-2xl border border-slate-200/70 bg-white/70 p-6 backdrop-blur-xl shadow-sm transition-shadow group-hover:shadow-xl group-hover:shadow-blue-500/10"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <item.icon size={20} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600">
                Learn more
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:opacity-95"
        >
          View all services <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  </section>
);

export default ServicesPreview;
