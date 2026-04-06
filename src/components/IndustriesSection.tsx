import { Heart, Building, ShoppingCart, Cpu, GraduationCap, Landmark, Scale, Wrench } from "lucide-react";

const industries = [
  { icon: Heart, label: "Healthcare", img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&q=80", keywords: ["Medical SEO", "Patient Acquisition"] },
  { icon: Building, label: "Real Estate", img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80", keywords: ["Property Listings", "Local SEO"] },
  { icon: ShoppingCart, label: "E-Commerce", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80", keywords: ["Product Ads", "Shopping SEO"] },
  { icon: Cpu, label: "SaaS & Tech", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80", keywords: ["B2B Marketing", "Lead Gen"] },
  { icon: GraduationCap, label: "Education", img: "https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&w=400&q=80", keywords: ["Enrollment Ads", "EdTech SEO"] },
  { icon: Landmark, label: "Finance", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80", keywords: ["FinTech Marketing", "Trust Building"] },
  { icon: Scale, label: "Legal", img: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80", keywords: ["Law Firm SEO", "PPC for Lawyers"] },
  { icon: Wrench, label: "Home Services", img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80", keywords: ["Local Ads", "Google Maps SEO"] },
];

const IndustriesSection = () => (
  <section className="py-20 px-4">
    <div className="container mx-auto">
      <p className="text-sm font-semibold text-primary text-center mb-2">Industries We Serve</p>
      <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-3">
        Tailored Strategies for Every Sector
      </h2>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-14">
        We understand that every industry has unique challenges. Our customized approaches ensure you dominate your specific market.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {industries.map((ind) => (
          <div key={ind.label} className="group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-500">
            <div className="h-28 overflow-hidden">
              <img src={ind.img} alt={`${ind.label} digital marketing`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 h-28 bg-gradient-to-b from-transparent to-card" />
            </div>
            <div className="p-4 text-center">
              <ind.icon size={24} className="text-primary mx-auto mb-2" />
              <span className="font-semibold text-sm text-foreground block">{ind.label}</span>
              <div className="flex flex-wrap gap-1 justify-center mt-2">
                {ind.keywords.map((kw) => (
                  <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{kw}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default IndustriesSection;
