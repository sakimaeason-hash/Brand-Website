"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StaggerContainer, StaggerItem, HoverScale, Magnetic } from "@/components/animations";

const featuredProducts = [
  {
    id: "1",
    name: "GoldSeason Travel Air W 03",
    tagline: "Ultra Lightweight Travel",
    price: 599.99,
    badge: "BESTSELLER",
    image: "/products/Travel Air W 03C.png",
    color: "#C8956C",
  },
  {
    id: "2",
    name: "GoldSeason Power Max 01",
    tagline: "All-Terrain Performance",
    price: 1099.99,
    badge: "BESTSELLER",
    image: "/products/Power Max 01A.png",
    color: "#3D3330",
  },
  {
    id: "3",
    name: "GoldSeason Travel Air W 26",
    tagline: "Premium Compact Design",
    price: 649.99,
    badge: "NEW",
    image: "/products/Travel Air W 26A.png",
    color: "#C8956C",
  },
  {
    id: "4",
    name: "GoldSeason Spacious Pro 15",
    tagline: "Extra Wide Heavy Duty",
    price: 699.99,
    badge: "PREMIUM",
    image: "/products/Spacious Pro 15B.png",
    color: "#8B7355",
  },
];

const testimonials = [
  {
    name: "Hadji Reyes",
    age: 65,
    quote: "It took only 3 days since I placed the order and it arrived in perfect conditions. The weight is so light even I can load and unload it in my car trunk by myself.",
    product: "Travel Air W 03C",
    image: "/stories/Hadji Reyes.jpg",
  },
  {
    name: "Stephanie Freeman",
    age: 71,
    quote: "I just got my new wheelchair it was fairly easy to put it together. I love that when it's backing up it warns people around you. It's very spacious and comfortable.",
    product: "Spacious Pro 15B",
    image: null,
  },
  {
    name: "Stacy Olney",
    age: 69,
    quote: "I am a very big girl and was very glad that I fit into this chair comfortably. It's a slightly tight, but it is definitely workable. The chair goes very fast if you wanted to and I keep it on the slow cycle.",
    product: "Spacious Pro 15B",
    image: null,
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

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Full-width background image */}
        <div className="absolute inset-0">
          <img
            src="/hero-scene.jpg"
            alt="GoldSeason Explorer Pro Electric Wheelchair"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center' }}
          />
          {/* Left side blur overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F4]/95 via-[#FAF7F4]/70 to-transparent lg:w-3/5" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="bg-[#C8956C]/10 text-[#3D3330] border-[#C8956C]/30 mb-6">
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
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3D3330] mb-6 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Your Golden Years,
                <motion.span
                  className="block text-[#C8956C]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  Your Freedom
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-lg lg:text-xl text-[#5C534E] mb-8 max-w-lg mx-auto lg:mx-0"
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
                    className="bg-[#C8956C] text-white hover:brightness-110 text-lg px-8 shadow-warm"
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
                    className="text-lg px-8 border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355] hover:text-white"
                  >
                    <Link href="/products">Explore Products</Link>
                  </Button>
                </Magnetic>
              </motion.div>
            </div>
          </div>
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
            <h2 className="text-3xl lg:text-4xl font-bold text-[#3D3330] mb-4">
              Find Your Perfect Match
            </h2>
            <p className="text-[#5C534E] max-w-2xl mx-auto">
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
                    <Card className="bg-white overflow-hidden group cursor-pointer h-full border-[#D4CCC5]">
                      <div className="aspect-[4/3] bg-gradient-to-br from-[#E8D5C4] to-[#D4CCC5] flex items-center justify-center relative overflow-hidden">
                        <span className="text-7xl">{category.icon}</span>
                        <motion.div
                          className="absolute inset-0 bg-[#C8956C]/5 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-[#3D3330] mb-2">
                          {category.title}
                        </h3>
                        <p className="text-[#5C534E] text-sm mb-4">
                          {category.desc}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-[#C8956C] text-[#C8956C] hover:bg-[#C8956C] hover:text-white"
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
      <section className="py-20 lg:py-28 bg-[#FAF7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-[#3D3330] mb-4">
              Simple in 3 Steps
            </h2>
            <p className="text-[#5C534E] max-w-2xl mx-auto">
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
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-[#D4CCC5] -translate-y-1/2" />
                  )}
                  <motion.div
                    className="w-24 h-24 mx-auto bg-white rounded-full shadow-warm flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <span className="text-4xl">{item.icon}</span>
                  </motion.div>
                </div>
                <h3 className="text-xl font-bold text-[#3D3330] mb-2">
                  <span className="text-[#C8956C]">{item.step}</span>
                  {item.title}
                </h3>
                <p className="text-[#5C534E] text-sm">{item.desc}</p>
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
            <h2 className="text-3xl lg:text-4xl font-bold text-[#3D3330] mb-4">
              Our Bestsellers
            </h2>
            <p className="text-[#5C534E] max-w-2xl mx-auto">
              Discover our most loved mobility solutions, crafted with precision engineering
              and thoughtful design for ultimate comfort and independence.
            </p>
          </motion.div>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <StaggerItem key={product.id}>
                <HoverScale scale={1.03}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white overflow-hidden group cursor-pointer border-[#D4CCC5]">
                      <div className="relative aspect-[4/3] bg-gradient-to-br from-[#E8D5C4] to-[#D4CCC5] flex items-center justify-center">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain p-4"
                        />
                        {product.badge && (
                          <div className="absolute top-4 left-4">
                            <Badge
                              className={
                                product.badge === "BESTSELLER"
                                  ? "bg-[#C8956C] text-white"
                                  : product.badge === "NEW"
                                  ? "bg-[#9CAF88] text-white"
                                  : product.badge === "PREMIUM"
                                  ? "bg-[#8B7355] text-white"
                                  : "bg-[#5C534E] text-white"
                              }
                            >
                              {product.badge}
                            </Badge>
                          </div>
                        )}
                        <motion.div
                          className="absolute inset-0 bg-[#3D3330]/5 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <CardContent className="p-6">
                        <p className="text-sm text-[#9CAF88] font-medium mb-1">
                          {product.tagline}
                        </p>
                        <h3 className="text-xl font-bold text-[#3D3330] mb-3">
                          {product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-[#C8956C]">
                            ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <Button
                            size="sm"
                            className="bg-[#3D3330] text-white hover:bg-[#C8956C]"
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
            <Button variant="outline" size="lg" asChild className="text-lg px-8 border-[#8B7355] text-[#8B7355] hover:bg-[#8B7355] hover:text-white">
              <Link href="/products">View All Products</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Easy to Learn - Premium Warm Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-[#8B7355] to-[#5C534E] text-white">
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
                  className="bg-[#C8956C] text-white hover:brightness-110 text-lg px-8"
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
                <div className="aspect-[4/3] bg-gradient-to-br from-[#C8956C]/10 to-[#9CAF88]/10 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-8xl">✈️</span>
                    <p className="text-[#3D3330] font-semibold mt-4">FAA Compliant</p>
                    <p className="text-[#5C534E] text-sm">Safe for all airlines</p>
                  </div>
                </div>
                <motion.div
                  className="absolute -bottom-4 -right-4 bg-white rounded-xl px-4 py-3 shadow-warm border border-[#D4CCC5]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <p className="text-2xl font-bold text-[#C8956C]">3 Sec</p>
                  <p className="text-xs text-[#5C534E]">Fold Time</p>
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
              <Badge className="bg-[#C8956C]/10 text-[#C8956C] border-[#C8956C]/30 mb-4">
                ✈️ Travel Ready
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#3D3330] mb-6">
                Go Anywhere You Want to Go
              </h2>
              <p className="text-[#5C534E] text-lg mb-6">
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
                    <div className="w-6 h-6 rounded-full bg-[#9CAF88] flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[#3D3330]">{item}</span>
                  </div>
                ))}
              </div>

              <Button className="bg-[#8B7355] hover:bg-[#5C534E]" asChild>
                <Link href="/products">Explore Travel Series</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why GoldSeason */}
      <section className="py-20 lg:py-28 bg-[#FAF7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-[#3D3330] mb-6">
                Why Choose GoldSeason?
              </h2>
              <p className="text-[#5C534E] text-lg mb-8">
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
                    <div className="w-10 h-10 rounded-full bg-[#C8956C]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#C8956C] font-bold">{i + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#3D3330] mb-1">{item.title}</h4>
                      <p className="text-[#5C534E] text-sm">{item.desc}</p>
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
              <div className="bg-gradient-to-br from-[#C8956C]/10 to-[#9CAF88]/10 rounded-3xl p-8 lg:p-12">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: "50,000+", label: "Happy Customers" },
                    { value: "4.9★", label: "Average Rating" },
                    { value: "30", label: "Day Returns" },
                    { value: "5", label: "Year Warranty" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      className="text-center p-4 bg-white rounded-2xl shadow-warm border border-[#D4CCC5]"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <p className="text-3xl font-bold text-[#C8956C]">{stat.value}</p>
                      <p className="text-sm text-[#5C534E]">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-[#3D3330] mb-4">
              What Our Customers Say
            </h2>
            <p className="text-[#5C534E] max-w-2xl mx-auto">
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
                  <Card className="bg-[#FAF7F4] border-[#D4CCC5] h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        {testimonial.image ? (
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C8956C] to-[#8B7355] flex items-center justify-center text-white font-bold">
                            {testimonial.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#3D3330]">{testimonial.name}</p>
                          <p className="text-sm text-[#5C534E]">Age {testimonial.age}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, idx) => (
                          <svg
                            key={idx}
                            className="w-4 h-4 text-[#C8956C] fill-[#C8956C]"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-[#5C534E] mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                      <p className="text-sm text-[#8B7355] font-medium">
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

      {/* CTA Section - Premium Dark */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-[#3D3330] to-[#2A2523]">
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
                  className="bg-[#C8956C] text-white hover:brightness-110 text-lg px-8"
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
