import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const categories = [
  { label: "Digital Marketing", value: "dm" },
  { label: "Web Development", value: "web" },
  { label: "AI Development", value: "ai" },
  { label: "Cold Calling", value: "cold" },
];

const faqs: Record<string, { q: string; a: string }[]> = {
  dm: [
    { q: "What is SEO and why does my business need it?", a: "SEO (Search Engine Optimization) improves your website's visibility on search engines like Google. It drives organic traffic, builds brand authority, and connects you with customers actively searching for your services." },
    { q: "How long does it take to see results from SEO?", a: "SEO is a long-term strategy. While technical fixes show quick impact, significant rankings and traffic growth typically take 3–6 months depending on competition and consistency." },
    { q: "What is the difference between On-Page and Off-Page SEO?", a: "On-Page SEO covers optimizations on your site (content, meta tags, speed). Off-Page SEO involves external activities like link building, social signals, and brand mentions to boost authority." },
    { q: "Do you guarantee a #1 ranking on Google?", a: "No ethical agency guarantees #1 rankings since algorithms change constantly. We guarantee data-driven strategies, transparent reporting, and significant improvements in rankings, traffic, and conversions." },
    { q: "How do you measure the success of an SEO campaign?", a: "We track organic traffic growth, keyword rankings, conversion rates, bounce rates, and ROI. Detailed monthly reports show exactly how our efforts impact your bottom line." },
  ],
  web: [
    { q: "What technologies do you use for web development?", a: "We use modern frameworks like React.js, Next.js, Node.js, Express, and AWS services to build fast, scalable, and responsive web applications and CRM systems." },
    { q: "How long does it take to build a website?", a: "A standard business website takes 2–4 weeks. Complex web apps or CRM systems may take 6–12 weeks depending on features, integrations, and customization requirements." },
    { q: "Do you provide ongoing maintenance and support?", a: "Yes, we offer monthly maintenance plans including security updates, performance monitoring, bug fixes, content updates, and technical support." },
    { q: "Will my website be mobile-responsive?", a: "Absolutely. All our websites are built mobile-first with responsive design, ensuring optimal experience across phones, tablets, and desktops." },
    { q: "Can you integrate third-party tools and APIs?", a: "Yes, we integrate payment gateways, CRMs, email marketing tools, analytics platforms, social media APIs, and custom third-party services." },
  ],
  ai: [
    { q: "What AI services do you offer?", a: "We build AI-powered chatbots, voice agents, content generation tools, predictive analytics dashboards, recommendation engines, and custom AI integrations using latest LLM technologies." },
    { q: "How can AI improve my business operations?", a: "AI automates repetitive tasks, provides data-driven insights, personalizes customer experiences, streamlines lead qualification, and reduces operational costs by up to 60%." },
    { q: "Do you build custom AI solutions?", a: "Yes, we develop custom AI models and integrations tailored to your specific business needs, from natural language processing to computer vision applications." },
    { q: "Is AI replacing human workers?", a: "AI augments human capabilities rather than replacing them. It handles repetitive tasks so your team can focus on strategy, creativity, and high-value activities that require human judgment." },
    { q: "What is the cost of implementing AI?", a: "Costs vary based on complexity. Simple chatbot integrations start from $2,000, while custom AI solutions range from $10,000–$50,000+. We provide detailed quotes after understanding your requirements." },
  ],
  cold: [
    { q: "What is AI-powered cold calling?", a: "AI voice agents make outbound calls using natural language processing, handling conversations, qualifying leads, and scheduling meetings — all without human intervention, 24/7." },
    { q: "How effective are AI cold calling agents?", a: "Our clients see 340% increase in qualified leads, 67% reduction in cost per acquisition, and 5x improvement in call-to-meeting conversion rates compared to traditional cold calling." },
    { q: "Can AI agents handle objections?", a: "Yes, modern AI voice agents detect tone, handle common objections, adapt their pitch based on responses, and escalate complex scenarios to human agents when needed." },
    { q: "Is AI cold calling legal?", a: "Yes, when done properly. We ensure compliance with TCPA, GDPR, and local telemarketing regulations. All calls include proper disclosures and opt-out mechanisms." },
    { q: "Can I customize the AI agent's script?", a: "Absolutely. We train AI agents on your specific industry terminology, value propositions, and ideal customer profiles to ensure authentic, brand-aligned conversations." },
  ],
};

const FAQSection = () => {
  const [active, setActive] = useState("dm");

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-3xl">
        <p className="text-sm font-semibold text-primary text-center mb-2">Got Questions?</p>
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-center text-muted-foreground mb-8">
          Everything you need to know about our services and how we help you grow.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => setActive(c.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                active === c.value
                  ? "gradient-bg text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs[active].map((faq, i) => (
            <AccordionItem key={`${active}-${i}`} value={`faq-${i}`} className="border border-border rounded-lg px-4 bg-card">
              <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-10 text-center p-6 rounded-xl border border-border bg-card">
          <h3 className="font-bold text-foreground mb-2">Still have questions?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our team is here to help. Get in touch for a free consultation.
          </p>
          <Button className="gradient-bg text-primary-foreground hover:opacity-90">Contact Us Now</Button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
