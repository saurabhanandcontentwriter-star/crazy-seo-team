import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Check, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ContactFormDialog from "@/components/ContactFormDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Starter",
    price: "₹24,999",
    period: "/ month",
    desc: "For small businesses launching their SEO.",
    features: [
      "10 target keywords",
      "On-page SEO (15 pages)",
      "4 SEO blog posts / month",
      "Google Business Profile setup",
      "Monthly ranking report",
    ],
    highlighted: false,
  },
  {
    name: "Growth",
    price: "₹59,999",
    period: "/ month",
    desc: "Our most popular plan for scaling brands.",
    features: [
      "30 target keywords",
      "Full technical SEO audit",
      "8 SEO + AI-optimized blogs / month",
      "AI SEO (ChatGPT, Gemini, Perplexity)",
      "Authority link building (10/mo)",
      "Bi-weekly strategy calls",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For multi-location & high-growth companies.",
    features: [
      "Unlimited keywords",
      "Dedicated SEO & AI SEO team",
      "20+ content pieces / month",
      "Custom dashboards & reporting",
      "API & CRM integrations",
      "Priority support",
    ],
    highlighted: false,
  },
];

const Pricing = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [planName, setPlanName] = useState("");

  const openDialog = (name: string) => {
    setPlanName(name);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing — Crazy SEO Team | SEO & AI SEO Plans 2026</title>
        <meta name="description" content="Transparent SEO and AI SEO pricing. Starter, Growth, and Enterprise plans built for businesses scaling in Google and AI search." />
        <link rel="canonical" href="/pricing" />
      </Helmet>

      <Navbar />

      <main className="pt-16">
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-semibold text-primary mb-4">
              <Sparkles size={14} /> Pricing
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-foreground mb-4">Plans for every stage of growth</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
              Transparent monthly pricing. No long contracts. Cancel anytime after the first 3 months.
            </p>

            <div className="grid md:grid-cols-3 gap-6 text-left">
              {plans.map((p) => (
                <Card
                  key={p.name}
                  className={`border-border relative ${p.highlighted ? "ring-2 ring-primary shadow-xl scale-[1.02]" : ""}`}
                >
                  {p.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-primary-foreground gradient-bg">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{p.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{p.desc}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-black text-foreground">{p.price}</span>
                      <span className="text-muted-foreground">{p.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check size={18} className="text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${p.highlighted ? "gradient-bg text-primary-foreground" : ""}`}
                      variant={p.highlighted ? "default" : "outline"}
                      onClick={() => openDialog(p.name)}
                    >
                      {p.name === "Enterprise" ? "Talk to Sales" : "Get Started"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mt-12">
              Need something custom?{" "}
              <button onClick={() => openDialog("Custom plan")} className="text-primary font-semibold hover:underline">
                Request a custom quote
              </button>
            </p>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
      <ContactFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={planName ? `Start with the ${planName} plan` : "Get pricing"}
        description="Share a few details and our team will follow up with onboarding next steps."
      />
    </div>
  );
};

export default Pricing;
