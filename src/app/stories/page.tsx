"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stories = [
  {
    id: 1,
    name: "Mary Johnson",
    age: 72,
    location: "Florida",
    image: "Mary",
    quote: "With GoldSeason, I can go to the park with my grandchildren again. It's so light I can fold it and put it in the trunk by myself.",
    product: "GoldSeason Lite",
    story: "Mary had stopped attending family outings because her old wheelchair was too heavy. Now she's back to making memories every weekend.",
    tags: ["Family", "Independence"],
    featured: true,
  },
  {
    id: 2,
    name: "Robert Smith",
    age: 68,
    location: "California",
    image: "Robert",
    quote: "This is the most comfortable wheelchair I've ever used. At 33 lbs, I can take it on flights and travel the world.",
    product: "GoldSeason Pro",
    story: "Robert has visited 12 countries with his GoldSeason Pro, exploring everything from European cities to Asian temples.",
    tags: ["Travel", "Adventure"],
  },
  {
    id: 3,
    name: "Dorothy Williams",
    age: 75,
    location: "Texas",
    image: "Dorothy",
    quote: "The customer service was incredibly patient and helped me find the perfect model. Now I can go out every day with ease.",
    product: "GoldSeason Elite",
    story: "Dorothy was hesitant about getting a power wheelchair, worried it would be too complicated. Our team worked with her to find the perfect fit.",
    tags: ["Support", "Comfort"],
  },
  {
    id: 4,
    name: "James & Patricia Chen",
    age: 70,
    location: "New York",
    image: "Chens",
    quote: "We bought two GoldSeason chairs so we can enjoy our retirement travels together. Best investment we've ever made.",
    product: "GoldSeason Pro",
    story: "The Chens have been married for 45 years and weren't about to let mobility issues slow them down. They now take regular road trips.",
    tags: ["Couple", "Travel"],
  },
  {
    id: 5,
    name: "Helen Rodriguez",
    age: 79,
    location: "Arizona",
    image: "Helen",
    quote: "The quick-fold feature changed my life. I can now visit my friends without worrying about getting the chair in and out of my car.",
    product: "GoldSeason Lite",
    story: "Helen lives in a retirement community and loves visiting friends. The 3-second fold means she can manage independently.",
    tags: ["Social Life", "Independence"],
  },
  {
    id: 6,
    name: "George Thompson",
    age: 82,
    location: "Colorado",
    image: "George",
    quote: "After my hip surgery, I thought I'd never garden again. GoldSeason gave me back my favorite hobby.",
    product: "GoldSeason Elite",
    story: "George is a passionate gardener who feared he'd lost his ability to tend his roses. Now he navigates his garden paths with confidence.",
    tags: ["Hobby", "Recovery"],
  },
];

const stats = [
  { value: "50K+", label: "Happy Customers", icon: "👥" },
  { value: "4.9", label: "Average Rating", icon: "⭐" },
  { value: "98%", label: "Would Recommend", icon: "❤️" },
  { value: "12K+", label: "Miles Traveled", icon: "✈️" },
];

const filters = ["All", "Travel", "Family", "Independence", "Support"];

const featuredStory = {
  name: "Eleanor Watson",
  age: 75,
  location: "Seattle, WA",
  product: "GoldSeason Pro",
  quote: "After my stroke, I thought I'd never be able to visit my favorite bookstore or meet friends for coffee. GoldSeason changed everything.",
  avatar: "E",
  image: "Eleanor",
};

export default function StoriesPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);

  const filteredStories =
    activeFilter === "All"
      ? stories
      : stories.filter((s) => s.tags.includes(activeFilter));

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2AAAA0] via-[#2AAAA0] to-[#259990] text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F5A623]/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-white/20 text-white border-white/30 mb-6">
              Customer Stories
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Real Stories,{" "}
              <span className="text-[#F5A623]">Real Freedom</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto">
              Meet the incredible people who have reclaimed their independence
              and continue to live life on their own terms with GoldSeason.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="text-center p-4 bg-white rounded-2xl shadow-sm"
              >
                <span className="text-3xl mb-2 block">{stat.icon}</span>
                <p className="text-3xl font-bold text-[#F5A623]">{stat.value}</p>
                <p className="text-sm text-[#6B6B6B]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Story */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#F5A623]/10 to-[#2AAAA0]/10 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5A623]/10 rounded-full blur-3xl" />

            <div className="grid lg:grid-cols-2 gap-12 items-center relative">
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-[3/4] bg-gradient-to-br from-[#F5A623]/20 to-[#E8DDD4] rounded-2xl flex items-center justify-center">
                    <span className="text-[#6B6B6B]">Eleanor 1</span>
                  </div>
                  <div className="aspect-[3/4] bg-gradient-to-br from-[#2AAAA0]/20 to-[#E8E8E8] rounded-2xl flex items-center justify-center mt-8">
                    <span className="text-[#6B6B6B]">Eleanor 2</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <Badge className="bg-[#F5A623] text-[#2D2D2D] mb-4">
                  Featured Story
                </Badge>
                <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-6">
                  "I Regained My Independence at 75"
                </h2>
                <blockquote className="text-xl text-[#6B6B6B] italic mb-6 leading-relaxed">
                  "{featuredStory.quote}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E09520] flex items-center justify-center text-white text-xl font-bold">
                    {featuredStory.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2D2D2D]">
                      {featuredStory.name}
                    </p>
                    <p className="text-sm text-[#6B6B6B]">
                      {featuredStory.location} • {featuredStory.product}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-16 lg:py-24 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2">
                Community
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D]">
                More Inspiring Stories
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFilter === filter
                      ? "bg-[#F5A623] text-[#2D2D2D]"
                      : "bg-white text-[#6B6B6B] hover:bg-[#F5A623]/10"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Stories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <Card
                key={story.id}
                className="overflow-hidden group hover:shadow-xl transition-all bg-white"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-[#E8DDD4] to-[#E8E8E8] relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[#6B6B6B] text-lg">{story.image}</span>
                  </div>
                  {/* Tags */}
                  <div className="absolute top-3 left-3 flex gap-1">
                    {story.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-white/90 text-[#2D2D2D] text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <CardContent className="p-6">
                  <svg
                    className="w-8 h-8 text-[#F5A623] mb-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-[#2D2D2D] leading-relaxed mb-4 text-sm">
                    "{story.quote}"
                  </p>
                  <div className="border-t border-[#E8E8E8] pt-4">
                    <p className="font-semibold text-[#2D2D2D]">{story.name}</p>
                    <p className="text-xs text-[#6B6B6B]">
                      {story.location}, {story.age} • {story.product}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2">
              Watch & Listen
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-4">
              Video Testimonials
            </h2>
            <p className="text-[#6B6B6B] max-w-xl mx-auto">
              Hear from our customers as they share their experiences in their
              own words.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="aspect-video bg-gradient-to-br from-[#2D2D2D] to-[#3D3D3D] rounded-2xl flex items-center justify-center cursor-pointer group relative overflow-hidden"
                onMouseEnter={() => setHoveredVideo(i)}
                onMouseLeave={() => setHoveredVideo(null)}
              >
                {/* Video placeholder gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                <div className="text-center text-white relative z-10">
                  <div
                    className={`w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 transition-all ${
                      hoveredVideo === i ? "scale-110 bg-[#F5A623]" : ""
                    }`}
                  >
                    <svg
                      className="w-6 h-6 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">Watch Video {i + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Share Story CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-[#2AAAA0] to-[#259990] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Share Your GoldSeason Story
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            We'd love to hear how GoldSeason has made a difference in your life.
            Your story could inspire others to reclaim their freedom.
          </p>
          <Button
            size="lg"
            className="bg-white text-[#2AAAA0] hover:bg-white/90"
          >
            Submit Your Story
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-[#F5A623]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-6">
            Ready to Start Your Story?
          </h2>
          <p className="text-lg text-[#2D2D2D]/80 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have rediscovered their
            freedom with GoldSeason.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a]"
              asChild
            >
              <Link href="/products">Explore Products</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white"
            >
              Book a Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
