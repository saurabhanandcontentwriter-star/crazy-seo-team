import founderImg from "@/assets/founder.jpeg";
import cofounderImg from "@/assets/cofounder.jpeg";
import ctoImg from "@/assets/cto.jpg";

const team = [
  {
    name: "Anand Kumar Singh",
    role: "Founder",
    img: founderImg,
    quote:
      "Our mission is simple: to deliver unparalleled digital growth for our clients. We believe in transparency, hard work, and strategies that actually move the needle. Your success is our ultimate metric.",
  },
  {
    name: "Saurabh Anand",
    role: "Co-Founder",
    img: cofounderImg,
    quote:
      "Innovation is at the core of what we do. By integrating advanced AI technologies with proven marketing tactics, we ensure our clients stay ahead of the curve and dominate their respective industries.",
  },
  {
    name: "Akash Tenguria",
    role: "CTO",
    img: ctoImg,
    quote:
      "A Full Stack Developer with 5 years of experience crafting dynamic, responsive web applications and CRM systems for the travel industry. I specialize in building intuitive frontends using React.js, Next.js, HTML/CSS, and JavaScript, and robust backends with Node.js, Express, and AWS services — helping businesses streamline operations, improve user experience, and scale efficiently.",
  },
];
name: "Neeraj Vani",
    role: "Advisor",
    img: advisorImg,
    quote:
      "Startup builder with 10+ years of experience helping businesses scale, optimize strategy, and drive sustainable growth."
  }
];

const AboutSection = () => (
  <section id="about" className="py-20 px-4 bg-secondary/30">
    <div className="container mx-auto">
      <p className="text-sm font-semibold text-primary text-center mb-2">About Us</p>
      <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-3">
        Meet the Visionaries Behind Crazy SEO Team
      </h2>
      <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-14">
        Driven by passion and data, our leadership team is dedicated to transforming your digital presence and scaling your revenue.
      </p>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {team.map((t) => (
          <div key={t.name} className="p-8 rounded-xl border border-border bg-card">
            <img
              src={t.img}
              alt={t.name}
              className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-primary/20"
            />
            <h3 className="text-xl font-bold text-foreground">{t.name}</h3>
            <p className="text-sm text-primary font-medium mb-4">{t.role}</p>
            <p className="text-muted-foreground text-sm leading-relaxed italic">"{t.quote}"</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
