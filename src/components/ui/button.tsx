import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg:last-child]:translate-x-0.5",
  {
    variants: {
      variant: {
        default:
          "gradient-cta-bg text-white shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.6)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_hsl(var(--violet)/0.65)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:-translate-y-0.5 hover:bg-destructive/90",
        outline:
          "border border-border bg-white/70 backdrop-blur-xl text-foreground shadow-sm hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_14px_34px_-14px_hsl(var(--primary)/0.45)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary/80",
        glass:
          "glass-card !rounded-xl text-foreground hover:-translate-y-0.5",
        ghost: "hover:bg-accent/10 hover:text-accent",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-3.5",
        lg: "h-12 rounded-xl px-8 text-[15px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Disable the magnetic + ripple micro-interactions */
  plain?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, plain = false, onClick, onMouseMove, onMouseLeave, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const innerRef = React.useRef<HTMLButtonElement | null>(null);

    const setRefs = (node: HTMLButtonElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    };

    const handleMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseMove?.(e);
      const el = innerRef.current;
      if (plain || !el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.16;
      const y = (e.clientY - r.top - r.height / 2) * 0.22;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
      el.style.transform = `translate(${x}px, ${y}px)`;
    };

    const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      onMouseLeave?.(e);
      const el = innerRef.current;
      if (!el) return;
      el.style.transform = "";
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const el = innerRef.current;
      if (!plain && el) {
        const r = el.getBoundingClientRect();
        const span = document.createElement("span");
        span.style.cssText = `position:absolute;left:${e.clientX - r.left}px;top:${e.clientY - r.top}px;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:9999px;background:rgba(255,255,255,.55);pointer-events:none;animation:rippleOut .6s ease-out forwards;`;
        el.appendChild(span);
        window.setTimeout(() => span.remove(), 620);
      }
      onClick?.(e);
    };

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={setRefs}
        onClick={handleClick}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
