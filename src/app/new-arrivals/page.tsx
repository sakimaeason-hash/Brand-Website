"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    badgeColor: "bg-[#F5A623]",
    features: [
      "AI-Powered Navigation",
      "25-Mile Range",
      "Smart App Control",
      "Auto-Folding",
    ],
    description: "Our most advanced wheelchair featuring AI-assisted navigation, premium suspension, and a 25-mile range. The Elite X represents the pinnacle of mobility technology.",
    image: "Elite X",
    launchDate: "Just Released",
  },
  {
    id: "pro-plus",
    name: "GoldSeason Pro Plus",
    tagline: "Enhanced Performance",
    price: 1799,
    originalPrice: 1999,
    badge: "NEW",
    badgeColor: "bg-[#F5A623]",
    features: [
      "18-Mile Range",
      "Enhanced Comfort Seat",
      "All-Terrain Wheels",
      "Quick-Release Battery",
    ],
    description: "Building on our popular Pro model, the Pro Plus offers extended range and enhanced comfort features for the active user.",
    image: "Pro Plus",
    launchDate: "New This Month",
  },
];

const promotions = [
  {
    id: "summer-sale",
    title: "Summer Freedom Sale",
    discount: "Save Up To $300",
    description: "Celebrate the season with special savings on select GoldSeason models. Limited time offer.",
    endDate: "2026-06-30T23:59:59",
    code: "SUMMER26",
    terms: "Valid on Lite and Pro models. Cannot be combined with other offers.",
  },
  {
    id: "trade-in",
    title: "Trade-In Program",
    discount: "Get Up To $500 Credit",
    description: "Trade in any mobility device and receive credit toward a new GoldSeason wheelchair.",
    endDate: "2026-12-31T23:59:59",
    code: "No Code Needed",
    terms: "Trade-in value depends on condition and model. Contact us for assessment.",
  },
  {
    id: "referral",
    title: "Refer a Friend",
    discount: "$100 For You Both",
    description: "Refer a friend to GoldSeason and you both receive $100 off your purchase.",
    endDate: "Ongoing",
    code: "REFER100",
    terms: "Friend must be a new customer. Credit applied after purchase completion.",
  },
];

const bundleDeals = [
  {
    name: "Travel Essentials Bundle",
    items: ["Wheelchair + Travel Bag + Battery Backup"],
    savings: "$150",
    price: 1149,
    originalPrice: 1299,
  },
  {
    name: "Comfort Plus Bundle",
    items: ["Wheelchair + Premium Cushion + Weather Cover"],
    savings: "$120",
    price: 1379,
    originalPrice: 1499,
  },
  {
    name: "Complete Care Bundle",
    items: ["Wheelchair + Maintenance Kit + Extended Warranty"],
    savings: "$200",
    price: 1299,
    originalPrice: 1499,
  },
];

const flashSaleProduct = {
  name: "GoldSeason Lite",
  tagline: "Lightweight & Portable",
  price: 1299,
  originalPrice: 1599,
  discount: "20% Off",
  remaining: 12,
};

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
    addItem({
      id: `bundle-${bundle.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: bundle.name,
      price: bundle.price,
    });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#F5A623] to-[#E09520] py-20 lg:py-32 overflow-hidden">
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
            <Badge className="mb-4 bg-white/20 text-white border-0 text-sm">
              🎉 Introducing the Elite X
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-[#2D2D2D] mb-6">
              New Arrivals
              <br />
              <span className="text-white">& Special Offers</span>
            </h1>
            <p className="text-lg text-[#2D2D2D]/80 mb-8">
              Discover our latest innovations and exclusive promotions.
              Limited time offers for a limited time only.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a]"
                asChild
              >
                <a href="#new-products">Shop New Arrivals</a>
              </Button>
              <Button
                variant="outline"
                className="border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white"
                asChild
              >
                <a href="#promotions">View All Promotions</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* New Products Section */}
      <section id="new-products" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-[#2AAAA0] font-medium tracking-wide uppercase mb-2">Just Launched</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D]">New Products</h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {newProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  className="overflow-hidden group hover:shadow-xl transition-all"
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="grid md:grid-cols-2">
                    <div className="aspect-square md:aspect-auto bg-gradient-to-br from-[#F5A623]/20 to-[#2AAAA0]/20 flex items-center justify-center relative">
                      <Badge className={`absolute top-4 left-4 ${product.badgeColor} text-[#2D2D2D]`}>
                        {product.badge}
                      </Badge>
                      <motion.span
                        className="text-[#6B6B6B] text-xl"
                        animate={{ scale: hoveredCard === i ? 1.05 : 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {product.image}
                      </motion.span>
                    </div>
                    <CardContent className="p-8 flex flex-col justify-center">
                      <p className="text-sm text-[#2AAAA0] font-medium mb-1">{product.launchDate}</p>
                      <h3 className="text-2xl font-bold text-[#2D2D2D] mb-1">{product.name}</h3>
                      <p className="text-[#6B6B6B] mb-4">{product.tagline}</p>

                      <div className="flex items-baseline gap-3 mb-4">
                        <motion.span
                          className="text-3xl font-bold text-[#F5A623]"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          ${product.price.toLocaleString()}
                        </motion.span>
                        <span className="text-lg text-[#B0B0B0] line-through">
                          ${product.originalPrice.toLocaleString()}
                        </span>
                      </div>

                      <p className="text-[#6B6B6B] text-sm mb-4">{product.description}</p>

                      <ul className="space-y-2 mb-6">
                        {product.features.map((feature, idx) => (
                          <motion.li
                            key={idx}
                            className="flex items-center gap-2 text-sm text-[#6B6B6B]"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            viewport={{ once: true }}
                          >
                            <svg className="w-4 h-4 text-[#2AAAA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </motion.li>
                        ))}
                      </ul>

                      <div className="flex gap-3">
                        <Button
                          className="flex-1 bg-[#F5A623] text-[#2D2D2D] hover:bg-[#E09520]"
                          asChild
                        >
                          <a
                            href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Pre-Order Now
                          </a>
                        </Button>
                        <Button variant="outline" className="flex-1">
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Limited Time Offers */}
      <section id="promotions" className="py-16 lg:py-24 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2">Limited Time</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D]">Current Promotions</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {promotions.map((promo, i) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="relative overflow-hidden hover:shadow-lg transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#F5A623]/10 rounded-bl-full" />
                  <CardContent className="p-8 relative">
                    <Badge className="mb-4 bg-[#2AAAA0] text-white">
                      {promo.id === "summer-sale" ? "⏰ Limited Time" : "🎁 Ongoing"}
                    </Badge>

                    <h3 className="text-xl font-bold text-[#2D2D2D] mb-2">{promo.title}</h3>
                    <p className="text-2xl font-bold text-[#F5A623] mb-3">{promo.discount}</p>
                    <p className="text-[#6B6B6B] text-sm mb-4">{promo.description}</p>

                    {promo.id === "summer-sale" && (
                      <div className="mb-4">
                        <p className="text-xs text-[#6B6B6B] mb-1">Offer ends in:</p>
                        <CountdownTimer targetDate={promo.endDate} />
                      </div>
                    )}

                    <div className="bg-[#FAF8F5] rounded-lg p-3 mb-4">
                      <p className="text-xs text-[#6B6B6B]">Use code:</p>
                      <p className="font-mono font-bold text-[#2D2D2D]">{promo.code}</p>
                    </div>

                    <p className="text-xs text-[#B0B0B0] mb-4">{promo.terms}</p>

                    <Button className="w-full bg-[#2AAAA0] hover:bg-[#259990]">
                      Claim Offer
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundle Deals */}
      <section className="py-16 lg:py-24 bg-[#2D2D2D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2">Bundle & Save</p>
            <h2 className="text-3xl lg:text-4xl font-bold">Complete Care Packages</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {bundleDeals.map((bundle, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white/5 border-white/10 text-white overflow-hidden hover:bg-white/10 transition-all">
                  <CardContent className="p-6">
                    <Badge className="mb-4 bg-[#F5A623] text-[#2D2D2D]">
                      Save {bundle.savings}
                    </Badge>

                    <h3 className="text-xl font-bold mb-2">{bundle.name}</h3>

                    <ul className="text-sm text-[#B0B0B0] mb-4 space-y-1">
                      {bundle.items.map((item, j) => (
                        <li key={j}>{item}</li>
                      ))}
                    </ul>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-[#F5A623]">
                        ${bundle.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-[#6B6B6B] line-through">
                        ${bundle.originalPrice.toLocaleString()}
                      </span>
                    </div>

                    <Button
                      className="w-full bg-white text-[#2D2D2D] hover:bg-[#F5A623]"
                      onClick={() => handleAddBundle(bundle)}
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="py-12 bg-[#F5A623]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-bold text-[#2D2D2D] mb-2">
                ⚡ Flash Sale: 20% Off {flashSaleProduct.name}
              </h2>
              <p className="text-[#2D2D2D]/80">
                {flashSaleProduct.tagline} at an unbeatable price. Only {flashSaleProduct.remaining} units available!
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-[#2D2D2D]/70 mb-1">Sale ends in</p>
                <CountdownTimer targetDate="2026-06-30T23:59:59" />
              </div>
              <Button
                className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a]"
                asChild
              >
                <a
                  href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Shop Now
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[#2D2D2D] mb-4">
              Be the First to Know
            </h2>
            <p className="text-[#6B6B6B] mb-8">
              Subscribe to get exclusive access to new product launches and member-only promotions.
            </p>
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#2AAAA0]/10 text-[#2AAAA0] p-4 rounded-lg inline-block"
              >
                <p className="font-medium">Thanks for subscribing!</p>
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
                  className="flex-1 px-6 py-3 rounded-lg border border-[#E8E8E8] focus:border-[#2AAAA0] outline-none transition-colors"
                />
                <Button type="submit" className="bg-[#2AAAA0] hover:bg-[#259990]">
                  Subscribe
                </Button>
              </form>
            )}
            <p className="text-xs text-[#B0B0B0] mt-4">
              New subscribers get 10% off their first order!
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}