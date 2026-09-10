import { motion } from "framer-motion";
import { BarChart3, Bot, FileText, Gauge, GitCompare, Users } from "lucide-react";

const features = [
  { icon: Gauge, title: "SEO Intelligence", text: "Track technical health, visibility, semantic relevance and performance in one workspace." },
  { icon: Bot, title: "AI Content Studio", text: "Create, optimize and refresh search-ready content with AI-assisted workflows." },
  { icon: GitCompare, title: "Competitor Intelligence", text: "Compare competitors, content gaps and search opportunities from one dashboard." },
  { icon: FileText, title: "SEO Audit Reports", text: "Turn website audits into actionable reports with priorities, fixes and export-ready insights." },
  { icon: BarChart3, title: "Analytics", text: "Understand traffic, rankings, campaigns and tool usage with clear visual reporting." },
  { icon: Users, title: "CRM & Growth", text: "Connect leads, contacts, deals, follow-ups and marketing operations in one place." },
];

export function SaaSFeatureGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {features.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.article key={item.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }} whileHover={{ y: -5 }} className="group rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur transition-shadow hover:shadow-xl">
            <div className="mb-5 inline-flex rounded-xl border border-border/60 bg-background/70 p-3 transition-transform group-hover:scale-105"><Icon className="h-5 w-5" /></div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
          </motion.article>
        );
      })}
    </section>
  );
}
