import { Search, MousePointerClick, Share2, Code, Brain, Phone } from "lucide-react";

const services = [
  {
    icon: Search,
    title: "Search Engine Optimization",
    desc: "Dominate search results with our data-driven SEO strategies. We optimize your technical foundation, create authoritative content, and build high-quality backlinks.",
    items: ["Technical SEO Audits", "Keyword Strategy", "Link Building", "Local SEO"],
  },
  {
    icon: MousePointerClick,
    title: "PPC Advertising",
    desc: "Maximize your ROI with highly targeted paid campaigns. We manage your ad spend efficiently across Google, Bing, and social platforms to capture high-intent buyers.",
    items: ["Google Ads Management", "Retargeting Campaigns", "Shopping Ads", "Conversion Tracking"],
  },
  {
    icon: Share2,
    title: "Social Media Marketing",
    desc: "Build a loyal community and drive brand awareness. We create engaging content and manage targeted social ad campaigns that resonate with your audience.",
    items: ["Social Strategy", "Content Creation", "Community Management", "Paid Social Ads"],
  },
  {
    icon: Code,
    title: "Web Development",
    desc: "Your website is your best salesperson. We build lightning-fast, conversion-optimized, and visually stunning websites that turn visitors into paying customers.",
    items: ["Custom UI/UX Design", "E-Commerce Development", "Landing Page Optimization", "Performance Tuning"],
  },
  {
    icon: Brain,
    title: "AI Development",
    desc: "Leverage the power of Artificial Intelligence. We build custom AI solutions, chatbots, and automation tools to streamline your business operations.",
    items: ["Custom AI Models", "Process Automation", "Smart Chatbots", "Machine Learning"],
  },
  {
    icon: Phone,
    title: "AI Voice Calling",
    desc: "Revolutionize your customer outreach with AI-powered voice calling. Scale your sales and support with intelligent, human-like voice agents.",
    items: ["Automated Outreach", "Inbound Support", "Lead Qualification", "24/7 Availability"],
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 px-4">
      <div className="container mx-auto">
        <p className="text-sm font-semibold text-primary text-center mb-2">Our Expertise</p>
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-3">
          Comprehensive Digital Marketing Solutions
        </h2>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-14">
          We don't just drive traffic; we drive the right traffic. Our full-funnel approach ensures every click has the potential to become a customer.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="group p-6 rounded-xl border border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center mb-4">
                <s.icon size={22} className="text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{s.desc}</p>
              <ul className="space-y-1.5">
                {s.items.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => {}} className="inline-block mt-4 text-sm font-semibold text-primary hover:underline">
                Learn more →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
