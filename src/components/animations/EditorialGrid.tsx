"use client";

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

interface EditorialGridProps {
  children: ReactNode[];
  className?: string;
  variant?: "asymmetric" | "magazine" | "editorial" | "thirds" | "quarters";
  staggerDelay?: number;
}

export function EditorialGrid({ 
  children, 
  className = "", 
  variant = "asymmetric",
  staggerDelay = 0.15
}: EditorialGridProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variants = {
    asymmetric: {
      grid: "grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12",
      items: [
        "lg:col-span-7",
        "lg:col-span-5",
      ],
    },
    magazine: {
      grid: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8",
      items: [
        "lg:col-span-2 lg:row-span-2",
        "lg:col-span-1",
        "lg:col-span-1",
        "lg:col-span-1",
      ],
    },
    editorial: {
      grid: "grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12",
      items: [
        "lg:col-span-5 lg:col-start-2",
        "lg:col-span-5",
      ],
    },
    "thirds": {
      grid: "grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8",
      items: [
        "col-span-1",
        "col-span-1",
        "col-span-1",
      ],
    },
    "quarters": {
      grid: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
      items: [
        "col-span-1",
        "col-span-1",
        "col-span-1",
        "col-span-1",
      ],
    },
  };

  const { grid, items } = variants[variant];

  return (
    <motion.div
      ref={ref}
      className={`grid ${grid} ${className}`}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          className={items[index % items.length]}
          variants={{
            hidden: { opacity: 0, y: 60 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.8,
                delay: index * staggerDelay,
                ease: [0.25, 0.1, 0.25, 1],
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
