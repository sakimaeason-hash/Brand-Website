"use client";

import { useState, useMemo } from "react";
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
    weight: "33 lbs",
    maxSpeed: "4 mph",
    warranty: "5 Years",
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
    weight: "29 lbs",
    maxSpeed: "4 mph",
    warranty: "5 Years",
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
    weight: "19 lbs",
    maxSpeed: "4 mph",
    warranty: "3 Years",
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
    weight: "38 lbs",
    maxSpeed: "5 mph",
    warranty: "5 Years",
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
    weight: "2 lbs",
    warranty: "1 Year",
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
    weight: "3 lbs",
    warranty: "1 Year",
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
    weight: "1 lb",
    warranty: "90 Days",
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
    weight: "0.5 lb",
    warranty: "90 Days",
  },
];

const highlights = [
  { icon: "⚡", title: "Quick Fold", desc: "Folds in 3 seconds" },
  { icon: "🔋", title: "Long Range", desc: "Up to 30 miles" },
  { icon: "✈️", title: "Travel Ready", desc: "Airline approved" },
  { icon: "🛡️", title: "5-Year Warranty", desc: "Complete coverage" },
];

const sortOptions = [
  { id: "featured", label: "Featured" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
];

type SortOption = typeof sortOptions[number];
type Product = typeof products[number];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption["id"]>("featured");
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<Record<string, number>>({});
  const [compareList, setCompareList] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addItem } = useCart();

  const filteredAndSortedProducts = useMemo(() => {
    const result = activeCategory === "all"
      ? [...products]
      : products.filter((p) => p.category === activeCategory);

    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
    }
    return result;
  }, [activeCategory, sortBy]);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
    });
  };

  const toggleCompare = (productId: string) => {
    setCompareList((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : prev.length < 3
        ? [...prev, productId]
        : prev
    );
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#FAF8F5] via-white to-[#FAF8F5] py-20 lg:py-28 overflow-hidden">
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
                🔥 Summer Sale Ends In:
              </motion.p>
              <CountdownTimer targetDate="2026-08-31T23:59:59" />
            </motion.div>

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

            <div className="flex flex-wrap items-center gap-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption["id"])}
                className="px-4 py-2 rounded-lg border border-[#E8E8E8] bg-white text-sm focus:outline-none focus:border-[#2AAAA0]"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
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
              </div>

              {/* Compare Button */}
              {compareList.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompareList([])}
                  className="text-[#2AAAA0] border-[#2AAAA0]"
                >
                  Compare ({compareList.length})
                </Button>
              )}
            </div>
          </MotionWrapper>

          {/* Products Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${sortBy}`}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {filteredAndSortedProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  <HoverScale scale={1.02}>
                    <Card className="overflow-hidden group bg-white hover:shadow-xl transition-all duration-300">
                      {/* Image Area */}
                      <div className="relative aspect-square bg-gradient-to-br from-[#E8DDD4] to-[#E8E8E8] overflow-hidden">
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ scale: hoveredProduct === product.id ? 1.05 : 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className="text-[#6B6B6B] text-lg">
                            {product.images[selectedImages[product.id] || 0]}
                          </span>
                        </motion.div>

                        {/* Badges */}
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

                        {/* Wishlist & Compare */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(product.id);
                            }}
                            className={`w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-all hover:scale-110 ${
                              wishlist.includes(product.id) ? "text-[#C95959]" : "text-[#6B6B6B]"
                            }`}
                          >
                            <svg className="w-4 h-4" fill={wishlist.includes(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompare(product.id);
                            }}
                            className={`w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-all hover:scale-110 ${
                              compareList.includes(product.id) ? "text-[#2AAAA0]" : "text-[#6B6B6B]"
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </button>
                        </div>

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
                            onClick={() => setQuickViewProduct(product)}
                          >
                            View
                          </Button>
                        </motion.div>

                        {/* Image Dots */}
                        <div className="absolute bottom-3 right-3 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {product.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() =>
                                setSelectedImages({ ...selectedImages, [product.id]: idx })
                              }
                              className={`rounded-full transition-all ${
                                (selectedImages[product.id] || 0) === idx
                                  ? "w-3 h-3 bg-[#F5A623]"
                                  : "w-2 h-2 bg-white/70"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <CardContent className="p-4">
                        <div className="flex items-center gap-1 mb-2">
                          <svg className="w-3 h-3 text-[#F5A623] fill-[#F5A623]" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                          <span className="text-xs text-[#6B6B6B]">
                            {product.rating} ({product.reviews})
                          </span>
                        </div>

                        <p className="text-xs text-[#2AAAA0] font-medium mb-1">
                          {product.tagline}
                        </p>
                        <h3 className="font-bold text-[#2D2D2D] mb-2 group-hover:text-[#2AAAA0] transition-colors line-clamp-1">
                          {product.name}
                        </h3>

                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.features.slice(0, 2).map((feature, idx) => (
                            <span key={idx} className="text-[10px] bg-[#FAF8F5] text-[#6B6B6B] px-2 py-0.5 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-[#F5A623]">
                            ${product.price.toLocaleString()}
                          </span>
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

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
            onClick={() => setQuickViewProduct(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2 gap-8 p-8">
                {/* Image */}
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-[#E8DDD4] to-[#E8E8E8] rounded-xl flex items-center justify-center">
                    <span className="text-[#6B6B6B] text-2xl">
                      {quickViewProduct.images[0]}
                    </span>
                  </div>
                  {quickViewProduct.badge && (
                    <Badge
                      className={`absolute top-4 left-4 ${
                        quickViewProduct.badge === "SALE"
                          ? "bg-[#C95959] text-white"
                          : quickViewProduct.badge === "NEW"
                          ? "bg-[#2AAAA0] text-white"
                          : "bg-[#F5A623] text-[#2D2D2D]"
                      }`}
                    >
                      {quickViewProduct.badge}
                    </Badge>
                  )}
                </div>

                {/* Details */}
                <div>
                  <p className="text-[#2AAAA0] font-medium mb-2">{quickViewProduct.tagline}</p>
                  <h2 className="text-3xl font-bold text-[#2D2D2D] mb-4">{quickViewProduct.name}</h2>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(quickViewProduct.rating)
                              ? "text-[#F5A623] fill-[#F5A623]"
                              : "text-[#E8E8E8]"
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[#6B6B6B]">
                      {quickViewProduct.rating} ({quickViewProduct.reviews} reviews)
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-4xl font-bold text-[#F5A623]">
                      ${quickViewProduct.price.toLocaleString()}
                    </span>
                    {quickViewProduct.originalPrice && (
                      <span className="text-xl text-[#B0B0B0] line-through">
                        ${quickViewProduct.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <p className="text-[#6B6B6B] mb-6">
                    {quickViewProduct.features.join(" • ")}
                  </p>

                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-[#FAF8F5] rounded-xl">
                    {quickViewProduct.weight && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#2D2D2D]">{quickViewProduct.weight}</p>
                        <p className="text-xs text-[#6B6B6B]">Weight</p>
                      </div>
                    )}
                    {quickViewProduct.maxSpeed && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#2D2D2D]">{quickViewProduct.maxSpeed}</p>
                        <p className="text-xs text-[#6B6B6B]">Max Speed</p>
                      </div>
                    )}
                    {quickViewProduct.warranty && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#2D2D2D]">{quickViewProduct.warranty}</p>
                        <p className="text-xs text-[#6B6B6B]">Warranty</p>
                      </div>
                    )}
                  </div>

                  {/* Colors */}
                  <div className="mb-6">
                    <p className="text-sm text-[#6B6B6B] mb-2">Colors:</p>
                    <div className="flex gap-2">
                      {quickViewProduct.colors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-full border-2 border-[#E8E8E8]"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button
                      size="lg"
                      className="flex-1 bg-[#F5A623] text-[#2D2D2D] hover:bg-[#E09520]"
                      onClick={() => {
                        handleAddToCart(quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                    >
                      Add to Cart
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                    >
                      <a
                        href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Buy on Amazon
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-[#FAF8F5]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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