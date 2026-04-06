import { useState } from "react";
import { Search, MousePointerClick, Share2, Code, Brain, Phone, Sparkles } from "lucide-react";
import ContactFormDialog from "@/components/ContactFormDialog";

const services = [
  {
    icon: Search,
    title: "Search Engine Optimization",
    desc: "Dominate search results with our data-driven SEO strategies. We optimize your technical foundation, create authoritative content, and build high-quality backlinks.",
    items: ["Technical SEO Audits", "Keyword Strategy", "Link Building", "Local SEO"],
    gradient: "from-[hsl(230,80%,56%)] to-[hsl(270,80%,60%)]",
  },
  {
    icon: MousePointerClick,
    title: "PPC Advertising",
    desc: "Maximize your ROI with highly targeted paid campaigns. We manage your ad spend efficiently across Google, Bing, and social platforms to capture high-intent buyers.",
    items: ["Google Ads Management", "Retargeting Campaigns", "Shopping Ads", "Conversion Tracking"],
    gradient: "from-[hsl(200,80%,50%)] to-[hsl(230,80%,56%)]",
  },
  {
    icon: Share2,
    title: "Social Media Marketing",
    desc: "Build a loyal community and drive brand awareness. We create engaging content and manage targeted social ad campaigns that resonate with your audience.",
    items: ["Social Strategy", "Content Creation", "Community Management", "Paid Social Ads"],
    gradient: "from-[hsl(330,80%,55%)] to-[hsl(270,80%,60%)]",
  },
  {
    icon: Code,
    title: "Web Development",
    desc: "Your website is your best salesperson. We build lightning-fast, conversion-optimized, and visually stunning websites that turn visitors into paying customers.",
    items: ["Custom UI/UX Design", "E-Commerce Development", "Landing Page Optimization", "Performance Tuning"],
    gradient: "from-[hsl(145,60%,45%)] to-[hsl(200,80%,50%)]",
  },
  {
    icon: Brain,
    title: "AI Development",
    desc: "Leverage the power of Artificial Intelligence. We build custom AI solutions, chatbots, and automation tools to streamline your business operations.",
    items: ["Custom AI Models", "Process Automation", "Smart Chatbots", "Machine Learning"],
    gradient: "from-[hsl(270,80%,55%)] to-[hsl(330,80%,55%)]",
  },
  {
    icon: Sparkles,
    title: "Generative AI Solutions",
    desc: "Transform your business with cutting-edge Gen AI. We build custom LLM-powered apps, RAG systems, AI content generators, and intelligent automation pipelines.",
    items: ["Custom LLM Apps", "RAG & Knowledge Bases", "AI Content Generators", "Prompt Engineering"],
    gradient: "from-[hsl(40,90%,55%)] to-[hsl(330,80%,55%)]",
  },
  {
    icon: Phone,
    title: "AI Voice Calling",
    desc: "Revolutionize your customer outreach with AI-powered voice calling. Scale your sales and support with intelligent, human-like voice agents.",
    items: ["Automated Outreach", "Inbound Support", "Lead Qualification", "24/7 Availability"],
    gradient: "from-[hsl(145,60%,45%)] to-[hsl(270,80%,55%)]",
  },
];

const ServicesSection = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <section id="services" className="py-20 px-4">
        <div className="container mx-auto">
          <p className="text-sm font-semibold text-primary text-center mb-2">Our Expertise</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-3">
            Digital Marketing & <span className="gradient-text">Gen AI</span> Solutions
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-14">
            We blend cutting-edge AI with proven marketing strategies. From SEO to custom Gen AI apps — we build systems that drive real business growth.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, idx) => (
              <div
                key={s.title}
                className={`group relative p-6 rounded-xl border border-border bg-card hover:shadow-xl hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 ${idx === 5 ? "md:col-span-2 lg:col-span-1 lg:border-primary/20 lg:shadow-lg" : ""}`}
              >
                {/* Glow effect on featured */}
                {idx === 5 && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[hsl(40,90%,55%/0.05)] to-[hsl(330,80%,55%/0.05)] pointer-events-none" />
                )}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${s.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <s.icon size={22} className="text-[hsl(0,0%,100%)]" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
                {idx === 5 && (
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-accent/10 text-accent mb-2">New</span>
                )}
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{s.desc}</p>
                <ul className="space-y-1.5">
                  {s.items.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${s.gradient}`} />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setDialogOpen(true)}
                  className="inline-block mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  Get Started →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ContactFormDialog open={dialogOpen} onOpenChange={setDialogOpen} title="Get Started With Our Services" description="Tell us which service interests you and we'll create a custom plan." />
    </>
  );
};

export default ServicesSection;
