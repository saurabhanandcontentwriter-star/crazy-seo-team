import { useMemo } from "react";

/**
 * Global background: aurora gradients, animated mesh, light rays,
 * floating particles and a soft AI grid. Purely decorative, fixed behind content.
 */
const AuroraBackground = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 3 + Math.random() * 4,
        dur: `${10 + Math.random() * 14}s`,
        delay: `${Math.random() * 10}s`,
        px: `${(Math.random() - 0.5) * 120}px`,
        py: `${-120 - Math.random() * 260}px`,
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[hsl(215_100%_98%)] to-[hsl(255_100%_98%)]" />

      {/* aurora blobs */}
      <div className="absolute -top-40 -left-32 h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle,hsl(var(--primary-glow)/0.28),transparent_65%)] blur-3xl animate-aurora" />
      <div
        className="absolute -top-24 right-[-12rem] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,hsl(var(--purple)/0.24),transparent_65%)] blur-3xl animate-aurora"
        style={{ animationDelay: "-7s" }}
      />
      <div
        className="absolute bottom-[-16rem] left-1/3 h-[44rem] w-[44rem] rounded-full bg-[radial-gradient(circle,hsl(var(--cyan)/0.20),transparent_65%)] blur-3xl animate-aurora"
        style={{ animationDelay: "-14s" }}
      />
      <div
        className="absolute top-1/3 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--sky)/0.18),transparent_65%)] blur-3xl animate-aurora"
        style={{ animationDelay: "-3s" }}
      />

      {/* AI grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)/0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at 50% 0%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, #000 20%, transparent 75%)",
        }}
      />

      {/* soft light rays */}
      <div className="absolute -top-32 left-1/4 h-[60rem] w-[18rem] rotate-12 bg-gradient-to-b from-white/70 to-transparent blur-2xl opacity-60" />
      <div className="absolute -top-40 right-1/4 h-[55rem] w-[12rem] -rotate-12 bg-gradient-to-b from-[hsl(var(--sky)/0.25)] to-transparent blur-2xl opacity-60" />

      {/* floating particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={
            {
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDuration: p.dur,
              animationDelay: p.delay,
              "--px": p.px,
              "--py": p.py,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
};

export default AuroraBackground;
