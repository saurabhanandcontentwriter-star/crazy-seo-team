import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Within four months we were showing up in Google AI Overviews for our core category terms. Organic pipeline is now our cheapest acquisition channel.",
    name: "Ananya Mehta",
    role: "Head of Growth, B2B SaaS",
  },
  {
    quote:
      "The technical audit found issues three previous agencies missed. Crawl budget, internal linking and schema were fixed in one sprint.",
    name: "Rohit Sharma",
    role: "Marketing Director, E-commerce",
  },
  {
    quote:
      "Their LLM visibility work got us cited in ChatGPT and Perplexity answers. That was not even on our roadmap a year ago.",
    name: "Priya Nair",
    role: "Founder, HealthTech Startup",
  },
  {
    quote:
      "Content velocity tripled without losing quality. Every brief comes with entity coverage and search intent mapped out.",
    name: "Daniel Fitzgerald",
    role: "Content Lead, Fintech",
  },
  {
    quote:
      "Reporting is genuinely board-ready. We stopped arguing about attribution and started making decisions.",
    name: "Karan Verma",
    role: "CMO, Enterprise Services",
  },
  {
    quote:
      "The automation build saved our team roughly twenty hours a week on reporting and publishing.",
    name: "Sofia Alvarez",
    role: "Operations Manager, Agency",
  },
];

const TestimonialsSection = () => (
  <section id="testimonials" className="relative py-24 px-4">
    <div className="container mx-auto max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-[11px] font-semibold text-purple-700">
          <Star size={11} /> Client feedback
        </span>
        <h2 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
          Trusted by teams that{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            measure everything
          </span>
        </h2>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
            whileHover={{ y: -6 }}
            className="relative flex h-full flex-col rounded-2xl border border-slate-200/70 bg-white/70 p-6 backdrop-blur-xl shadow-sm transition-shadow hover:shadow-xl hover:shadow-purple-500/10"
          >
            <Quote className="mb-3 text-blue-500/60" size={22} />
            <blockquote className="flex-1 text-sm leading-relaxed text-slate-700">
              “{t.quote}”
            </blockquote>
            <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-xs font-bold text-white">
                {t.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <figcaption>
                <div className="text-sm font-semibold text-slate-900">{t.name}</div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </figcaption>
            </div>
          </motion.figure>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
