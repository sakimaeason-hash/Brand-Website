"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RevealOnScroll, HoverScale } from "@/components/animations";

const guides = [
  {
    slug: "kitchen",
    title: "Kitchen Accessibility",
    subtitle: "Powered Wheelchair Adaptation",
    description:
      "Complete guide to making your kitchen safe and accessible — from doorway width and counter height to sink depth and cooktop selection.",
    difficulty: "Medium",
    budget: "$140–$15,000",
    duration: "1 hour – 2 weeks",
    icon: "🍳",
    color: "#C8956C",
    sections: 9,
  },
  {
    slug: "bedroom",
    title: "Bedroom Accessibility",
    subtitle: "Powered Wheelchair Adaptation",
    description:
      "Everything you need to get in and out of bed safely and independently — bed height, transfer aids, closet access, emergency response, and nighttime safety.",
    difficulty: "Easy",
    budget: "$45–$1,800",
    duration: "1 hour – 1 week",
    icon: "🛏️",
    color: "#9CAF88",
    sections: 9,
  },
  {
    slug: "outdoor",
    title: "Outdoor & Yard Accessibility",
    subtitle: "Powered Wheelchair Adaptation",
    description:
      "Transform your outdoor space into an accessible retreat — ramps, pathways, gardening, outdoor furniture, and enjoyment of fresh air safely.",
    difficulty: "Medium",
    budget: "$100–$10,000",
    duration: "1 day – 3 weeks",
    icon: "🌿",
    color: "#8BA4B4",
    sections: 9,
  },
];

const features = [
  {
    icon: "📐",
    title: "Measured for You",
    desc: "Every dimension in our guides is based on real ADA standards — no guessing, no approximations.",
  },
  {
    icon: "💰",
    title: "Every Budget Covered",
    desc: "From $10 quick fixes to $15,000 full renovations, we give you options at every price point.",
  },
  {
    icon: "🔬",
    title: "Expert-Reviewed",
    desc: "All content is reviewed by occupational therapists and rehabilitation engineers for accuracy.",
  },
];

export default function GuidesPage() {
  return (
    <div className="bg-cream">
      {/* Hero - Editorial Style */}
      <section className="relative bg-gradient-to-br from-[#9CAF88] via-[#C8956C] to-[#8BA4B4] text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.05] rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#E8D5C4]/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.span
              className="editorial-label text-white/70"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              GoldSeason Home Guides
            </motion.span>
            <motion.h1
              className="text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] font-bold text-white mt-4 mb-6 tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Room-by-Room
              <br />
              <span className="text-[#E8D5C4]">Accessibility Guides</span>
            </motion.h1>
            <motion.p
              className="text-[clamp(1.125rem,2vw,1.375rem)] text-white/80 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Practical, expert-reviewed guides to help wheelchair users live
              safely and independently in every room of their home.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Guides Grid - Editorial Magazine Style */}
      <section className="py-16 lg:py-24 section-editorial">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {guides.map((guide, i) => (
              <RevealOnScroll key={guide.slug} delay={i * 0.15}>
                <HoverScale scale={1.02}>
                  <Link href={`/guides/${guide.slug}`} className="block h-full">
                    <div className="editorial-card h-full flex flex-col overflow-hidden group cursor-pointer">
                      {/* Top color bar */}
                      <div
                        className="h-1.5 transition-all duration-300"
                        style={{ backgroundColor: guide.color }}
                      />

                      <div className="p-8 flex flex-col flex-grow">
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-transform duration-300 group-hover:scale-110"
                          style={{ backgroundColor: guide.color + "20" }}
                        >
                          {guide.icon}
                        </div>

                        <h2 className="text-xl font-semibold text-deep-espresso mb-1">
                          {guide.title}
                        </h2>
                        <p className="text-sm text-muted mb-4">
                          {guide.subtitle}
                        </p>
                        <p className="text-muted mb-6 leading-relaxed flex-grow">
                          {guide.description}
                        </p>

                        {/* Meta */}
                        <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-stone">
                          <div>
                            <p className="text-xs text-muted uppercase tracking-wide mb-1">Difficulty</p>
                            <p className="font-semibold" style={{ color: guide.color }}>
                              {guide.difficulty}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted uppercase tracking-wide mb-1">Budget</p>
                            <p className="font-semibold text-deep-espresso text-sm">
                              {guide.budget}
                            </p>
                          </div>
                        </div>

                        <div
                          className="w-full py-3 px-6 rounded-lg font-medium text-center transition-all duration-300 text-white"
                          style={{ backgroundColor: guide.color }}
                        >
                          Read Guide →
                        </div>
                      </div>
                    </div>
                  </Link>
                </HoverScale>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Why These Guides - Editorial Feature Section */}
      <section className="py-16 lg:py-24 section-editorial bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="editorial-label text-[#C8956C]">Our Approach</span>
            <h2 className="editorial-subheading text-deep-espresso mt-2">
              Built for Real Life
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((item, i) => (
              <RevealOnScroll key={i} delay={i * 0.1}>
                <div className="text-center p-6">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-deep-espresso mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Editorial Style */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-[#C8956C] to-[#8B7355]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealOnScroll>
            <span className="editorial-label text-white/70">Get Started</span>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-white mt-4 mb-6 tracking-tight">
              Ready to Transform Your Home?
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Browse our room-by-room guides and find the right solution for your home.
            </p>
            <Link
              href="/guides/kitchen"
              className="inline-flex items-center justify-center px-10 py-4 rounded-lg bg-white text-[#C8956C] font-medium hover:bg-[#E8D5C4] transition-colors text-lg"
            >
              Start with the Kitchen Guide →
            </Link>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
