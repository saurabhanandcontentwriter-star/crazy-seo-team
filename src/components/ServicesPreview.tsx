import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const journey = [
  { step: "01", title: "Search", desc: "People look for a solution with real intent." },
  { step: "02", title: "AI Answer", desc: "AI helps them discover and compare options." },
  { step: "03", title: "Content", desc: "They explore useful information before deciding." },
  { step: "04", title: "Trust", desc: "Proof, expertise and consistency build confidence." },
  { step: "05", title: "Visit", desc: "They arrive at your digital experience." },
  { step: "06", title: "Convert", desc: "Attention becomes a meaningful business action." },
];

const ServicesPreview = () => (
  <section id="services" className="relative overflow-hidden py-24 px-4 bg-background">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
    </div>

    <div className="relative container mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
          <Sparkles size={11} /> How it works
        </span>
        <h2 className="mt-4 text-3xl md:text-5xl font-black tracking-tight text-foreground">
          How People <span className="gradient-text">Find You</span>
        </h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-7">
          The journey from first search to final decision — across search, AI, content, trust and conversion.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="mb-10 overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-xl"
      >
        <img
          src="/images/how-people-find-you.svg"
          alt="How people find your brand: Search, AI Answer, Content, Trust, Visit and Convert"
          width="1600"
          height="620"
          loading="lazy"
          className="block h-auto w-full"
        />
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {journey.map((item, i) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: (i % 3) * 0.07 }}
            whileHover={{ y: -5 }}
            className="group rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <span className="text-xs font-black tracking-widest text-primary">{item.step}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-bold group-hover:text-primary transition-colors">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesPreview;
