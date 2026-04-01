import { BarChart3, Users, FileText } from "lucide-react";

const reasons = [
  {
    icon: BarChart3,
    title: "Data-Driven Approach",
    desc: "Every decision we make is backed by hard data and analytics, ensuring your budget is spent where it yields the highest return.",
  },
  {
    icon: Users,
    title: "Dedicated Experts",
    desc: "You get direct access to a dedicated team of specialists—not an account manager who passes messages along.",
  },
  {
    icon: FileText,
    title: "Transparent Reporting",
    desc: "No vanity metrics. We provide clear, honest reporting that connects our marketing efforts directly to your bottom line.",
  },
];

const WhyChooseUs = () => (
  <section className="py-20 px-4">
    <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <p className="text-sm font-semibold text-primary mb-2">Why Choose Us</p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          We Don't Guess. We Analyze, Execute, and Win.
        </h2>
        <p className="text-muted-foreground mb-8">
          Unlike traditional agencies that rely on outdated tactics, we combine cutting-edge technology, AI, and deep industry expertise to deliver measurable results.
        </p>

        <div className="space-y-6">
          {reasons.map((r) => (
            <div key={r.title} className="flex gap-4">
              <div className="w-12 h-12 shrink-0 rounded-lg gradient-bg flex items-center justify-center">
                <r.icon size={22} className="text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">{r.title}</h3>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
          alt="Team collaborating on marketing strategy"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
