import { Button } from "@/components/ui/button";

const CTASection = () => (
  <section id="contact" className="py-20 px-4">
    <div className="container mx-auto text-center max-w-3xl">
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
        Ready to Dominate Your Market?
      </h2>
      <p className="text-muted-foreground mb-8">
        Stop losing customers to your competitors. Let's build a digital marketing engine that drives predictable, scalable growth for your business.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button size="lg" className="gradient-bg text-primary-foreground hover:opacity-90 px-8 py-6 text-base">
          Get Your Free Proposal
        </Button>
        <Button size="lg" variant="outline" className="px-8 py-6 text-base">
          Call +91 62051 53346
        </Button>
      </div>
    </div>
  </section>
);

export default CTASection;
