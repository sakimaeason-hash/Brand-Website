"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    color: "#F5A623",
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
    color: "#2AAAA0",
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
    color: "#4A9B6F",
    sections: 9,
  },
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#2AAAA0] via-[#2AAAA0] to-[#259990] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F5A623]/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-white/20 text-white border-white/30 mb-6">
              GoldSeason Home Guides
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Room-by-Room
              <span className="text-[#F5A623]"> Accessibility Guides</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto">
              Practical, expert-reviewed guides to help wheelchair users live
              safely and independently in every room of their home.
            </p>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {guides.map((guide) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`}>
                <Card className="h-full overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                  {/* Top color bar */}
                  <div
                    className="h-2"
                    style={{ backgroundColor: guide.color }}
                  />
                  <CardContent className="p-8">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: guide.color + "20" }}
                    >
                      {guide.icon}
                    </div>
                    <h2 className="text-xl font-bold text-[#2D2D2D] mb-1">
                      {guide.title}
                    </h2>
                    <p className="text-sm text-[#6B6B6B] mb-4">
                      {guide.subtitle}
                    </p>
                    <p className="text-sm text-[#6B6B6B] mb-6 leading-relaxed">
                      {guide.description}
                    </p>

                    {/* Meta */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="text-center">
                        <p className="text-xs text-[#6B6B6B] uppercase tracking-wide">
                          Difficulty
                        </p>
                        <p
                          className="font-semibold text-sm"
                          style={{ color: guide.color }}
                        >
                          {guide.difficulty}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-[#6B6B6B] uppercase tracking-wide">
                          Budget
                        </p>
                        <p className="font-semibold text-sm text-[#2D2D2D]">
                          {guide.budget}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-[#6B6B6B] uppercase tracking-wide">
                          Sections
                        </p>
                        <p className="font-semibold text-sm text-[#2D2D2D]">
                          {guide.sections}
                        </p>
                      </div>
                    </div>

                    <Button
                      className="w-full group-hover:shadow-lg transition-all"
                      style={{ backgroundColor: guide.color }}
                    >
                      Read Guide →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why These Guides */}
      <section className="py-16 bg-white border-t border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2">
              Our Approach
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-4">
              Built for Real Life
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
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
            ].map((item, i) => (
              <Card key={i} className="text-center border-none shadow-none bg-transparent">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-bold text-[#2D2D2D] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#6B6B6B] leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#F5A623] to-[#E09520]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#2D2D2D] mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-[#2D2D2D]/80 mb-8">
            Browse our room-by-room guides and find the right solution for your
            home.
          </p>
          <Link href="/guides/kitchen">
            <Button
              size="lg"
              className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a]"
            >
              Start with the Kitchen Guide →
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
