import { motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const GlassCard = ({
  children,
  className = "",
  delay = 0,
}: { children: ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    className={`rounded-[24px] border border-white/60 bg-white/70 dark:bg-card/70 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(59,130,246,0.25)] ${className}`}
  >
    {children}
  </motion.div>
);

/** Count-up animation that respects reduced-motion / low-power devices. */
export function useCountUp(value: number, duration = 700) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth < 640);
    if (reduced) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const from = prev.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setDisplay(Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

export const Kpi = ({
  label,
  value,
  icon: Icon,
  suffix = "",
  prefix = "",
  tone = "from-blue-500 to-cyan-400",
  delay = 0,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  suffix?: string;
  prefix?: string;
  tone?: string;
  delay?: number;
}) => {
  const n = useCountUp(value);
  return (
    <GlassCard delay={delay} className="p-4 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br ${tone} text-white shadow-md`}>
          <Icon size={15} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-black tabular-nums">
        {prefix}
        {n.toLocaleString()}
        {suffix}
      </p>
    </GlassCard>
  );
};

export const EmptyState = ({
  icon: Icon,
  title,
  hint,
  action,
}: { icon: LucideIcon; title: string; hint?: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center justify-center text-center py-14 px-6">
    <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 flex items-center justify-center text-primary mb-3">
      <Icon size={24} />
    </span>
    <p className="font-bold">{title}</p>
    {hint && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{hint}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const CrmSkeleton = () => (
  <div className="space-y-5">
    <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-[92px] rounded-[24px]" />
      ))}
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      <Skeleton className="lg:col-span-2 h-[320px] rounded-[24px]" />
      <Skeleton className="h-[320px] rounded-[24px]" />
    </div>
  </div>
);
