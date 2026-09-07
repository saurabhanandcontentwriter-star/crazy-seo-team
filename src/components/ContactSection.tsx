import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MessageCircle,
  CalendarClock,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ContactFormDialog from "@/components/ContactFormDialog";

const WHATSAPP = "916205153346";

const channels = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+91 62051 53346",
    href: `https://wa.me/${WHATSAPP}`,
    external: true,
  },
  {
    icon: Phone,
    label: "Call us",
    value: "+91 62051 53346",
    href: "tel:+916205153346",
    external: false,
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@crazyseoteam.in",
    href: "mailto:hello@crazyseoteam.in",
    external: false,
  },
  {
    icon: CalendarClock,
    label: "Book a strategy call",
    value: "30-minute AI visibility audit",
    href: null,
    external: false,
  },
];

const ContactSection = () => {
  const [open, setOpen] = useState(false);

  return (
    <section id="contact" className="relative py-24 px-4">
      <div className="container mx-auto max-w-6xl">

        <div className="relative overflow-hidden glass-card border border-slate-200/50 bg-white/60 p-8 md:p-12 backdrop-blur-xl shadow-xl shadow-blue-500/5">

          {/* Background Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-400/25 to-purple-400/25 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-400/20 to-indigo-400/20 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">

            {/* LEFT SIDE */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                <MapPin size={11} />
                Working with brands worldwide
              </span>

              <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Let's map your{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI search visibility
                </span>
              </h2>

              <p className="mt-4 text-slate-600 leading-relaxed">
                Tell us your goals and we'll come back within 24 hours with a
                custom plan covering Google, AI Overviews, ChatGPT, Gemini,
                Claude and Perplexity.
              </p>

              <Button
                onClick={() => setOpen(true)}
                size="lg"
                className="mt-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:opacity-95"
              >
                Start free audit
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </motion.div>

            {/* CONTACT CHANNELS */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid gap-3 sm:grid-cols-2"
            >
              {channels.map((c) => {
                const inner = (
                  <>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md shadow-blue-500/25">
                      <c.icon size={18} />
                    </div>

                    <div className="text-sm font-semibold text-slate-900">
                      {c.label}
                    </div>

                    <div className="mt-0.5 text-xs text-slate-600">
                      {c.value}
                    </div>
                  </>
                );

                const cls =
                  "block h-full rounded-2xl border border-slate-200/70 bg-white/80 p-5 text-left backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10";

                if (c.href) {
                  return (
                    <a
                      key={c.label}
                      href={c.href}
                      target={c.external ? "_blank" : undefined}
                      rel={
                        c.external
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className={cls}
                    >
                      {inner}
                    </a>
                  );
                }

                return (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => setOpen(true)}
                    className={cls}
                  >
                    {inner}
                  </button>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>

      {/* CONTACT FORM */}
      <ContactFormDialog
        open={open}
        onOpenChange={setOpen}
        title="Book Your Free AI Visibility Audit"
        description="Share your details and our strategists will respond within 24 hours."
      />
    </section>
  );
};

export default ContactSection;

export default ContactSection;
