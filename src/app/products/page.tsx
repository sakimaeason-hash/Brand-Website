"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { CountdownTimer } from "@/components/CountdownTimer";
import {
  MotionWrapper,
  StaggerContainer,
  StaggerItem,
  HoverScale,
  Floating,
  AnimatedCounter,
  Magnetic,
} from "@/components/animations";

const categories = [
  { id: "all", label: "All Products" },
  { id: "wheelchair", label: "Electric Wheelchairs" },
  { id: "accessories", label: "Accessories" },
  { id: "parts", label: "Replacement Parts" },
];

const products = [
  {
    id: "1",
    name: "GoldSeason Explorer Pro",
    tagline: "All-Terrain Mobility",
    price: 2499,
    originalPrice: 2899,
    category: "wheelchair",
    badge: "BESTSELLER",
    rating: 4.9,
    reviews: 128,
    images: ["Front View", "Side View", "Folded", "Detail"],
    colors: ["#2D2D2D", "#C9A961", "#4A5568"],
    features: ["25 Mile Range", "All-Terrain", "Folds in 3s"],
  },
  {
    id: "2",
    name: "GoldSeason City Glide",
    tagline: "Urban Mobility Redefined",
    price: 1899,
    originalPrice: 2199,
    category: "wheelchair",
    badge: "POPULAR",
    rating: 4.8,
    reviews: 96,
    images: ["Front View", "Side View", "Folded", "Detail"],
    colors: ["#2D2D2D", "#2AAAA0", "#E8E8E8"],
    features: ["18 Mile Range", "Lightweight", "Compact Fold"],
  },
  {
    id: "3",
    name: "GoldSeason Traveler",
    tagline: "Your Perfect Travel Companion",
    price: 1599,
    originalPrice: 1899,
    category: "wheelchair",
    badge: "NEW",
    rating: 4.7,
    reviews: 64,
    images: ["Front View", "Side View", "Folded", "Detail"],
    colors: ["#C9A961", "#2D2D2D"],
    features: ["Airline Approved", "Ultra Light", "15 Mile Range"],
  },
  {
    id: "4",
    name: "GoldSeason Comfort Plus",
    tagline: "Premium Comfort & Style",
    price: 2899,
    originalPrice: 3299,
    category: "wheelchair",
    badge: "PREMIUM",
    rating: 5.0,
    reviews: 42,
    images: ["Front View", "Side View", "Folded", "Detail"],
    colors: ["#2D2D2D", "#8B7355", "#C9A961"],
    features: ["30 Mile Range", "Luxury Seat", "Dual Motors"],
  },
  {
    id: "5",
    name: "Premium Travel Bag",
    tagline: "Protect Your Investment",
    price: 79,
    category: "accessories",
    rating: 4.6,
    reviews: 215,
    images: ["Bag View", "Open", "Detail"],
    colors: ["#2D2D2D"],
    features: ["Water Resistant", "Padded", "Universal Fit"],
  },
  {
    id: "6",
    name: "Extended Battery Pack",
    tagline: "Double Your Range",
    price: 199,
    originalPrice: 249,
    category: "accessories",
    badge: "SALE",
    rating: 4.8,
    reviews: 178,
    images: ["Battery", "Installed", "Detail"],
    colors: ["#2D2D2D"],
    features: ["25 Mile Extra", "Quick Install", "TSA Approved"],
  },
  {
    id: "7",
    name: "All-Weather Cover",
    tagline: "Protection in Any Season",
    price: 49,
    category: "accessories",
    rating: 4.5,
    reviews: 89,
    images: ["Cover", "On Chair", "Detail"],
    colors: ["#2D2D2D", "#4A5568"],
    features: ["Waterproof", "UV Protection", "Breathable"],
  },
  {
    id: "8",
    name: "Universal Cup Holder",
    tagline: "Stay Hydrated On The Go",
    price: 29,
    category: "accessories",
    rating: 4.7,
    reviews: 156,
    images: ["Holder", "Installed", "Detail"],
    colors: ["#2D2D2D", "#C9A961"],
    features: ["360° Rotation", "Adjustable", "No-Tool Install"],
  },
];

const highlights = [
  { icon: "⚡", title: "Quick Fold", desc: "Folds in 3 seconds" },
  { icon: "🔋", title: "Long Range", desc: "Up to 30 miles" },
  { icon: "✈️", title: "Travel Ready", desc: "Airline approved" },
  { icon: "🛡️", title: "5-Year Warranty", desc: "Complete coverage" },
];

const reviews = [
  {
    name: "Michael R.",
    location: "Florida, USA",
    rating: 5,
    text: "The Explorer Pro has completely changed my life. I can now go on hiking trails with my family!",
    avatar: "M",
  },
  {
    name: "Sarah K.",
    location: "California, USA",
    rating: 5,
    text: "Lightweight, easy to fold, and the customer service is outstanding. Highly recommend!",
    avatar: "S",
  },
  {
    name: "James L.",
    location: "Texas, USA",
    rating: 5,
    text: "Best investment I've made. The battery life is incredible and it's so comfortable.",
    avatar: "J",
  },
];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<Record<string, number>>({});
  const { addItem } = useCart();

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const handleAddToCart = (product: (typeof products)[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
    });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#FAF8F5] via-white to-[#FAF8F5] py-20 lg:py-28 overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div
          className="absolute top-20 right-10 w-64 h-64 bg-[#F5A623]/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-48 h-48 bg-[#2AAAA0]/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-[#F5A623]/10 text-[#2D2D2D] border-[#F5A623]/30 mb-6">
                <motion.span
                  className="mr-1"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  ✨
                </motion.span>
                Free Shipping on All Orders
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-6xl font-bold text-[#2D2D2D] mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Discover Your Perfect
              <motion.span
                className="block text-[#2AAAA0]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Mobility Solution
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-lg lg:text-xl text-[#6B6B6B] mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Engineered for independence, designed for comfort. Explore our
              award-winning collection of electric wheelchairs and accessories.
            </motion.p>

            {/* Countdown */}
            <motion.div
              className="flex flex-col items-center gap-4 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.p
                className="text-sm text-[#6B6B6B] font-medium"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎉 Spring Sale Ends In:
              </motion.p>
              <CountdownTimer targetDate="2025-05-31T23:59:59" />
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Magnetic>
                <Button
                  asChild
                  size="lg"
                  className="bg-[#F5A623] text-[#2D2D2D] hover:bg-[#E09520] text-lg px-8"
                >
                  <a
                    href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Shop on Amazon
                  </a>
                </Button>
              </Magnetic>
              <Magnetic>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="text-lg px-8"
                >
                  <Link href="#products">View All Products</Link>
                </Button>
              </Magnetic>
            </motion.div>
          </div>
        </div>

        {/* Floating Stats */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex gap-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[
            { value: 50000, suffix: "+", label: "Happy Customers" },
            { value: 4.9, suffix: "", label: "Average Rating" },
            { value: 30, suffix: "-Day", label: "Return Policy" },
          ].map((stat, i) => (
            <Floating key={i} duration={3 + i * 0.5} distance={5}>
              <motion.div
                className="text-center bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <p className="text-2xl font-bold text-[#F5A623]">
                  {stat.value >= 1000 ? (
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  ) : (
                    `${stat.value}${stat.suffix}`
                  )}
                </p>
                <p className="text-xs text-[#6B6B6B]">{stat.label}</p>
              </motion.div>
            </Floating>
          ))}
        </motion.div>
      </section>

      {/* Highlights Bar */}
      <section className="bg-[#2D2D2D] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((item, i) => (
              <StaggerItem key={i}>
                <motion.div
                  className="flex items-center gap-3 text-white"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.span
                    className="text-2xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  >
                    {item.icon}
                  </motion.span>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-white/70">{item.desc}</p>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 lg:py-24 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <MotionWrapper className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <motion.h2
                className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-3"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                Our Products
              </motion.h2>
              <motion.p
                className="text-[#6B6B6B] max-w-xl"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Each GoldSeason product is crafted with precision engineering and
                thoughtful design to enhance your mobility and independence.
              </motion.p>
            </div>

            {/* Category Filter */}
            <motion.div
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {categories.map((cat, i) => (
                <motion.button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? "bg-[#F5A623] text-[#2D2D2D]"
                      : "bg-white text-[#6B6B6B] hover:bg-[#F5A623]/10"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {cat.label}
                </motion.button>
              ))}
            </motion.div>
          </MotionWrapper>

          {/* Products Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <HoverScale scale={1.02}>
                    <Card className="overflow-hidden group bg-white hover:shadow-xl transition-all duration-300">
                      {/* Image Area */}
                      <div className="relative aspect-square bg-gradient-to-br from-[#E8DDD4] to-[#E8E8E8] overflow-hidden">
                        {/* Main Image Display */}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{
                            scale: hoveredProduct === product.id ? 1.05 : 1,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="text-[#6B6B6B] text-lg">
                            {product.images[selectedImages[product.id] || 0]}
                          </span>
                        </motion.div>

                        {/* Badge */}
                        <AnimatePresence>
                          {product.badge && (
                            <motion.div
                              className="absolute top-3 left-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                            >
                              <Badge
                                className={`${
                                  product.badge === "SALE"
                                    ? "bg-[#C95959] text-white"
                                    : product.badge === "NEW"
                                    ? "bg-[#2AAAA0] text-white"
                                    : "bg-[#F5A623] text-[#2D2D2D]"
                                }`}
                              >
                                {product.badge}
                              </Badge>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Quick Actions */}
                        <motion.div
                          className="absolute bottom-3 left-3 right-3 flex gap-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{
                            opacity: hoveredProduct === product.id ? 1 : 0,
                            y: hoveredProduct === product.id ? 0 : 20,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button
                            size="sm"
                            className="flex-1 bg-white text-[#2D2D2D] hover:bg-[#F5A623]"
                            onClick={() => handleAddToCart(product)}
                          >
                            Add to Cart
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/90 border-0"
                            asChild
                          >
                            <Link href={`/products/${product.id}`}>View</Link>
                          </Button>
                        </motion.div>

                        {/* Thumbnail Dots */}
                        <div className="absolute top-3 right-3 flex flex-col gap-1">
                          {product.images.map((_, idx) => (
                            <motion.button
                              key={idx}
                              onClick={() =>
                                setSelectedImages({
                                  ...selectedImages,
                                  [product.id]: idx,
                                })
                              }
                              className={`rounded-full transition-all ${
                                (selectedImages[product.id] || 0) === idx
                                  ? "bg-[#F5A623]"
                                  : "bg-white/70 hover:bg-white"
                              }`}
                              animate={{
                                width:
                                  (selectedImages[product.id] || 0) === idx
                                    ? 16
                                    : 8,
                                height: 8,
                              }}
                              transition={{ duration: 0.2 }}
                            />
                          ))}
                        </div>
                      </div>

                      <CardContent className="p-4">
                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <motion.svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(product.rating)
                                    ? "text-[#F5A623] fill-[#F5A623]"
                                    : "text-[#E8E8E8]"
                                }`}
                                viewBox="0 0 20 20"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                              >
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </motion.svg>
                            ))}
                          </div>
                          <span className="text-xs text-[#6B6B6B]">
                            ({product.reviews})
                          </span>
                        </div>

                        {/* Product Info */}
                        <motion.p
                          className="text-xs text-[#2AAAA0] font-medium mb-1"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {product.tagline}
                        </motion.p>
                        <h3 className="font-bold text-[#2D2D2D] mb-2 group-hover:text-[#2AAAA0] transition-colors">
                          {product.name}
                        </h3>

                        {/* Features */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.features.map((feature, idx) => (
                            <motion.span
                              key={idx}
                              className="text-[10px] bg-[#FAF8F5] text-[#6B6B6B] px-2 py-0.5 rounded"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              {feature}
                            </motion.span>
                          ))}
                        </div>

                        {/* Color Options */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-[#6B6B6B]">Colors:</span>
                          <div className="flex gap-1">
                            {product.colors.map((color, idx) => (
                              <motion.div
                                key={idx}
                                className="w-4 h-4 rounded-full border border-[#E8E8E8]"
                                style={{ backgroundColor: color }}
                                whileHover={{ scale: 1.3 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <motion.span
                            className="text-xl font-bold text-[#F5A623]"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                          >
                            ${product.price.toLocaleString()}
                          </motion.span>
                          {product.originalPrice && (
                            <span className="text-sm text-[#B0B0B0] line-through">
                              ${product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </HoverScale>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <MotionWrapper className="text-center mb-12">
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              What Our Customers Say
            </motion.h2>
            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <motion.svg
                    key={i}
                    className="w-6 h-6 text-[#F5A623] fill-[#F5A623]"
                    viewBox="0 0 20 20"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, type: "spring" }}
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </motion.svg>
                ))}
              </div>
              <span className="text-lg font-bold text-[#2D2D2D]">4.9/5</span>
              <span className="text-[#6B6B6B]">from 2,000+ reviews</span>
            </motion.div>
          </MotionWrapper>

          <StaggerContainer className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <StaggerItem key={i}>
                <motion.div
                  whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-[#FAF8F5] border-0 h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <motion.div
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E09520] flex items-center justify-center text-white font-bold text-lg"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          {review.avatar}
                        </motion.div>
                        <div>
                          <p className="font-semibold text-[#2D2D2D]">
                            {review.name}
                          </p>
                          <p className="text-sm text-[#6B6B6B]">
                            {review.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex mb-3">
                        {[...Array(review.rating)].map((_, idx) => (
                          <motion.svg
                            key={idx}
                            className="w-4 h-4 text-[#F5A623] fill-[#F5A623]"
                            viewBox="0 0 20 20"
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </motion.svg>
                        ))}
                      </div>
                      <p className="text-[#6B6B6B]">&ldquo;{review.text}&rdquo;</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-[#2D2D2D] to-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <MotionWrapper direction="left" className="text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Mobility?
              </h2>
              <p className="text-white/70 text-lg max-w-xl">
                Join thousands of satisfied customers who have discovered the
                freedom of GoldSeason electric wheelchairs.
              </p>
            </MotionWrapper>
            <MotionWrapper direction="right" className="flex flex-col sm:flex-row gap-4">
              <Magnetic>
                <Button
                  size="lg"
                  className="bg-[#F5A623] text-[#2D2D2D] hover:bg-[#E09520] text-lg px-8"
                  asChild
                >
                  <a
                    href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Shop Now on Amazon
                  </a>
                </Button>
              </Magnetic>
              <Magnetic>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 text-lg px-8"
                  asChild
                >
                  <Link href="/support">Contact Sales</Link>
                </Button>
              </Magnetic>
            </MotionWrapper>
          </div>
        </div>
      </section>
    </div>
  );
}
