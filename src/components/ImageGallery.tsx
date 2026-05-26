"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryImage {
  src?: string;
  alt: string;
  caption?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleImageChange = (newIndex: number) => {
    setDirection(newIndex > selectedImage ? 1 : -1);
    setSelectedImage(newIndex);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-[16/10] bg-gradient-to-br from-[#E8DDD4] to-[#E8E8E8] rounded-2xl overflow-hidden relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={selectedImage}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.span
              className="text-[#6B6B6B] text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {images[selectedImage].alt}
            </motion.span>
          </motion.div>
        </AnimatePresence>

        {/* Caption */}
        <AnimatePresence mode="wait">
          {images[selectedImage].caption && (
            <motion.div
              key={`caption-${selectedImage}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6"
            >
              <p className="text-white">{images[selectedImage].caption}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Arrows */}
        <motion.button
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 hover:opacity-100 transition-opacity"
          onClick={() =>
            handleImageChange(
              selectedImage > 0 ? selectedImage - 1 : images.length - 1
            )
          }
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          <svg
            className="w-5 h-5 text-[#2D2D2D]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </motion.button>

        <motion.button
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
          onClick={() =>
            handleImageChange(
              selectedImage < images.length - 1 ? selectedImage + 1 : 0
            )
          }
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          <svg
            className="w-5 h-5 text-[#2D2D2D]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.button>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, i) => (
          <motion.button
            key={i}
            onClick={() => handleImageChange(i)}
            className={`aspect-square bg-gradient-to-br from-[#E8DDD4] to-[#E8E8E8] rounded-lg overflow-hidden relative transition-all ${
              selectedImage === i
                ? "ring-2 ring-[#F5A623]"
                : "hover:opacity-80"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <motion.span
              className="text-xs text-[#6B6B6B] absolute inset-0 flex items-center justify-center"
              animate={{
                scale: selectedImage === i ? 1.1 : 1,
                fontWeight: selectedImage === i ? 600 : 400,
              }}
              transition={{ duration: 0.2 }}
            >
              {i + 1}
            </motion.span>

            {/* Selection Indicator */}
            {selectedImage === i && (
              <motion.div
                className="absolute inset-0 bg-[#F5A623]/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, i) => (
          <motion.div
            key={i}
            className="h-1 rounded-full bg-[#E8E8E8] overflow-hidden"
            style={{ width: 24 }}
          >
            <motion.div
              className="h-full bg-[#F5A623]"
              initial={{ width: "0%" }}
              animate={{ width: selectedImage === i ? "100%" : "0%" }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
