import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
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
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (!service) return <NotFound />;

  const related = services.filter((s) => s.category === service.category && s.slug !== service.slug).slice(0, 3);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: { "@type": "Organization", name: "Crazy SEO Team" },
    areaServed: "Worldwide",
    category: service.category,
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{service.metaTitle}</title>
        <meta name="description" content={service.metaDescription} />
        <link rel="canonical" href={`/services/${service.slug}`} />
        <meta property="og:title" content={service.metaTitle} />
        <meta property="og:description" content={service.metaDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Navbar />

      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-30" style={{ background: "var(--gradient-primary)" }} />
          <div className="container mx-auto px-4 py-20 max-w-5xl">
            <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-foreground">Home</Link> /{" "}
              <Link to="/services" className="hover:text-foreground">Services</Link> /{" "}
              <span className="text-foreground">{service.title}</span>
            </nav>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-semibold text-primary mb-4">
              <Sparkles size={14} /> {service.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-foreground mb-4 leading-tight">
              {service.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl">{service.tagline}</p>
            <p className="text-base text-muted-foreground mb-8 max-w-3xl leading-relaxed">{service.description}</p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gradient-bg text-primary-foreground" onClick={() => setDialogOpen(true)}>
                Get a Free Strategy Call <ArrowRight className="ml-2" size={18} />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setDialogOpen(true)}>
                Request Pricing
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-10 text-center">What's Included</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {service.features.map((f) => (
                <Card key={f} className="border-border">
                  <CardContent className="p-5 flex items-start gap-3">
                    <CheckCircle2 className="text-primary flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-foreground">{f}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Deliverables */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-10 text-center">What You Get</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {service.deliverables.map((d, i) => (
                <Card key={d} className="border-border">
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center text-primary-foreground font-bold">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-foreground">{d}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-10 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {service.faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-5xl">
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-8">Related Services</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link key={r.slug} to={`/services/${r.slug}`}>
                    <Card className="border-border hover:border-primary transition-colors h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">{r.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{r.tagline}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="rounded-2xl p-10 md:p-16 border border-border" style={{ background: "var(--gradient-cta)" }}>
              <h2 className="text-3xl md:text-5xl font-black text-primary-foreground mb-4">
                Ready to scale with {service.title}?
              </h2>
              <p className="text-primary-foreground/90 text-lg mb-8">
                Get a free audit and custom strategy from our specialists.
              </p>
              <Button size="lg" variant="secondary" onClick={() => setDialogOpen(true)}>
                Book Your Free Audit <ArrowRight className="ml-2" size={18} />
              </Button>
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
        description="Tell us about your goals and we'll respond within 24 hours with a custom plan."
      />
    </div>
  );
};

export default ServiceDetail;
