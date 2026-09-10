import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";

const stats = [
  ["SEO Health", "94%", "↑ 8.2%"],
  ["AI Visibility", "91%", "↑ 12.4%"],
  ["LLM Optimization", "88%", "↑ 9.1%"],
  ["Active Leads", "126", "↑ 18"],
];

export function SaaSPlatformPreview() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-4 shadow-2xl backdrop-blur-xl md:p-6">
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
          <div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Campaign overview</p><h3 className="mt-1 text-xl font-semibold">Organic Growth</h3></div><Sparkles className="h-5 w-5" /></div>
          <div className="mt-7 flex items-end gap-2 h-32">
            {[34, 46, 42, 58, 63, 72, 82, 94].map((height, i) => <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${height}%` }} viewport={{ once: true }} transition={{ duration: .6, delay: i * .05 }} className="flex-1 rounded-t-lg bg-primary/70" />)}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4" /> 24 opportunities found this week</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(([label, value, trend]) => <motion.div key={label} whileHover={{ scale: 1.02 }} className="rounded-2xl border border-border/60 bg-background/70 p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{trend}</p></motion.div>)}
        </div>
      </div>
    </div>
  );
}
