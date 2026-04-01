import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AuditSection = () => (
  <section className="py-20 px-4">
    <div className="container mx-auto max-w-2xl text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
        Get Your Free AI SEO Audit
      </h2>
      <p className="text-muted-foreground mb-8">
        Discover the hidden technical issues holding your website back. Our AI-driven analyzer provides a comprehensive report on your SEO health and ranking potential in seconds.
      </p>
      <div className="flex gap-3 max-w-md mx-auto">
        <Input placeholder="Enter your website URL" className="flex-1" />
        <Button className="gradient-bg text-primary-foreground hover:opacity-90">Analyze Now</Button>
      </div>
    </div>
  </section>
);

export default AuditSection;
