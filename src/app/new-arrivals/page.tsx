"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RevealOnScroll, HoverScale } from "@/components/animations";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useCart } from "@/context/CartContext";

const newProducts = [
  {
    id: "elite-x",
    name: "GoldSeason Elite X",
    tagline: "The Future of Mobility",
    price: 2799,
    originalPrice: 3199,
    badge: "NEW",
    features: ["AI-Powered Navigation", "25-Mile Range", "Smart App Control", "Auto-Folding"],
    description: "Our most advanced wheelchair featuring AI-assisted navigation, premium suspension, and a 25-mile range.",
    launchDate: "Just Released",
  },
  {
    id: "pro-plus",
    name: "GoldSeason Pro Plus",
    tagline: "Enhanced Performance",
    price: 1799,
    originalPrice: 1999,
    badge: "NEW",
    features: ["18-Mile Range", "Enhanced Comfort Seat", "All-Terrain Wheels", "Quick-Release Battery"],
    description: "Building on our popular Pro model, the Pro Plus offers extended range and enhanced comfort features.",
    launchDate: "New This Month",
  },
];

const promotions = [
  {
    id: "summer-sale",
    title: "Summer Freedom Sale",
    discount: "Save Up To $300",
    description: "Celebrate the season with special savings on select GoldSeason models.",
    endDate: "2026-07-30T23:59:59",
    code: "SUMMER26",
    terms: "Valid on Lite and Pro models. Cannot be combined with other offers.",
    limited: true,
  },
  {
    id: "trade-in",
    title: "Trade-In Program",
    discount: "Get Up To $500 Credit",
    description: "Trade in any mobility device and receive credit toward a new GoldSeason wheelchair.",
    code: "No Code Needed",
    terms: "Trade-in value depends on condition and model. Contact us for assessment.",
    limited: false,
  },
  {
    id: "referral",
    title: "Refer a Friend",
    discount: "$100 For You Both",
    description: "Refer a friend to GoldSeason and you both receive $100 off your purchase.",
    code: "REFER100",
    terms: "Friend must be a new customer. Credit applied after purchase completion.",
    limited: false,
  },
];

const bundleDeals = [
  { name: "Travel Essentials Bundle", items: ["Wheelchair + Travel Bag + Battery Backup"], savings: "$150", price: 1149, originalPrice: 1299 },
  { name: "Comfort Plus Bundle", items: ["Wheelchair + Premium Cushion + Weather Cover"], savings: "$120", price: 1379, originalPrice: 1499 },
  { name: "Complete Care Bundle", items: ["Wheelchair + Maintenance Kit + Extended Warranty"], savings: "$200", price: 1299, originalPrice: 1499 },
];

const flashSaleProduct = { name: "GoldSeason Lite", tagline: "Lightweight & Portable", price: 1299, originalPrice: 1599, discount: "20% Off", remaining: 12 };

export default function NewArrivalsPage() {
  const { addItem } = useCart();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const handleAddBundle = (bundle: (typeof bundleDeals)[0]) => {
    addItem({ id: `bundle-${bundle.name.toLowerCase().replace(/\s+/g, '-')}`, name: bundle.name, price: bundle.price });
  };

  return (
    <div className="bg-cream">
      {/* Hero - Editorial Style */}
      <section className="relative bg-gradient-to-br from-[#C8956C] to-[#8B7355] py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="editorial-label text-white/70">🎉 Introducing the Elite X</span>
            <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] font-bold text-white mt-4 mb-6 tracking-tight">
              New Arrivals
              <br />
              <span className="text-[#E8D5C4]">& Special Offers</span>
            </h1>
            <p className="text-[clamp(1.125rem,2vw,1.375rem)] text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover our latest innovations and exclusive promotions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#new-products" className="btn-primary bg-white text-[#C8956C] hover:bg-[#E8D5C4]">
                Shop New Arrivals
              </a>
              <a href="#promotions" className="inline-flex items-center justify-center px-8 py-3 rounded-lg border-2 border-white/30 text-white font-medium hover:bg-white/10 transition-colors">
                View All Promotions
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* New Products - Editorial Magazine Grid */}
      <section id="new-products" className="py-16 lg:py-24 section-editorial bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="editorial-label text-[#C8956C]">Just Launched</span>
            <h2 className="editorial-subheading text-deep-espresso mt-2">New Products</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {newProducts.map((product, i) => (
              <RevealOnScroll key={product.id} delay={i * 0.15}>
                <HoverScale scale={1.01}>
                  <div
                    className="editorial-card overflow-hidden"
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="grid md:grid-cols-2">
                      {/* Image Side */}
                      <div className="aspect-square md:aspect-auto bg-gradient-to-br from-[#C8956C]/20 to-[#9CAF88]/20 flex items-center justify-center relative p-8">
                        <span className="absolute top-4 left-4 px-3 py-1 bg-[#C8956C] text-white text-xs font-bold rounded-full">
                          {product.badge}
                        </span>
                        <motion.span
                          className="text-muted text-xl"
                          animate={{ scale: hoveredCard === i ? 1.05 : 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {product.name}
                        </motion.span>
                      </div>

                      {/* Content Side */}
                      <div className="p-8 flex flex-col justify-center">
                        <p className="text-sm text-[#C8956C] font-medium mb-1">{product.launchDate}</p>
                        <h3 className="text-2xl font-bold text-deep-espresso mb-1">{product.name}</h3>
                        <p className="text-muted mb-4">{product.tagline}</p>

                        <div className="flex items-baseline gap-3 mb-4">
                          <span className="text-3xl font-bold text-[#C8956C]">
                            ${product.price.toLocaleString()}
                          </span>
                          <span className="text-lg text-muted line-through">
                            ${product.originalPrice.toLocaleString()}
                          </span>
                        </div>

                        <p className="text-muted text-sm mb-4">{product.description}</p>

                        <ul className="space-y-2 mb-6">
                          {product.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-muted">
                              <svg className="w-4 h-4 text-[#9CAF88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <div className="flex gap-3">
                          <a
                            href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-center py-3 bg-[#C8956C] text-white rounded-lg font-medium hover:bg-[#8B7355] transition-colors"
                          >
                            Pre-Order Now
                          </a>
                          <button className="flex-1 py-3 border border-[#C8956C] text-[#C8956C] rounded-lg font-medium hover:bg-[#C8956C]/10 transition-colors">
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </HoverScale>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Limited Time Offers - Editorial Cards */}
      <section id="promotions" className="py-16 lg:py-24 section-editorial bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="editorial-label text-[#C8956C]">Limited Time</span>
            <h2 className="editorial-subheading text-deep-espresso mt-2">Current Promotions</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {promotions.map((promo, i) => (
              <RevealOnScroll key={promo.id} delay={i * 0.1}>
                <div className="editorial-card p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#C8956C]/10 rounded-bl-full" />
                  <div className="relative">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${promo.limited ? 'bg-[#9CAF88] text-white' : 'bg-[#E8D5C4] text-warm'}`}>
                      {promo.limited ? "⏰ Limited Time" : "🎁 Ongoing"}
                    </span>

                    <h3 className="text-xl font-semibold text-deep-espresso mb-2">{promo.title}</h3>
                    <p className="text-2xl font-bold text-[#C8956C] mb-3">{promo.discount}</p>
                    <p className="text-muted text-sm mb-4">{promo.description}</p>

                    {promo.limited && (
                      <div className="mb-4">
                        <p className="text-xs text-muted mb-1">Offer ends in:</p>
                        <CountdownTimer targetDate={promo.endDate!} />
                      </div>
                    )}

                    <div className="bg-[#FAF7F4] rounded-lg p-3 mb-4">
                      <p className="text-xs text-muted">Use code:</p>
                      <p className="font-mono font-bold text-deep-espresso">{promo.code}</p>
                    </div>

                    <p className="text-xs text-muted mb-4">{promo.terms}</p>

                    <button className="w-full py-3 bg-[#C8956C] text-white rounded-lg font-medium hover:bg-[#8B7355] transition-colors">
                      Claim Offer
                    </button>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Bundle Deals - Dark Editorial */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-[#3D3330] to-[#5C534E]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="editorial-label text-[#C8956C]">Bundle & Save</span>
            <h2 className="editorial-subheading text-white mt-2">Complete Care Packages</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {bundleDeals.map((bundle, i) => (
              <RevealOnScroll key={i} delay={i * 0.1}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                  <span className="inline-block px-3 py-1 bg-[#C8956C] text-white text-xs font-bold rounded-full mb-4">
                    Save {bundle.savings}
                  </span>

                  <h3 className="text-xl font-semibold text-white mb-2">{bundle.name}</h3>

                  <ul className="text-sm text-white/70 mb-4 space-y-1">
                    {bundle.items.map((item, j) => <li key={j}>{item}</li>)}
                  </ul>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-[#C8956C]">${bundle.price.toLocaleString()}</span>
                    <span className="text-sm text-white/50 line-through">${bundle.originalPrice.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => handleAddBundle(bundle)}
                    className="w-full py-3 bg-white text-[#3D3330] rounded-lg font-medium hover:bg-[#C8956C] hover:text-white transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="py-12 bg-[#C8956C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                ⚡ Flash Sale: 20% Off {flashSaleProduct.name}
              </h2>
              <p className="text-white/80">
                {flashSaleProduct.tagline} at an unbeatable price. Only {flashSaleProduct.remaining} units available!
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-white/70 mb-1">Sale ends in</p>
                <CountdownTimer targetDate="2026-07-30T23:59:59" />
              </div>
              <a
                href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-white text-[#C8956C] rounded-lg font-medium hover:bg-[#E8D5C4] transition-colors"
              >
                Shop Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter - Editorial Style */}
      <section className="py-16 lg:py-24 section-editorial bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealOnScroll>
            <span className="editorial-label text-[#C8956C]">Stay Updated</span>
            <h2 className="editorial-subheading text-deep-espresso mt-2 mb-4">Be the First to Know</h2>
            <p className="text-muted mb-8 max-w-xl mx-auto">
              Subscribe to get exclusive access to new product launches and member-only promotions.
            </p>
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#9CAF88]/10 text-[#9CAF88] p-6 rounded-2xl inline-block"
              >
                <p className="font-semibold text-lg">Thanks for subscribing!</p>
                <p className="text-sm">Check your email for your 10% off code.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-3 rounded-lg border border-stone focus:border-[#C8956C] outline-none transition-colors bg-white"
                />
                <button type="submit" className="btn-primary whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            )}
            <p className="text-sm text-muted mt-4">New subscribers get 10% off their first order!</p>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
