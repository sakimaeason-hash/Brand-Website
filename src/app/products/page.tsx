"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { CountdownTimer } from "@/components/CountdownTimer";
import {
  MotionWrapper,
  HoverScale,
  Floating,
  AnimatedCounter,
  Magnetic,
  RevealOnScroll,
} from "@/components/animations";

interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  category: string;
  badge?: string;
  rating: number;
  reviews: number;
  images: string[];
  colors: string[];
  colorNames: string[];
  features: string[];
  weight?: string;
  maxSpeed?: string;
  warranty?: string;
  amazonLink?: string;
}

const products: Product[] = [
  // Electric Scooters - Travel Air S Series
  {
    id: "s1",
    name: "Travel Air S 24",
    tagline: "Travel Ready • Ultra Portable",
    price: 499.99,
    category: "scooter",
    badge: "BESTSELLER",
    rating: 4.8,
    reviews: 72,
    images: ["/products/Scooters/Travel Air S 24A.jpg", "/products/Scooters/Travel Air S 24B.jpg", "/products/Scooters/Travel Air S 24F.jpg"],
    colors: ["#DC2626", "#EA580C", "#2563EB"],
    colorNames: ["Red", "Orange", "Blue"],
    features: ["Airline Approved", "Ultra Light 28lbs", "15 Mile Range"],
    weight: "28 lbs",
    maxSpeed: "4 mph",
    warranty: "2 Years",
    amazonLink: "https://www.amazon.com/dp/B0GYNVF8QP?th=1",
  },
  {
    id: "s2",
    name: "Travel Air S 14",
    tagline: "Compact • Easy to Store",
    price: 999.99,
    category: "scooter",
    rating: 4.6,
    reviews: 45,
    images: ["/products/Scooters/Travel Air S 14F.jpg", "/products/Scooters/Travel Air S 14H.jpg", "/products/Scooters/Travel Air S 14J.jpg"],
    colors: ["#2563EB", "#171717", "#D4AF37"],
    colorNames: ["Blue", "Black", "Gold"],
    features: ["Airline Approved", "Lightweight", "12 Mile Range"],
    weight: "24 lbs",
    maxSpeed: "4 mph",
    warranty: "2 Years",
    amazonLink: "https://www.amazon.com/dp/B0GHYLR1BK?th=1",
  },
  // Electric Scooters - Rover Power Series
  {
    id: "s3",
    name: "Rover Power 23",
    tagline: "All-Terrain • Powerful Motor",
    price: 699.99,
    category: "scooter",
    badge: "NEW",
    rating: 4.9,
    reviews: 38,
    images: ["/products/Scooters/Rover Power 23A.jpg", "/products/Scooters/Rover Power 23F.jpg", "/products/Scooters/Rover Power 23M.jpg"],
    colors: ["#DC2626", "#2563EB", "#EC4899"],
    colorNames: ["Red", "Blue", "Pink"],
    features: ["25 Mile Range", "Dual Motors", "All-Terrain"],
    weight: "35 lbs",
    maxSpeed: "5 mph",
    warranty: "3 Years",
    amazonLink: "https://www.amazon.com/dp/B0GZ43N9ZQ?th=1",
  },
  {
    id: "s4",
    name: "Rover Power 20",
    tagline: "Extended Range • Comfort",
    price: 499.99,
    category: "scooter",
    rating: 4.7,
    reviews: 52,
    images: ["/products/Scooters/Rover Power 20A.jpg", "/products/Scooters/Rover Power 20I.jpg", "/products/Scooters/Rover Power 20J.jpg"],
    colors: ["#DC2626", "#F5F5F5", "#D4AF37"],
    colorNames: ["Red", "White", "Gold"],
    features: ["20 Mile Range", "Comfort Seat", "All-Terrain"],
    weight: "32 lbs",
    maxSpeed: "4.5 mph",
    warranty: "3 Years",
    amazonLink: "https://www.amazon.com/dp/B0FWKC6H49",
  },
  {
    id: "s5",
    name: "Rover Power 19",
    tagline: "All-Terrain • Durable Build",
    price: 599.99,
    category: "scooter",
    rating: 4.8,
    reviews: 29,
    images: ["/products/Scooters/Rover Power 19A.png", "/products/Scooters/Rover Power 19D.png"],
    colors: ["#DC2626", "#9D9D6B"],
    colorNames: ["Red", "Pearl Green"],
    features: ["18 Mile Range", "All-Terrain", " Durable Frame"],
    weight: "30 lbs",
    maxSpeed: "4 mph",
    warranty: "3 Years",
  },
  // Electric Wheelchairs
  {
    id: "1",
    name: "Travel Air W 03",
    tagline: "Travel Ready • Ultra Lightweight",
    price: 599.99,
    originalPrice: 799.99,
    category: "wheelchair",
    badge: "BESTSELLER",
    rating: 4.8,
    reviews: 89,
    images: ["/products/Travel Air W 03C.png", "/products/Travel Air W 03E.png"],
    colors: ["#2D2D2D", "#C9A961"],
    colorNames: ["Standard", "Standard"],
    features: ["Airline Approved", "Ultra Light 19lbs", "15 Mile Range"],
    weight: "19 lbs",
    maxSpeed: "4 mph",
    warranty: "3 Years",
    amazonLink: "https://www.amazon.com/dp/B0FB7YWS4C?th=1",
  },
  {
    id: "2",
    name: "Travel Air W 21",
    tagline: "Travel Ready • Compact Fold",
    price: 899.99,
    category: "wheelchair",
    rating: 4.7,
    reviews: 64,
    images: ["/products/Travel Air W 21A.png", "/products/Travel Air W 21H.png"],
    colors: ["#DC2626", "#1A1A1A"],
    colorNames: ["Red", "Carbon Black"],
    features: ["Airline Approved", "Lightweight", "18 Mile Range"],
    weight: "22 lbs",
    maxSpeed: "4 mph",
    warranty: "3 Years",
  },
  {
    id: "3",
    name: "Travel Air W 26",
    tagline: "Travel Ready • Premium Build",
    price: 649.99,
    originalPrice: 899.99,
    category: "wheelchair",
    badge: "NEW",
    rating: 4.9,
    reviews: 112,
    images: ["/products/Travel Air W 26A.png", "/products/Travel Air W 26B.png"],
    colors: ["#DC2626", "#EA580C"],
    colorNames: ["Red", "Orange"],
    features: ["Airline Approved", "Compact Fold", "20 Mile Range"],
    weight: "21 lbs",
    maxSpeed: "4 mph",
    warranty: "3 Years",
    amazonLink: "https://www.amazon.com/dp/B0GY88QR65?th=1",
  },
  {
    id: "4",
    name: "Power Max 01",
    tagline: "All-Terrain • Powerful Performance",
    price: 1099.99,
    originalPrice: 1399.99,
    category: "wheelchair",
    badge: "BESTSELLER",
    rating: 4.9,
    reviews: 128,
    images: ["/products/Power Max 01A.png", "/products/Power Max 01B.png"],
    colors: ["#2D2D2D", "#4A5568"],
    colorNames: ["Standard", "Standard"],
    features: ["25 Mile Range", "All-Terrain", "Folds in 3s"],
    weight: "33 lbs",
    maxSpeed: "4 mph",
    warranty: "5 Years",
    amazonLink: "https://www.amazon.com/Electric-Wheelchair-Wheelchairs-Lightweight-All-Terrain/dp/B0FB8NRDPC/ref=ast_sto_dp_puis",
  },
  {
    id: "5",
    name: "Power Max 16",
    tagline: "All-Terrain • Extended Range",
    price: 1099.99,
    originalPrice: 1499.99,
    category: "wheelchair",
    rating: 4.8,
    reviews: 76,
    images: ["/products/Power Max 16H.png", "/products/Power Max 16K.png", "/products/Power Max 16L.png"],
    colors: ["#171717", "#6B7280", "#9CA3AF"],
    colorNames: ["Black", "Leather Gray", "Gray"],
    features: ["28 Mile Range", "Dual Motors", "All-Terrain"],
    weight: "35 lbs",
    maxSpeed: "5 mph",
    warranty: "5 Years",
  },
  {
    id: "6",
    name: "Spacious Pro 15",
    tagline: "Extra Wide • Heavy Duty",
    price: 699.99,
    originalPrice: 999.99,
    category: "wheelchair",
    badge: "PREMIUM",
    rating: 5.0,
    reviews: 42,
    images: ["/products/Spacious Pro 15B.png", "/products/Spacious Pro 15F.png"],
    colors: ["#EA580C", "#2563EB"],
    colorNames: ["Orange", "Blue"],
    features: ["30 Mile Range", "Luxury Seat", "Dual Motors"],
    weight: "38 lbs",
    maxSpeed: "5 mph",
    warranty: "5 Years",
    amazonLink: "https://www.amazon.com/dp/B0G5WH7KLL?th=1",
  },
  {
    id: "7",
    name: "Basic 13",
    tagline: "Reliable • Everyday Use",
    price: 399.99,
    category: "wheelchair",
    rating: 4.6,
    reviews: 215,
    images: ["/products/Basic 13A.png", "/products/Basic 13L.png", "/products/Basic 13N.png"],
    colors: ["#DC2626", "#9CA3AF", "#FF6B35"],
    colorNames: ["Red", "Gray", "Bright Orange"],
    features: ["15 Mile Range", "Lightweight", "Easy to Use"],
    weight: "28 lbs",
    maxSpeed: "4 mph",
    warranty: "3 Years",
    amazonLink: "https://www.amazon.com/dp/B0H1BKC9GQ",
  },
];

const sortOptions = [
  { id: "featured", label: "Featured" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
];

type SortOption = typeof sortOptions[number];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption["id"]>("featured");
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<Record<string, number>>({});
  const [compareList, setCompareList] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewSelectedImage, setQuickViewSelectedImage] = useState<number>(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { addItem } = useCart();

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === "wheelchair" || categoryId === "scooter") {
      setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
      setActiveCategory(categoryId);
    } else if (categoryId.startsWith("wheelchair-")) {
      setActiveCategory(categoryId);
      setExpandedCategory("wheelchair");
    } else if (categoryId.startsWith("scooter-")) {
      setActiveCategory(categoryId);
      setExpandedCategory("scooter");
    } else {
      setExpandedCategory(null);
      setActiveCategory(categoryId);
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result: Product[];

    if (activeCategory === "all") {
      result = [...products];
    } else if (activeCategory.includes("-")) {
      const [mainCat, series] = activeCategory.split("-");
      result = products.filter((p) => p.category === mainCat && p.name.startsWith(series));
    } else {
      result = products.filter((p) => p.category === activeCategory);
    }

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
    <div className="bg-cream">
      {/* Hero Section - Editorial Style */}
      <section className="relative bg-gradient-to-br from-[#C8956C] via-[#8B7355] to-[#5C534E] py-24 lg:py-32 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#C8956C]/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-white/70 mb-6">
                ✨ Free Shipping on All Orders
              </span>
            </motion.div>

            <motion.h1
              className="text-[clamp(2.5rem,6vw,5rem)] leading-[1.05] font-bold text-white mb-6 tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Discover Your Perfect
              <span className="block text-[#E8D5C4]">Mobility Solution</span>
            </motion.h1>

            <motion.p
              className="text-[clamp(1.125rem,2vw,1.375rem)] text-white/80 max-w-2xl mx-auto leading-relaxed mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Engineered for independence, designed for comfort. Explore our
              award-winning collection of electric wheelchairs and scooters.
            </motion.p>

            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <p className="text-sm text-white/70 font-medium mb-3">🔥 Summer Sale Ends In:</p>
              <CountdownTimer targetDate="2026-09-10T00:00:00" />
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <a
                href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-lg px-10 py-4"
              >
                Shop on Amazon
              </a>
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

      {/* Products Section */}
      <section id="products" className="py-16 lg:py-24 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <MotionWrapper className="mb-12">
            <motion.h2
              className="editorial-subheading text-deep-espresso mb-3"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              Our Products
            </motion.h2>
            <motion.p
              className="text-muted max-w-xl"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Each GoldSeason product is crafted with precision engineering and
              thoughtful design to enhance your mobility and independence.
            </motion.p>
          </MotionWrapper>

          {/* Two Column Layout: Sidebar + Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar - Category Filter */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl p-6 shadow-warm">
                <h3 className="text-lg font-semibold text-deep-espresso mb-4">Categories</h3>
                <div className="flex flex-col gap-1">
                  {/* All Products - Standalone */}
                  <motion.button
                    onClick={() => handleCategoryClick("all")}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                      activeCategory === "all"
                        ? "bg-[#C8956C] text-white"
                        : "text-warm hover:bg-[#C8956C]/10"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    All Products
                  </motion.button>

                  {/* Electric Scooters - Parent with expand/collapse */}
                  <div className="flex flex-col gap-1">
                    <motion.button
                      onClick={() => handleCategoryClick("scooter")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all w-full ${
                        activeCategory === "scooter" || activeCategory.startsWith("scooter-")
                          ? "bg-[#C8956C] text-white"
                          : "text-warm hover:bg-[#C8956C]/10"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.span
                        animate={{ rotate: expandedCategory === "scooter" ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        ▶
                      </motion.span>
                      Electric Scooters
                    </motion.button>
                    {/* Sub-series - Tree children */}
                    <AnimatePresence>
                      {expandedCategory === "scooter" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex flex-col gap-1 pl-6"
                        >
                          {[
                            { id: "scooter-Travel Air S", label: "Travel Air S" },
                            { id: "scooter-Rover Power", label: "Rover Power Series" },
                          ].map((sub) => (
                            <motion.button
                              key={sub.id}
                              onClick={() => handleCategoryClick(sub.id)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                                activeCategory === sub.id
                                  ? "bg-[#C8956C] text-white"
                                  : "bg-[#FAF7F4] text-warm hover:bg-[#C8956C]/20"
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {sub.label}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Electric Wheelchairs - Parent with expand/collapse */}
                  <div className="flex flex-col gap-1">
                    <motion.button
                      onClick={() => handleCategoryClick("wheelchair")}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all w-full ${
                        activeCategory === "wheelchair" || activeCategory.startsWith("wheelchair-")
                          ? "bg-[#C8956C] text-white"
                          : "text-warm hover:bg-[#C8956C]/10"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.span
                        animate={{ rotate: expandedCategory === "wheelchair" ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        ▶
                      </motion.span>
                      Electric Wheelchairs
                    </motion.button>
                    {/* Sub-series - Tree children */}
                    <AnimatePresence>
                      {expandedCategory === "wheelchair" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex flex-col gap-1 pl-6"
                        >
                          {[
                            { id: "wheelchair-Travel Air", label: "Travel Air Series" },
                            { id: "wheelchair-Power Max", label: "Power Max Series" },
                            { id: "wheelchair-Spacious Pro", label: "Spacious Pro Series" },
                            { id: "wheelchair-Basic", label: "Basic Series" },
                          ].map((sub) => (
                            <motion.button
                              key={sub.id}
                              onClick={() => handleCategoryClick(sub.id)}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                                activeCategory === sub.id
                                  ? "bg-[#C8956C] text-white"
                                  : "bg-[#FAF7F4] text-warm hover:bg-[#C8956C]/20"
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {sub.label}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Accessories - Standalone */}
                  <motion.button
                    onClick={() => handleCategoryClick("accessories")}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                      activeCategory === "accessories"
                        ? "bg-[#C8956C] text-white"
                        : "text-warm hover:bg-[#C8956C]/10"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Accessories
                  </motion.button>
                </div>
              </div>
            </div>
            {/* Right Content - Sort + Products Grid */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-6">
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

              {/* Products Grid */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeCategory}-${sortBy}`}
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
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
                        <div className="editorial-card overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                          {/* Image Area */}
                          <div className="relative aspect-square bg-gradient-to-br from-[#F5EFE9] to-[#E8D5C4] overflow-hidden">
                            <motion.div
                              className="absolute inset-0 flex items-center justify-center"
                              animate={{ scale: hoveredProduct === product.id ? 1.05 : 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <img
                                src={product.images[selectedImages[product.id] || 0]}
                                alt={product.name}
                                className="w-full h-full object-contain p-4"
                              />
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
                                        : product.badge === "PREMIUM"
                                        ? "bg-[#8B7355] text-white"
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
                                onClick={() => { setQuickViewProduct(product); setQuickViewSelectedImage(0); }}
                              >
                                View
                              </Button>
                            </motion.div>

                            {/* Image Dots */}
                            <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                ${product.id === "s1"
                                  ? ((selectedImages[product.id] ?? 0) === 1 ? 1139.99 : 949.99).toLocaleString()
                                  : product.price.toLocaleString()}
                              </span>
                              {product.originalPrice && (
                                <span className="text-sm text-[#B0B0B0] line-through">
                                  ${product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </div>
                      </HoverScale>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
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
                  <div className="aspect-square bg-gradient-to-br from-[#E8DDD4] to-[#E8E8E8] rounded-xl flex items-center justify-center overflow-hidden">
                    <img
                      src={quickViewProduct.images[quickViewSelectedImage]}
                      alt={quickViewProduct.name}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                  {quickViewProduct.badge && (
                    <Badge
                      className={`absolute top-4 left-4 ${
                        quickViewProduct.badge === "SALE"
                          ? "bg-[#C95959] text-white"
                          : quickViewProduct.badge === "NEW"
                          ? "bg-[#2AAAA0] text-white"
                          : quickViewProduct.badge === "PREMIUM"
                          ? "bg-[#8B7355] text-white"
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

                  <div className="flex items-baseline gap-3 mb-6" suppressHydrationWarning>
                    <span className="text-4xl font-bold text-[#F5A623]">
                      ${quickViewProduct.id === "s1"
                        ? (quickViewSelectedImage === 1 ? 1139.99 : 949.99).toLocaleString()
                        : quickViewProduct.price.toLocaleString()}
                    </span>
                    {quickViewProduct.originalPrice && (
                      <span className="text-xl text-[#B0B0B0] line-through">
                        ${quickViewProduct.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <p className="text-[#6B6B6B] mb-6" suppressHydrationWarning>
                    {quickViewProduct.id === "s1" && quickViewSelectedImage === 1
                      ? quickViewProduct.features.map((f, i) => i === 2 ? "Dual Battery" : f).join(" • ")
                      : quickViewProduct.features.join(" • ")}
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
                        <button
                          key={idx}
                          onClick={() => setQuickViewSelectedImage(idx)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            quickViewSelectedImage === idx ? "border-[#2AAAA0] scale-110" : "border-[#E8E8E8]"
                          } transition-all`}
                          style={{ backgroundColor: color }}
                          title={quickViewProduct.colorNames?.[idx] || color}
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
                    {quickViewProduct.amazonLink && (
                      <Button
                        size="lg"
                        variant="outline"
                        asChild
                      >
                        <a
                          href={quickViewProduct.amazonLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Buy on Amazon
                        </a>
                      </Button>
                    )}
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

      {/* CTA Section - Editorial Style */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-[#3D3330] to-[#5C534E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealOnScroll>
            <span className="editorial-label text-white/70">Get Started</span>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-white mt-4 mb-6 tracking-tight">
              Ready to Transform Your Mobility?
            </h2>
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of satisfied customers who have discovered the
              freedom of GoldSeason electric wheelchairs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-lg px-10 py-4"
              >
                Shop Now on Amazon
              </a>
              <Link
                href="/support"
                className="inline-flex items-center justify-center px-10 py-4 rounded-lg border-2 border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
