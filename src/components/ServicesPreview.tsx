import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
const projects = [
  { title: "ANVYA", type: "Community Platform", desc: "Ideas, services and community discovery platform for sharing knowledge, discussions and connections.", image: "/images/workbench-anvya.svg", href: "https://www.crazyseoteam.in/anvya" },
  { title: "Crazy SEO Team Classifieds", type: "Marketplace", desc: "Discover listings, opportunities, services and digital resources from the Crazy SEO Team ecosystem.", image: "/images/workbench-classifieds.svg", href: "https://www.crazyseoteam.in/classifieds" },
  { title: "Sneha — AI Voice Assistant", type: "AI Solution", desc: "AI-powered voice experience designed to handle enquiries, explain services and capture leads.", image: "https://www.crazyseoteam.in/assets/ai-avatar-B8cDnzUB.jpg", href: "#" },
];

const ServicesPreview = () => (
  <section id="services" className="relative overflow-hidden py-24 px-4 bg-background">
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-32 left-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
    </div>
    <div className="relative container mx-auto max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }} className="text-center mb-14">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
          <Sparkles size={11} /> The Workbench
        </span>
        <h2 className="mt-4 text-3xl md:text-5xl font-black tracking-tight text-foreground">THE <span className="gradient-text">WORKBENCH.</span></h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-7">Where ideas are tested, systems are built and better outcomes take shape.</p>
      </motion.div>

      <div className="grid gap-7 lg:grid-cols-3">
        {projects.map((project, i) => (
          <motion.a
            key={project.title}
            href={project.href}
            target={project.href.startsWith("http") ? "_blank" : undefined}
            rel={project.href.startsWith("http") ? "noopener noreferrer" : undefined}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: .5, delay: i * .08 }}
            whileHover={{ y: -10, rotateX: 2 }}
            className="group block [perspective:1200px]"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-xl transition-all duration-500 group-hover:border-primary/30 group-hover:shadow-2xl">
              <div className="relative aspect-[16/10] overflow-hidden bg-muted/30 p-3">
                <div className="h-full w-full overflow-hidden rounded-[1.35rem] border border-white/50 bg-background shadow-lg transition-transform duration-500 group-hover:[transform:rotateY(-3deg)_rotateX(2deg)_scale(1.03)]">
                  <img src={project.image} alt={project.title} width="900" height="560" loading="lazy" className="h-full w-full object-contain object-center bg-white p-2" />
                </div>
                <span className="absolute left-6 top-6 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur">{project.type}</span>
                <span className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/80 text-primary shadow-lg backdrop-blur transition-transform group-hover:rotate-12 group-hover:scale-110"><ArrowUpRight className="h-5 w-5" /></span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black">{project.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{project.desc}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">View Project</span>
                  <span className="text-xs text-muted-foreground">Open ↗</span>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesPreview;
