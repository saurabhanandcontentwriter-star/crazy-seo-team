import { motion } from "framer-motion";
import { ArrowRight, Bot, BrainCircuit, ChartNoAxesCombined, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { SaaSFeatureGrid } from "@/components/saas/SaaSFeatureGrid";
import { SaaSPlatformPreview } from "@/components/saas/SaaSPlatformPreview";

export default function SaaSPlatform() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden px-4 pb-20 pt-20 md:px-8 md:pb-28 md:pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.14),transparent_32%),radial-gradient(circle_at_85%_20%,hsl(var(--primary)/0.10),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }} className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 text-sm backdrop-blur"><Sparkles className="h-4 w-4" /> AI-powered growth platform</div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">SEO, AI & Digital Marketing <span className="text-primary">in one SaaS workspace.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">Crazy SEO Team brings SEO intelligence, AI content, automation, analytics and CRM workflows together—while keeping your existing brand experience intact.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/admin" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5">Open Dashboard <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/seo-tools" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/70 px-5 py-3 font-medium backdrop-blur transition-transform hover:-translate-y-0.5">Explore SEO Tools <Search className="h-4 w-4" /></Link>
            </div>
          </motion.div>
          <div className="mt-14"><SaaSPlatformPreview /></div>
        </div>
      </section>
      <section className="px-4 py-16 md:px-8"><div className="mx-auto max-w-7xl"><div className="mb-10 max-w-2xl"><p className="text-sm font-medium text-primary">Built for growth teams</p><h2 className="mt-2 text-3xl font-bold">One platform, multiple growth engines.</h2><p className="mt-3 text-muted-foreground">Start with the tools you need and expand into automation, content, analytics and CRM as your operation grows.</p></div><SaaSFeatureGrid /></div></section>
      <section className="px-4 pb-24 md:px-8"><div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3"><div className="rounded-2xl border border-border/60 bg-card/60 p-6"><BrainCircuit className="h-6 w-6" /><h3 className="mt-4 font-semibold">AI-ready</h3><p className="mt-2 text-sm text-muted-foreground">Designed for search engines and modern answer engines.</p></div><div className="rounded-2xl border border-border/60 bg-card/60 p-6"><ChartNoAxesCombined className="h-6 w-6" /><h3 className="mt-4 font-semibold">Measurable</h3><p className="mt-2 text-sm text-muted-foreground">Track visibility, performance and business outcomes.</p></div><div className="rounded-2xl border border-border/60 bg-card/60 p-6"><ShieldCheck className="h-6 w-6" /><h3 className="mt-4 font-semibold">Operational</h3><p className="mt-2 text-sm text-muted-foreground">Connect repeatable workflows, content and customer growth.</p></div></div></section>
    </main>
  );
}
