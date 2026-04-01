import { Heart, Building, ShoppingCart, Cpu, GraduationCap, Landmark, Scale, Wrench } from "lucide-react";

const industries = [
  { icon: Heart, label: "Healthcare" },
  { icon: Building, label: "Real Estate" },
  { icon: ShoppingCart, label: "E-Commerce" },
  { icon: Cpu, label: "SaaS & Tech" },
  { icon: GraduationCap, label: "Education" },
  { icon: Landmark, label: "Finance" },
  { icon: Scale, label: "Legal" },
  { icon: Wrench, label: "Home Services" },
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {industries.map((ind) => (
          <div key={ind.label} className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all">
            <ind.icon size={28} className="text-primary" />
            <span className="font-semibold text-sm text-foreground">{ind.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default IndustriesSection;
