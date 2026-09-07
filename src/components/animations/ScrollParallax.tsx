"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ReactNode, useRef } from "react";

interface ScrollParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: "fast" | "medium" | "slow";
  direction?: "vertical" | "horizontal";
  enableSpring?: boolean;
}

export function ScrollParallax({
  children,
  className = "",
  speed = "medium",
  direction = "vertical",
  enableSpring = true,
}: ScrollParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const speedMap = {
    fast: 0.3,
    medium: 0.5,
    slow: 0.7,
  };

  const multiplier = speedMap[speed];
  
  const yRange = [-100 * multiplier, 100 * multiplier];
  const xRange = direction === "horizontal" ? [-100 * multiplier, 100 * multiplier] : [0, 0];

  const rawY = useTransform(scrollYProgress, [0, 1], yRange);
  const rawX = useTransform(scrollYProgress, [0, 1], xRange);

  // Apply spring conditionally - must always call hooks in same order
  const springY = useSpring(rawY, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const springX = useSpring(rawX, { stiffness: 100, damping: 30, restDelta: 0.001 });
  
  const y = enableSpring ? springY : rawY;
  const x = enableSpring ? springX : rawX;

  return (
    <motion.div ref={ref} style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}

// Simpler parallax for backgrounds
interface SimpleParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function SimpleParallax({ 
  children, 
  className = "", 
  speed = 0.5 
}: SimpleParallaxProps) {
  const { scrollY } = useScroll();
  
  const y = useTransform(scrollY, [0, 1000], [0, -1000 * speed]);

  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
