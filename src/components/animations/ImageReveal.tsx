"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface ImageRevealProps {
  src: string;
  alt: string;
  className?: string;
  caption?: string;
  revealDirection?: "up" | "down" | "left" | "right";
  aspectRatio?: "square" | "video" | "portrait" | "landscape" | "auto";
}

export function ImageReveal({
  src,
  alt,
  className = "",
  caption,
  revealDirection = "up",
  aspectRatio = "auto",
}: ImageRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const directionMap = {
    up: { y: "100%" },
    down: { y: "-100%" },
    left: { x: "100%" },
    right: { x: "-100%" },
  };

  const hiddenProp = directionMap[revealDirection];
  const visibleProp = revealDirection === "up" || revealDirection === "down" 
    ? { y: "0%" } 
    : { x: "0%" };

  const aspectMap = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    auto: "",
  };

  return (
    <motion.figure
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Image container */}
      <div className={`relative ${aspectMap[aspectRatio]}`}>
        <motion.img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          initial={{ scale: 1.2 }}
          animate={isInView ? { scale: 1 } : { scale: 1.2 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        />
        
        {/* Reveal overlay */}
        <motion.div
          className="absolute inset-0 bg-[#FAF7F4]"
          initial={hiddenProp}
          animate={isInView ? visibleProp : hiddenProp}
          transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
        />
      </div>
      
      {/* Caption - Editorial style */}
      {caption && (
        <motion.figcaption
          className="mt-4 text-sm text-[#9E948A] italic"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {caption}
        </motion.figcaption>
      )}
    </motion.figure>
  );
}

// Hover image reveal - image scales up with overlay
interface HoverImageRevealProps {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function HoverImageReveal({ 
  src, 
  alt, 
  title,
  subtitle,
  className = "" 
}: HoverImageRevealProps) {
  return (
    <motion.div
      className={`relative group overflow-hidden cursor-pointer ${className}`}
      whileHover="hover"
    >
      {/* Image */}
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        variants={{
          hover: { scale: 1.1 },
        }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      />
      
      {/* Overlay */}
      <motion.div
        className="absolute inset-0 bg-[#3D3330]/60"
        variants={{
          hover: { opacity: 1 },
        }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8"
        variants={{
          hover: { opacity: 1, y: 0 },
        }}
        initial={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {title && (
          <motion.h3
            className="text-2xl font-bold mb-2"
            variants={{
              hover: { y: 0 },
            }}
            initial={{ y: 20 }}
          >
            {title}
          </motion.h3>
        )}
        {subtitle && (
          <motion.p
            className="text-white/80"
            variants={{
              hover: { y: 0, opacity: 1 },
            }}
            initial={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
