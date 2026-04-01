import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    q: "What is SEO and why does my business need it?",
    a: "SEO (Search Engine Optimization) is the process of improving your website's visibility on search engines like Google. It's crucial because it helps you attract organic (free) traffic, builds brand authority, and ensures your business is found by potential customers at the exact moment they're searching for your products or services.",
  },
  {
    q: "How long does it take to see results from SEO?",
    a: "SEO is a long-term strategy. While some technical improvements can show impact quickly, significant rankings and traffic growth typically take 3 to 6 months. This timeline depends on your industry's competitiveness, the current state of your website, and the consistency of the SEO efforts.",
  },
  {
    q: "What is the difference between On-Page and Off-Page SEO?",
    a: "On-Page SEO refers to optimizations made directly on your website, such as content quality, keyword usage, meta tags, and site speed. Off-Page SEO involves activities outside your website to improve its authority, primarily through high-quality link building, social media engagement, and brand mentions.",
  },
  {
    q: "Do you guarantee a #1 ranking on Google?",
    a: "No ethical SEO agency can guarantee a #1 ranking because search engine algorithms are constantly changing and controlled by Google. However, we guarantee to use industry-best practices, data-driven strategies, and transparent reporting to significantly improve your rankings, traffic, and conversions.",
  },
  {
    q: "How do you measure the success of an SEO campaign?",
    a: "We measure success using key performance indicators (KPIs) such as organic traffic growth, keyword ranking improvements, conversion rates, bounce rates, and overall return on investment (ROI). We provide detailed monthly reports so you can see exactly how our efforts are impacting your bottom line.",
  },
];

const FAQSection = () => (
  <section className="py-20 px-4 bg-secondary/30">
    <div className="container mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-primary text-center mb-2">Got Questions?</p>
      <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-3">
        Frequently Asked Questions
      </h2>
      <p className="text-center text-muted-foreground mb-10">
        Everything you need to know about our SEO services and how we help you grow.
      </p>

      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-lg px-4 bg-card">
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
          Our team is here to help you understand how SEO can transform your business. Get in touch for a free consultation.
        </p>
        <Button className="gradient-bg text-primary-foreground hover:opacity-90">Contact Us Now</Button>
      </div>
    </div>
  </section>
);

export default FAQSection;
