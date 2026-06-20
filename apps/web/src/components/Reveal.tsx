import type { CSSProperties, ReactNode } from "react";

type Animation = "fade-up" | "fade-in" | "scale-in" | "slide-in";

interface RevealProps {
  children: ReactNode;
  /** Stagger index — multiplies the base delay. */
  index?: number;
  delay?: number;
  animation?: Animation;
  className?: string;
  as?: "div" | "li" | "section" | "article";
  style?: CSSProperties;
}

const CLASS: Record<Animation, string> = {
  "fade-up": "animate-fade-up",
  "fade-in": "animate-fade-in",
  "scale-in": "animate-scale-in",
  "slide-in": "animate-slide-in",
};

/**
 * Mount-time entrance animation with optional stagger. Motion is handled
 * purely in CSS, so the reduced-motion setting neutralizes it automatically.
 */
export function Reveal({
  children,
  index = 0,
  delay = 0,
  animation = "fade-up",
  className = "",
  as: Tag = "div",
  style,
}: RevealProps) {
  const ms = delay + index * 70;
  return (
    <Tag
      className={`${CLASS[animation]} ${className}`}
      style={{ animationDelay: `${ms}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}
