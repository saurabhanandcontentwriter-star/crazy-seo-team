import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleCheck,
  Layers3,
  MessageCircle,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ContactFormDialog from "@/components/ContactFormDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import NotFound from "@/pages/NotFound";
import { getServiceBySlug, services } from "@/data/services";

const ServiceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? getServiceBySlug(slug) : undefined;
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  if (!service) return <NotFound />;

  const related = services
    .filter((item) => item.category === service.category && item.slug !== service.slug)
    .slice(0, 3);

  const openContact = () => setDialogOpen(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="pt-[116px]">
        {/* Hero */}
        <section className="relative isolate overflow-hidden border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
            <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          </div>

          <div className="container mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20">
            <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-foreground" aria-label="Breadcrumb">
              <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
              <ChevronRight size={13} />
              <Link to="/services" className="transition-colors hover:text-foreground">Services</Link>
              <ChevronRight size={13} />
              <span className="text-foreground">{service.title}</span>
            </nav>

            <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                  <Sparkles size={13} />
                  {service.category}
                </div>

                <h1 className="max-w-4xl text-4xl font-black tracking-[-0.04em] text-foreground md:text-6xl lg:text-7xl">
                  {service.title}
                </h1>

                <p className="mt-5 max-w-3xl text-xl font-semibold leading-8 text-foreground/80 md:text-2xl">
                  {service.tagline}
                </p>

                <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                  {service.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button size="lg" className="gradient-bg text-primary-foreground shadow-lg shadow-primary/20" onClick={openContact}>
                    Get a Free Strategy Call
                    <ArrowRight className="ml-2" size={18} />
                  </Button>
                  <Button size="lg" variant="outline" className="bg-background/70" onClick={openContact}>
                    Request Pricing
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-muted-foreground">
                  <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-primary" /> Transparent reporting</span>
                  <span className="inline-flex items-center gap-2"><Target size={15} className="text-primary" /> Strategy-led execution</span>
                  <span className="inline-flex items-center gap-2"><Rocket size={15} className="text-primary" /> Built for measurable growth</span>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-[2rem] border border-border/70 bg-card/80 p-3 shadow-2xl backdrop-blur-xl">
                  <div className="rounded-[1.5rem] border border-primary/10 bg-gradient-to-br from-primary/10 via-background to-violet-500/10 p-6 md:p-8">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-primary">Service System</span>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold text-emerald-600">Growth Ready</span>
                    </div>

                    <div className="mt-8 grid gap-3">
                      {[
                        [Layers3, "Strategy", "Research, intent and priorities"],
                        [CircleCheck, "Execution", "Focused delivery and optimization"],
                        [MessageCircle, "Reporting", "Clear insights and next actions"],
                      ].map(([Icon, title, text]) => (
                        <div key={title as string} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/75 p-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{title as string}</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{text as string}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">Focus</p>
                      <p className="mt-2 text-lg font-black">{service.title}</p>
                      <p className="mt-1 text-xs leading-5 text-white/65">Google + AI search visibility, conversion and sustainable growth.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Overview / value */}
        <section className="border-b border-border/60 bg-card/25 py-14 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="mb-10 max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">What&apos;s Included</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">A focused system, not a generic package.</h2>
              <p className="mt-4 text-muted-foreground md:text-lg">
                Every service is structured around the actual work required to improve visibility, authority, acquisition or operational efficiency.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {service.features.slice(0, 8).map((feature, index) => (
                <Card key={feature} className="group border-border/70 bg-background/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-black text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="pt-1 text-sm font-bold leading-6 text-foreground">{feature}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Deliverables */}
        <section className="py-14 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
              <div className="lg:sticky lg:top-28">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Deliverables</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">What you get.</h2>
                <p className="mt-4 leading-7 text-muted-foreground">
                  Clear outputs designed to make the engagement easy to understand, execute and measure.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {service.deliverables.map((deliverable, index) => (
                  <div key={deliverable} className="rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl gradient-bg text-sm font-black text-primary-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <p className="font-bold text-foreground">{deliverable}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Working model */}
        <section className="border-y border-border/60 bg-secondary/20 py-14 md:py-20">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">How It Works</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">From discovery to measurable execution.</h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                ["01", "Discover", "Understand your goals, market, audience and current performance."],
                ["02", "Build", "Turn research into a prioritized strategy and implementation plan."],
                ["03", "Optimize", "Measure results, learn from the data and continuously improve."],
              ].map(([number, title, text]) => (
                <div key={number} className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
                  <span className="text-xs font-black tracking-[0.2em] text-primary">{number}</span>
                  <h3 className="mt-3 text-xl font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 md:py-20">
          <div className="container mx-auto max-w-4xl px-4 md:px-6">
            <div className="mb-8 text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">FAQ</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Questions about {service.title}?</h2>
            </div>

            <Accordion type="single" collapsible className="w-full rounded-2xl border border-border/70 bg-card px-5 md:px-7">
              {service.faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-bold">{faq.q}</AccordionTrigger>
                  <AccordionContent className="leading-7 text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-border/60 bg-card/20 py-14 md:py-20">
            <div className="container mx-auto max-w-7xl px-4 md:px-6">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Explore More</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Related {service.category}</h2>
                </div>
                <Link to="/services" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                  View all services <ArrowRight size={15} />
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {related.map((item) => (
                  <Link key={item.slug} to={`/services/${item.slug}`} className="group">
                    <Card className="h-full border-border/70 bg-background transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/30 group-hover:shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-6 text-muted-foreground">{item.tagline}</p>
                        <span className="mt-5 inline-flex items-center gap-1 text-xs font-black text-primary">
                          Explore <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="px-4 py-16 md:py-24">
          <div className="container mx-auto max-w-6xl">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 px-6 py-12 text-center shadow-2xl md:px-12 md:py-16">
              <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                  <Sparkles size={12} /> Ready to grow?
                </span>
                <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-black tracking-tight text-white md:text-5xl">
                  Build a stronger growth system with {service.title}.
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
                  Tell us your goals. We&apos;ll map the opportunity, explain the work and outline the next practical steps.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button size="lg" onClick={openContact} className="bg-white text-slate-950 hover:bg-white/90">
                    Book a Free Strategy Call <ArrowRight className="ml-2" size={18} />
                  </Button>
                  <Link to="/services">
                    <Button size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                      Browse All Services
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <ContactFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={`Get Started with ${service.title}`}
        description="Tell us about your goals and we'll respond within 24 hours with a focused plan."
      />
    </div>
  );
};

export default ServiceDetail;
