"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const stories = [
  {
    id: 1,
    name: "Hadji Reyes",
    age: 0,
    location: "Amazon",
    image: "/stories/Hadji Reyes.jpg",
    quote: "It took only 3 days since I placed the order and it arrived in perfect conditions, the speed is reasonable enough to pass safely through small doors and slim passage way, I suggest new user like me should start from the lowest speed until you get use with it for proper handling. The weight is so light even I can load and unload it in my car trunk even I'm on non weight bearing restrictions with crutches, you only need to do it carefully and safely if you have strong other leg otherwise others can easily carry and do it for you.",
    product: "GoldSeason Travel Air W 03C",
    story: "A new user sharing his experience with fast delivery, ease of use, and the lightweight design that makes it easy to transport.",
    tags: ["Travel", "New User"],
  },
  {
    id: 2,
    name: "Stephanie Freeman",
    age: 0,
    location: "Amazon",
    image: "Stephanie",
    quote: "I just got my new wheelchair it was fairly easy to put it together I love that when it's backing up it warns people around you that the wheelchair is about to back up I love the light on it it's very spacious and roomy and it's comfortable so definitely recommend this wheelchair this wheelchair is also after a couple times easy to operate and the battery life I'm not sure about yet being I just got the wheelchair",
    product: "GoldSeason Spacious Pro",
    story: "Stephanie shares her positive experience with easy assembly, safety features, comfort, and ease of use.",
    tags: ["Comfort", "New User"],
  },
  {
    id: 3,
    name: "Stacy Olney",
    age: 0,
    location: "Amazon",
    image: "Stacy",
    quote: "I am a very big girl and was very glad that I fit into this chair comfortably. It's a slightly tight, but it is definitely workable. I had to take the feet off because they were very uncomfortable and stuck out about 2 inches past the chair, so I bumped into everything. The chair goes very fast if you wanted to and I keep it on the slow cycle. The brakes are a little difficult to reach as they're in the back and you have to lean over in order to lock it. Otherwise, for the prices that I paid it's a very good chair. I would recommend it's all the big girls out there.",
    product: "GoldSeason Spacious Pro",
    story: "Stacy shares her experience as a plus-size user finding the chair comfortable and practical for her needs.",
    tags: ["Comfort", "Support"],
  },
  {
    id: 4,
    name: "Lisa Sullivan",
    age: 0,
    location: "Amazon",
    image: "Lisa",
    quote: "My last chair's seat was so narrow it was painful. This 22-inch seat is PERFECT. It's not just wide, it's supportive. I feel completely secure and relaxed, not like I'm perching on the edge. The extra space means I can shift positions easily on longer outings. It's the #1 reason I'd recommend this chair to anyone.",
    product: "GoldSeason Spacious Pro",
    story: "Lisa praises the 22-inch wide seat for being both spacious and supportive, allowing her to feel secure and comfortable during longer outings.",
    tags: ["Comfort", "Support"],
  },
  {
    id: 5,
    name: "Eddy Simon",
    age: 0,
    location: "Amazon",
    image: "/stories/Eddy Simon.jpg",
    quote: "This motorized wheelchair feels sturdy and well-built. The large tires handle uneven surfaces and light outdoor terrain better than I expected, making it suitable for short trips outside as well as indoor use. The 330 lb capacity gives a sense of stability, and the chair remains steady during operation. Folding it for travel is manageable, and it fits into the trunk with some effort. The battery life is decent for regular use, and the overall performance has been consistent. A dependable option for both home and outdoor use.",
    product: "GoldSeason Basic 13L",
    story: "Eddy highlights the chair's sturdy build, outdoor capability, 330 lb capacity, and reliable performance for both indoor and outdoor use.",
    tags: ["Travel", "Support"],
  },
  {
    id: 6,
    name: "Kimberly Bryant",
    age: 0,
    location: "Amazon",
    image: "/stories/Kimberly Bryant.mp4",
    quote: "Good quality. Sturdy and durable. Easy to get in and put of our vehicle. The joystick is very sensitive to the touch. It takes a lot to master the steering. My Mom needs lots of practice to get the hang of it. We like it.",
    product: "GoldSeason Travel Air W 03D",
    story: "Kimberly shares her family's experience with the chair's quality, durability, and ease of transport, noting the joystick requires some practice to master.",
    tags: ["Travel", "New User"],
  },
  {
    id: 7,
    name: "Michele Guess",
    age: 0,
    location: "Amazon",
    image: "/stories/Michele Guess.jpg",
    quote: "Wheelchair is light weight. Only thing we had to attach was the remote and it just slid on and tighten. We were able to sample a ride as the battery came with a slight charge. Easy to maneuver and handle. Chair comes with a cushion. But a very large person would not be comfortable or fit the seat. My husband loves it!",
    product: "GoldSeason Travel Air W 03C",
    story: "Michele appreciates the lightweight design, easy assembly, and maneuverability, while noting the seat may be too snug for larger users.",
    tags: ["Travel", "Comfort"],
  },
  {
    id: 8,
    name: "SmashOhh",
    age: 0,
    location: "Amazon",
    image: "/stories/SmashOhh.jpg",
    quote: "It's a good chair so I understand why it's heavy. Also please read manual 2 or 3 times. Practice before you take it out on outing. My wheels were flat when I got it. So you might need to put air.",
    product: "GoldSeason Power Max 16L",
    story: "SmashOhh recommends reading the manual carefully and practicing before first outing, noting the chair's weight is justified by its quality.",
    tags: ["Support", "New User"],
  },
];

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "4.9", label: "Average Rating" },
  { value: "98%", label: "Would Recommend" },
  { value: "12K+", label: "Miles Traveled" },
];

const videoTestimonials = [
  {
    youtubeId: "p1nck7gXsjM",
    title: "Spacious Pro Real User Review",
    product: "GoldSeason Spacious Pro",
  },
  {
    youtubeId: "R_ZrQ9T5kXw",
    title: "Travel Air W 03C User Review",
    product: "GoldSeason Travel Air W 03C",
  },
];

const filters = ["All", "Travel", "Family", "Independence", "Support"];

const featuredStory = {
  name: "Eleanor Watson",
  age: 75,
  location: "Seattle, WA",
  product: "Goldseason Power Max01 A",
  quote: "After my stroke, I thought I'd never be able to visit my favorite bookstore or meet friends for coffee. GoldSeason changed everything.",
  avatar: "E",
  image: "Eleanor",
};

export default function StoriesPage() {
  const [activeFilter, setActiveFilter] = useState("All");

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-white/20 text-white border-white/30 mb-4 lg:mb-6">
              Customer Stories
            </Badge>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 lg:mb-6">
              Real Stories,{" "}
              <span className="text-[#F5A623]">Real Freedom</span>
            </h1>
            <p className="text-base lg:text-lg text-white/90 max-w-2xl mx-auto">
              Meet the incredible people who have reclaimed their independence
              and continue to live life on their own terms with GoldSeason.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 lg:py-10 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="text-center p-3 lg:p-4 bg-white rounded-xl lg:rounded-2xl shadow-sm"
              >
                <span className="text-2xl lg:text-3xl mb-1 lg:mb-2 block">{["U", "S", "L", "T"][i]}</span>
                <p className="text-xl lg:text-2xl lg:text-3xl font-bold text-[#F5A623]">{stat.value}</p>
                <p className="text-xs lg:text-sm text-[#6B6B6B]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Story */}
      <section className="py-10 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#F5A623]/10 to-[#2AAAA0]/10 rounded-2xl lg:rounded-3xl p-4 lg:p-8 xl:p-12 relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-48 lg:w-64 h-48 lg:h-64 bg-[#F5A623]/10 rounded-full blur-3xl" />

            <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 xl:gap-12 items-center relative">
              <div className="order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <div className="aspect-[3/4] bg-gradient-to-br from-[#F5A623]/20 to-[#E8DDD4] rounded-xl lg:rounded-2xl flex items-center justify-center">
                    <span className="text-[#6B6B6B] text-sm lg:text-base">Eleanor 1</span>
                  </div>
                  <div className="aspect-[3/4] bg-gradient-to-br from-[#2AAAA0]/20 to-[#E8E8E8] rounded-xl lg:rounded-2xl flex items-center justify-center mt-4 lg:mt-8">
                    <span className="text-[#6B6B6B] text-sm lg:text-base">Eleanor 2</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <Badge className="bg-[#F5A623] text-[#2D2D2D] mb-3 lg:mb-4 text-xs">
                  Featured Story
                </Badge>
                <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-[#2D2D2D] mb-4 lg:mb-6">
                  "I Regained My Independence at 75"
                </h2>
                <blockquote className="text-base lg:text-lg text-[#6B6B6B] italic mb-4 lg:mb-6 leading-relaxed">
                  "{featuredStory.quote}"
                </blockquote>
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E09520] flex items-center justify-center text-white text-lg lg:text-xl font-bold">
                    {featuredStory.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2D2D2D] text-sm lg:text-base">
                      {featuredStory.name}
                    </p>
                    <p className="text-xs lg:text-sm text-[#6B6B6B]">
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
      <section className="py-10 lg:py-16 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 lg:gap-6 mb-8 lg:mb-12">
            <div>
              <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2 text-xs lg:text-sm">
                Community
              </p>
              <h2 className="text-xl lg:text-3xl font-bold text-[#2D2D2D]">
                More Inspiring Stories
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium transition-all ${
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {filteredStories.map((story) => (
              <Card
                key={story.id}
                className="overflow-hidden group hover:shadow-xl transition-all bg-white"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-[#E8DDD4] to-[#E8E8E8] relative overflow-hidden">
                  {story.image.endsWith('.mp4') ? (
                    <video
                      src={story.image}
                      className="w-full h-full object-cover"
                      muted
                      autoPlay
                      loop
                    />
                  ) : story.image.startsWith('/stories') ? (
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[#6B6B6B] text-base">{story.image}</span>
                    </div>
                  )}
                  {/* Tags */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {story.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-white/90 text-[#2D2D2D] text-xs px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <CardContent className="p-4 lg:p-6">
                  <svg
                    className="w-6 h-6 lg:w-8 lg:h-8 text-[#F5A623] mb-2 lg:mb-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-[#2D2D2D] leading-relaxed mb-3 lg:mb-4 text-sm">
                    "{story.quote}"
                  </p>
                  <div className="border-t border-[#E8E8E8] pt-3 lg:pt-4">
                    <p className="font-semibold text-[#2D2D2D] text-sm lg:text-base">{story.name}</p>
                    <p className="text-xs text-[#6B6B6B]">
                      {story.location === "Amazon" ? story.product : `${story.location}${story.age > 0 ? `, ${story.age}` : ""} • ${story.product}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <section className="py-10 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-12">
            <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2 text-xs lg:text-sm">
              Watch & Listen
            </p>
            <h2 className="text-xl lg:text-3xl font-bold text-[#2D2D2D] mb-3 lg:mb-4">
              Video Testimonials
            </h2>
            <p className="text-[#6B6B6B] max-w-xl mx-auto text-sm lg:text-base">
              Hear from our customers as they share their experiences in their
              own words.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto">
            {videoTestimonials.map((video, i) => (
              <div
                key={i}
                className="aspect-video rounded-2xl overflow-hidden relative group cursor-pointer"
              >
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Share Story CTA */}
      <section className="py-10 lg:py-16 bg-gradient-to-r from-[#2AAAA0] to-[#259990] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
            <svg
              className="w-6 h-6 lg:w-8 lg:h-8"
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
          <h2 className="text-xl lg:text-3xl font-bold mb-3 lg:mb-4">
            Share Your GoldSeason Story
          </h2>
          <p className="text-base lg:text-lg text-white/90 mb-6 lg:mb-8 max-w-2xl mx-auto">
            We'd love to hear how GoldSeason has made a difference in your life.
            Your story could inspire others to reclaim their freedom.
          </p>
          <a
            href="mailto:help@seniorchairservice.com"
            className="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2AAAA0] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 lg:h-12 px-6 lg:px-8 text-sm lg:text-base rounded-md bg-white text-[#2AAAA0] hover:bg-white/90"
          >
            Submit Your Story
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 lg:py-16 bg-[#F5A623]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl lg:text-3xl font-bold text-[#2D2D2D] mb-4 lg:mb-6">
            Ready to Start Your Story?
          </h2>
          <p className="text-base lg:text-lg text-[#2D2D2D]/80 mb-6 lg:mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have rediscovered their
            freedom with GoldSeason.
          </p>
          <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
            <Button
              size="lg"
              className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a] h-10 lg:h-12 px-6 lg:px-8 text-sm lg:text-base"
              asChild
            >
              <Link href="/products">Explore Products</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white h-10 lg:h-12 px-6 lg:px-8 text-sm lg:text-base"
            >
              Book a Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}