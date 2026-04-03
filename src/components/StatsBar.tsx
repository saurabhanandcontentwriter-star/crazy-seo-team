const stats = [
  { value: "500+", label: "Projects Delivered" },
  { value: "98%", label: "Client Retention Rate" },
  { value: "10+", label: "Years of Experience" },
  { value: "1M+", label: "Keywords Ranked" },
];

const StatsBar = () => (
  <section className="py-16 gradient-cta">
    <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {stats.map((s) => (
        <div key={s.label}>
          <p className="text-3xl md:text-4xl font-black text-primary-foreground">{s.value}</p>
          <p className="text-sm text-primary-foreground/70 mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  </section>
);

export default StatsBar;
