import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/** Soft AI cursor glow — desktop only, purely decorative. */
const CursorGlow = () => {
  const [pos, setPos] = useState({ x: -300, y: -300 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-[9998] h-[320px] w-[320px] rounded-full blur-3xl"
      style={{
        background:
          "radial-gradient(circle, hsl(226 83% 55% / 0.18), hsl(270 80% 60% / 0.12) 45%, transparent 70%)",
      }}
      animate={{ x: pos.x - 160, y: pos.y - 160 }}
      transition={{ type: "spring", stiffness: 90, damping: 20, mass: 0.6 }}
    />
  );
};

export default CursorGlow;
