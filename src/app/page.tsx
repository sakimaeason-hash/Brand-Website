"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Floating, StaggerContainer, StaggerItem, HoverScale, Magnetic } from "@/components/animations";

const featuredProducts = [
  {
    id: "1",
    name: "GoldSeason Explorer Pro",
    tagline: "All-Terrain Mobility",
    price: 2499,
    badge: "BESTSELLER",
    image: "Explorer Pro",
    color: "#2D2D2D",
  },
  {
    id: "2",
    name: "GoldSeason City Glide",
    tagline: "Urban Mobility Redefined",
    price: 1899,
    badge: "POPULAR",
    image: "City Glide",
    color: "#2AAAA0",
  },
  {
    id: "3",
    name: "GoldSeason Traveler",
    tagline: "Your Perfect Travel Companion",
    price: 1599,
    badge: "NEW",
    image: "Traveler",
    color: "#C9A961",
  },
];

const valueProps = [
  {
    icon: "⚡",
    title: "Lightweight Design",
    desc: "Under 10kg. Easy to lift, easy to travel.",
  },
  {
    icon: "🔋",
    title: "Long Battery Life",
    desc: "Up to 30 miles on a single charge.",
  },
  {
    icon: "✈️",
    title: "Travel Ready",
    desc: "FAA compliant for airline travel.",
  },
  {
    icon: "🛡️",
    title: "5-Year Warranty",
    desc: "Complete coverage for peace of mind.",
  },
];

const testimonials = [
  {
    name: "Margaret Chen",
    age: 68,
    quote: "I can finally travel to see my grandchildren across the country. The GoldSeason is a game-changer.",
    product: "Explorer Pro",
  },
  {
    name: "Robert Williams",
    age: 75,
    quote: "After 40 years of teaching, I thought my traveling days were over. Not anymore.",
    product: "City Glide",
  },
  {
    name: "Eleanor Davis",
    age: 72,
    quote: "So lightweight that I can put it in my car's trunk by myself. Independence restored!",
    product: "Traveler",
  },
];

const lifestyleCategories = [
  {
    icon: "✈️",
    title: "Travel Ready",
    desc: "FAA compliant for air travel. Fold and go anywhere.",
    image: "travel",
    cta: "Explore Travel Series",
  },
  {
    icon: "🏠",
    title: "Daily Life",
    desc: "Navigate your home with ease. Narrow doorways, tight corners — no problem.",
    image: "daily",
    cta: "Explore Daily Series",
  },
  {
    icon: "🌳",
    title: "Outdoor Adventures",
    desc: "Parks, trails, and uneven terrain. All-terrain capability for every journey.",
    image: "outdoor",
    cta: "Explore Outdoor Series",
  },
];

const howItWorks = [
  {
    step: "1",
    icon: "🦽",
    title: " unfold in 3 seconds",
    desc: "Pull the release lever and watch it fold automatically. No tools needed.",
  },
  {
    step: "2",
    icon: "🎮",
    title: "Joystick control",
    desc: "Intuitive joystick handles forward, reverse, and turning with one hand.",
  },
  {
    step: "3",
    icon: "🔋",
    title: "Go up to 30 miles",
    desc: "Long-lasting battery takes you where you need to go, then charges overnight.",
  },
];

const easyToLearn = [
  {
    title: "Simple Joystick Control",
    desc: "Our intuitive joystick can be operated with minimal hand strength. Practice in your home for just 10 minutes and you'll feel confident.",
  },
  {
    title: "Adjustable Speed",
    desc: "Start slow and increase speed as you gain confidence. Full control at all times.",
  },
  {
    title: "We Teach You",
    desc: "Every purchase includes a free 30-minute virtual training session with our mobility specialists.",
  },
];

const trustBadges = [
  { name: "FDA Registered", icon: "🏥" },
  { name: "FAA Compliant", icon: "✈️" },
  { name: "ISO 13485", icon: "✓" },
  { name: "5-Year Warranty", icon: "🛡️" },
  { name: "30-Day Returns", icon: "↩️" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-[#FAF8F5] via-white to-[#E8DDD4] overflow-hidden">
        <motion.div
          className="absolute top-20 right-10 w-96 h-96 bg-[#F5A623]/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-72 h-72 bg-[#2AAAA0]/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="bg-[#F5A623]/10 text-[#2D2D2D] border-[#F5A623]/30 mb-6">
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="mr-1"
                  >
                    ✨
                  </motion.span>
                  Trusted by 50,000+ Customers Worldwide
                </Badge>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2D2D2D] mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Your Golden Years,
                <motion.span
                  className="block text-[#2AAAA0]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Your Freedom
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-lg lg:text-xl text-[#6B6B6B] mb-8 max-w-lg mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Lightweight, reliable, and beautifully designed mobility solutions.
                Because every step you take should be with confidence and dignity.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
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
                      Shop on Amazon
                    </a>
                  </Button>
                </Magnetic>
                <Magnetic>
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="text-lg px-8 border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white"
                  >
                    <Link href="/products">Explore Products</Link>
                  </Button>
                </Magnetic>
              </motion.div>
            </div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F5A623]/20 to-[#2AAAA0]/20 rounded-full blur-3xl" />
                <motion.div
                  className="absolute inset-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img
                    src="/hero-scene.jpg"
                    alt="GoldSeason Explorer Pro Electric Wheelchair"
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                <Floating duration={3} distance={8}>
                  <motion.div
                    className="absolute -top-4 -right-4 bg-white rounded-xl px-4 py-2 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <p className="text-2xl font-bold text-[#F5A623]">10kg</p>
                    <p className="text-xs text-[#6B6B6B]">Ultra Light</p>
                  </motion.div>
                </Floating>
                <Floating duration={4} distance={10}>
                  <motion.div
                    className="absolute -bottom-4 -left-4 bg-white rounded-xl px-4 py-2 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <p className="text-2xl font-bold text-[#2AAAA0]">30mi</p>
                    <p className="text-xs text-[#6B6B6B]">Long Range</p>
                  </motion.div>
                </Floating>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-[#6B6B6B] rounded-full flex justify-center">
            <motion.div
              className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full mt-2"
              animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Value Props Bar */}
      <section className="bg-[#2D2D2D] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {valueProps.map((item, i) => (
              <StaggerItem key={i}>
                <motion.div
                  className="text-center"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <motion.span
                    className="text-4xl mb-3 block"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  >
                    {item.icon}
                  </motion.span>
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-white/70 text-sm">{item.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Shop by Lifestyle */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-4">
              Find Your Perfect Match
            </h2>
            <p className="text-[#6B6B6B] max-w-2xl mx-auto">
              Whether you&apos;re exploring the world, enjoying daily routines, or venturing outdoors —
              there&apos;s a GoldSeason designed for your lifestyle.
            </p>
          </motion.div>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {lifestyleCategories.map((category, i) => (
              <StaggerItem key={i}>
                <HoverScale scale={1.03}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white overflow-hidden group cursor-pointer h-full">
                      <div className="aspect-[4/3] bg-gradient-to-br from-[#E8DDD4] to-[#E8E8E8] flex items-center justify-center relative overflow-hidden">
                        <span className="text-7xl">{category.icon}</span>
                        <motion.div
                          className="absolute inset-0 bg-[#2AAAA0]/5 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-[#2D2D2D] mb-2">
                          {category.title}
                        </h3>
                        <p className="text-[#6B6B6B] text-sm mb-4">
                          {category.desc}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-[#2AAAA0] text-[#2AAAA0] hover:bg-[#2AAAA0] hover:text-white"
                          asChild
                        >
                          <Link href="/products">{category.cta}</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </HoverScale>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-4">
              Simple in 3 Steps
            </h2>
            <p className="text-[#6B6B6B] max-w-2xl mx-auto">
              GoldSeason is designed for real life — easy to fold, easy to control,
              easy to live with.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-6">
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-[#E8E8E8] -translate-y-1/2" />
                  )}
                  <motion.div
                    className="w-24 h-24 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <span className="text-4xl">{item.icon}</span>
                  </motion.div>
                </div>
                <h3 className="text-xl font-bold text-[#2D2D2D] mb-2">
                  <span className="text-[#F5A623]">{item.step}</span>
                  {item.title}
                </h3>
                <p className="text-[#6B6B6B] text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-4">
              Our Bestsellers
            </h2>
            <p className="text-[#6B6B6B] max-w-2xl mx-auto">
              Discover our most loved mobility solutions, crafted with precision engineering
              and thoughtful design for ultimate comfort and independence.
            </p>
          </motion.div>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <StaggerItem key={product.id}>
                <HoverScale scale={1.03}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white overflow-hidden group cursor-pointer">
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-[#E8DDD4] to-[#E8E8E8] flex items-center justify-center">
                        <div
                          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
                          style={{ backgroundColor: product.color + "20" }}
                        >
                          🦽
                        </div>
                        {product.badge && (
                          <div className="absolute top-4 left-4">
                            <Badge
                              className={
                                product.badge === "BESTSELLER"
                                  ? "bg-[#F5A623] text-[#2D2D2D]"
                                  : product.badge === "NEW"
                                  ? "bg-[#2AAAA0] text-white"
                                  : "bg-[#6B6B6B] text-white"
                              }
                            >
                              {product.badge}
                            </Badge>
                          </div>
                        )}
                        <motion.div
                          className="absolute inset-0 bg-[#2D2D2D]/5 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <CardContent className="p-6">
                        <p className="text-sm text-[#2AAAA0] font-medium mb-1">
                          {product.tagline}
                        </p>
                        <h3 className="text-xl font-bold text-[#2D2D2D] mb-3">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-[#F5A623]">
                            ${product.price.toLocaleString()}
                          </span>
                          <Button
                            size="sm"
                            className="bg-[#2D2D2D] text-white hover:bg-[#2AAAA0]"
                            asChild
                          >
                            <Link href="/products">View Details</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </HoverScale>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Button variant="outline" size="lg" asChild className="text-lg px-8">
              <Link href="/products">View All Products</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Easy to Learn */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-[#2AAAA0] to-[#259990] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Easy to Learn, Easy to Use
              </h2>
              <p className="text-white/90 text-lg mb-8">
                We know the joystick controller might feel new at first. That&apos;s why we&apos;ve
                designed it to be intuitive — and why we offer free training with every purchase.
              </p>

              <div className="space-y-6">
                {easyToLearn.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-white/80 text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Button
                  size="lg"
                  className="bg-white text-[#2AAAA0] hover:bg-white/90 text-lg px-8"
                  asChild
                >
                  <a
                    href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get Free Training Included
                  </a>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center">
                <div className="w-32 h-32 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-6xl">🎮</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Joystick Control</h3>
                <p className="text-white/80 text-sm mb-4">
                  Push forward to go forward. Pull back to reverse.
                  <br />
                  It&apos;s that simple.
                </p>
                <div className="flex justify-center gap-4">
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <p className="text-xs text-white/60">Forward</p>
                    <p className="font-semibold">↑</p>
                  </div>
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <p className="text-xs text-white/60">Reverse</p>
                    <p className="font-semibold">↓</p>
                  </div>
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <p className="text-xs text-white/60">Turn</p>
                    <p className="font-semibold">← →</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Travel Ready Highlight */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="order-2 lg:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-[#F5A623]/10 to-[#2AAAA0]/10 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-8xl">✈️</span>
                    <p className="text-[#2D2D2D] font-semibold mt-4">FAA Compliant</p>
                    <p className="text-[#6B6B6B] text-sm">Safe for all airlines</p>
                  </div>
                </div>
                <motion.div
                  className="absolute -bottom-4 -right-4 bg-white rounded-xl px-4 py-3 shadow-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <p className="text-2xl font-bold text-[#F5A623]">3 Sec</p>
                  <p className="text-xs text-[#6B6B6B]">Fold Time</p>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              className="order-1 lg:order-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-[#F5A623]/10 text-[#F5A623] border-[#F5A623]/30 mb-4">
                ✈️ Travel Ready
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-6">
                Go Anywhere You Want to Go
              </h2>
              <p className="text-[#6B6B6B] text-lg mb-6">
                GoldSeason wheelchairs are FAA compliant and can be checked as baggage
                at no extra charge. Your independence shouldn&apos;t stop at the airport.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "FAA approved for all major airlines",
                  "Folds in just 3 seconds",
                  "Compact enough for most airplane overhead bins",
                  "Joystick controller carries on separately",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#2AAAA0] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[#2D2D2D]">{item}</span>
                  </div>
                ))}
              </div>

              <Button className="bg-[#2AAAA0] hover:bg-[#259990]" asChild>
                <Link href="/products">Explore Travel Series</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold uppercase tracking-wider text-[#6B6B6B] mb-6">
              Trusted & Certified
            </p>
            <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
              {trustBadges.map((badge, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="text-sm font-medium text-[#2D2D2D]">{badge.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why GoldSeason */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-6">
                Why Choose GoldSeason?
              </h2>
              <p className="text-[#6B6B6B] text-lg mb-8">
                We believe mobility should never limit your life. Every GoldSeason product
                is crafted with one mission: giving you the freedom to live life on your terms.
              </p>

              <div className="space-y-6">
                {[
                  { title: "Medical-Grade Quality", desc: "Every product meets stringent medical device standards for safety and reliability." },
                  { title: "Thoughtful Design", desc: "Designed with seniors, for seniors. Easy to use, beautiful to look at." },
                  { title: "Exceptional Service", desc: "From purchase to ongoing support, we&apos;re with you every step of the way." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#F5A623]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#F5A623] font-bold">{i + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#2D2D2D] mb-1">{item.title}</h4>
                      <p className="text-[#6B6B6B] text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-[#F5A623]/10 to-[#2AAAA0]/10 rounded-3xl p-8 lg:p-12">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: "50,000+", label: "Happy Customers" },
                    { value: "4.9★", label: "Average Rating" },
                    { value: "30", label: "Day Returns" },
                    { value: "5", label: "Year Warranty" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      className="text-center p-4 bg-white rounded-2xl shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <p className="text-3xl font-bold text-[#F5A623]">{stat.value}</p>
                      <p className="text-sm text-[#6B6B6B]">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-4">
              What Our Customers Say
            </h2>
            <p className="text-[#6B6B6B] max-w-2xl mx-auto">
              Real stories from real people who have rediscovered their freedom with GoldSeason.
            </p>
          </motion.div>

          <StaggerContainer className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <StaggerItem key={i}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white border-0 h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F5A623] to-[#2AAAA0] flex items-center justify-center text-white font-bold">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#2D2D2D]">{testimonial.name}</p>
                          <p className="text-sm text-[#6B6B6B]">Age {testimonial.age}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, idx) => (
                          <svg
                            key={idx}
                            className="w-4 h-4 text-[#F5A623] fill-[#F5A623]"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-[#6B6B6B] mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                      <p className="text-sm text-[#2AAAA0] font-medium">
                        Using: {testimonial.product}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-[#2D2D2D] to-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Reclaim Your Freedom?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Join over 50,000 happy customers who have discovered the joy of
              hassle-free mobility. Your next adventure is just a step away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                    Shop on Amazon
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
                  <Link href="/products">View All Products</Link>
                </Button>
              </Magnetic>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
