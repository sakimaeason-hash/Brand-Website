"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RevealOnScroll, HoverScale } from "@/components/animations";

export type Story = {
  id: number;
  name: string;
  location: string;
  quote: string;
  product: string;
  tags: string[];
  image?: string;
};

export const STORIES: readonly Story[] = [
  {
    id: 1,
    name: "Hadji Reyes",
    location: "Amazon",
    quote: "It took only 3 days since I placed the order and it arrived in perfect conditions, the speed is reasonable enough to pass safely through small doors and slim passage way, I suggest new user like me should start from the lowest speed until you get use with it for proper handling. The weight is so light even I can load and unload it in my car trunk even I'm on non weight bearing restrictions with crutches, you only need to do it carefully and safely if you have strong other leg otherwise others can easily carry and do it for you.",
    product: "GoldSeason Travel Air W 03C",
    tags: ["Travel", "New User"],
    image: "/stories/Hadji Reyes.jpg",
  },
  {
    id: 2,
    name: "Stephanie Freeman",
    location: "Amazon",
    quote: "I just got my new wheelchair it was fairly easy to put it together I love that when it's backing up it warns people around you that the wheelchair is about to back up I love the light on it it's very spacious and roomy and it's comfortable so definitely recommend this wheelchair this wheelchair is also after a couple times easy to operate and the battery life I'm not sure about yet being I just got the wheelchair",
    product: "GoldSeason Spacious Pro",
    tags: ["Comfort", "New User"],
  },
  {
    id: 3,
    name: "Stacy Olney",
    location: "Amazon",
    quote: "I am a very big girl and was very glad that I fit into this chair comfortably. It's a slightly tight, but it is definitely workable. I had to take the feet off because they were very uncomfortable and stuck out about 2 inches past the chair, so I bumped into everything. The chair goes very fast if you wanted to and I keep it on the slow cycle. The brakes are a little difficult to reach as they're in the back and you have to lean over in order to lock it. Otherwise, for the prices that I paid it's a very good chair. I would recommend it's all the big girls out there.",
    product: "GoldSeason Spacious Pro",
    tags: ["Comfort", "Support"],
  },
  {
    id: 4,
    name: "Lisa Sullivan",
    location: "Amazon",
    quote: "My last chair's seat was so narrow it was painful. This 22-inch seat is PERFECT. It's not just wide, it's supportive. I feel completely secure and relaxed, not like I'm perching on the edge. The extra space means I can shift positions easily on longer outings. It's the #1 reason I'd recommend this chair to anyone.",
    product: "GoldSeason Spacious Pro",
    tags: ["Comfort", "Support"],
  },
  {
    id: 5,
    name: "Eddy Simon",
    location: "Amazon",
    quote: "This motorized wheelchair feels sturdy and well-built. The large tires handle uneven surfaces and light outdoor terrain better than I expected, making it suitable for short trips outside as well as indoor use. The 330 lb capacity gives a sense of stability, and the chair remains steady during operation. Folding it for travel is manageable, and it fits into the trunk with some effort. The battery life is decent for regular use, and the overall performance has been consistent. A dependable option for both home and outdoor use.",
    product: "GoldSeason Basic 13L",
    tags: ["Travel", "Support"],
    image: "/stories/Eddy Simon.jpg",
  },
  {
    id: 6,
    name: "Kimberly Bryant",
    location: "Amazon",
    quote: "Good quality. Sturdy and durable. Easy to get in and put of our vehicle. The joystick is very sensitive to the touch. It takes a lot to master the steering. My Mom needs lots of practice to get the hang of it. We like it.",
    product: "GoldSeason Travel Air W 03D",
    tags: ["Travel", "New User"],
  },
  {
    id: 7,
    name: "Michele Guess",
    location: "Amazon",
    quote: "Wheelchair is light weight. Only thing we had to attach was the remote and it just slid on and tighten. We were able to sample a ride as the battery came with a slight charge. Easy to maneuver and handle. Chair comes with a cushion. But a very large person would not be comfortable or fit the seat. My husband loves it!",
    product: "GoldSeason Travel Air W 03C",
    tags: ["Travel", "Comfort"],
    image: "/stories/Michele Guess.jpg",
  },
  {
    id: 8,
    name: "SmashOhh",
    location: "Amazon",
    quote: "It's a good chair so I understand why it's heavy. Also please read manual 2 or 3 times. Practice before you take it out on outing. My wheels were flat when I got it. So you might need to put air.",
    product: "GoldSeason Power Max 16L",
    tags: ["Support", "New User"],
    image: "/stories/SmashOhh.jpg",
  },
];

const stats = [
  { value: "50K+", label: "Happy Customers" },
  { value: "4.9", label: "Average Rating" },
  { value: "98%", label: "Would Recommend" },
  { value: "12K+", label: "Miles Traveled" },
];

const featuredStory = {
  name: "Eleanor Watson",
  age: 75,
  location: "Seattle, WA",
  product: "Goldseason Power Max01 A",
  quote: "After my stroke, I thought I'd never be able to visit my favorite bookstore or meet friends for coffee. GoldSeason changed everything.",
  avatar: "E",
};

const filters = ["All", "Travel", "Family", "Independence", "Support"];

export function FeaturedStory() {
  return (
    <div className="max-w-3xl mx-auto text-center relative">
      <span className="editorial-label text-[#C8956C]">Featured Story</span>
      <h2 className="editorial-tertiary text-deep-espresso mt-3 mb-6">
        "I Regained My Independence at 75"
      </h2>
      <blockquote className="text-[1.25rem] text-warm italic mb-8 leading-relaxed border-l-4 border-[#C8956C] pl-6 text-left">
        "{featuredStory.quote}"
      </blockquote>
      <div className="inline-flex items-center gap-4 text-left">
        <div
          className="w-14 h-14 rounded-full bg-gradient-to-br from-[#C8956C] to-[#8B7355] flex items-center justify-center text-white text-xl font-bold"
          aria-hidden="true"
        >
          {featuredStory.avatar}
        </div>
        <div>
          <p className="font-semibold text-deep-espresso text-lg">
            {featuredStory.name}
          </p>
          <p className="text-sm text-muted">
            {featuredStory.location} · {featuredStory.product}
          </p>
        </div>
      </div>
    </div>
  );
}

export function StoryCard({ story }: { story: Story }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = imageFailed ? undefined : story.image;

  return (
    <div className="editorial-card p-6 h-full flex flex-col">
      {imageSrc ? (
        <div className="aspect-[4/3] mb-6 overflow-hidden rounded-xl">
          <img
            src={imageSrc}
            alt={`${story.name} using a GoldSeason wheelchair`}
            className="w-full h-full object-cover"
            onError={() => setImageFailed(true)}
          />
        </div>
      ) : null}

      {/* Quote */}
      <blockquote className="text-warm leading-relaxed mb-6 flex-grow">
        "{story.quote.length > 200
          ? story.quote.substring(0, 200) + "..."
          : story.quote}"
      </blockquote>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {story.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium text-[#C8956C] bg-[#C8956C]/10 px-3 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-stone">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C8956C] to-[#8B7355] flex items-center justify-center text-white text-sm font-bold"
            aria-hidden="true"
          >
            {story.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-medium text-deep-espresso text-sm">{story.name}</p>
          <p className="text-xs text-muted">{story.product}</p>
        </div>
      </div>
    </div>
  );
}

export default function StoriesPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredStories =
    activeFilter === "All"
      ? STORIES
      : STORIES.filter((s) => s.tags.includes(activeFilter));

  return (
    <div className="bg-cream">
      {/* Hero Section - Editorial Style */}
      <section className="relative bg-gradient-to-br from-[#C8956C] via-[#9CAF88] to-[#8BA4B4] text-white overflow-hidden">
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
              Customer Stories
            </motion.span>
            <motion.h1
              className="text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] font-bold text-white mt-4 mb-6 tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Real Stories,{" "}
              <span className="text-[#E8D5C4]">Real Freedom</span>
            </motion.h1>
            <motion.p
              className="text-[clamp(1.125rem,2vw,1.375rem)] text-white/80 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Meet the incredible people who have reclaimed their independence
              and continue to live life on their own terms with GoldSeason.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Bar - Editorial */}
      <section className="py-12 lg:py-16 bg-white border-b border-stone">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, i) => (
              <RevealOnScroll key={i} delay={i * 0.1}>
                <div className="text-center p-6 bg-gradient-to-br from-[#FAF7F4] to-transparent rounded-2xl">
                  <span className="text-4xl lg:text-5xl mb-3 block">{(["U", "S", "L", "T"] as const)[i]}</span>
                  <p className="text-3xl lg:text-4xl font-bold text-[#C8956C] mb-1">{stat.value}</p>
                  <p className="text-sm text-muted tracking-wide uppercase">{stat.label}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Story - Editorial Magazine Style */}
      <section className="py-16 lg:py-24 section-editorial bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#E8D5C4]/30 to-[#9CAF88]/10 rounded-3xl p-8 lg:p-12 xl:p-16 relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 lg:w-96 h-64 lg:h-96 bg-[#C8956C]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#9CAF88]/10 rounded-full blur-2xl" />

            <FeaturedStory />
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-16 lg:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <span className="editorial-label text-[#C8956C]">Community</span>
              <h2 className="editorial-subheading text-deep-espresso mt-2">
                Every Journey Tells a Story
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <motion.button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFilter === filter
                      ? "bg-[#C8956C] text-white"
                      : "bg-white text-warm hover:bg-[#C8956C]/10"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {filter}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Stories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStories.map((story, index) => (
              <RevealOnScroll key={story.id} delay={index * 0.1}>
                <HoverScale scale={1.02}>
                  <StoryCard story={story} />
                </HoverScale>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials - Editorial Style */}
      <section className="py-16 lg:py-24 section-editorial-sm bg-[#E8D5C4]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="editorial-label text-[#C8956C]">Watch & Learn</span>
            <h2 className="editorial-tertiary text-deep-espresso mt-2">
              See GoldSeason in Action
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { youtubeId: "p1nck7gXsjM", title: "Spacious Pro Real User Review", product: "GoldSeason Spacious Pro" },
              { youtubeId: "R_ZrQ9T5kXw", title: "Travel Air W 03C User Review", product: "GoldSeason Travel Air W 03C" },
            ].map((video, i) => (
              <RevealOnScroll key={i} delay={i * 0.15}>
                <div className="editorial-card overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-[#C8956C]/10 to-[#9CAF88]/10">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-deep-espresso mb-1">{video.title}</h3>
                    <p className="text-sm text-muted">{video.product}</p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-[#3D3330] to-[#5C534E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealOnScroll>
            <span className="editorial-label text-white/70">Join Our Community</span>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-white mt-4 mb-6 tracking-tight">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover the freedom that thousands of customers have already found.
              Your story could be next.
            </p>
            <a
              href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-lg px-10 py-4"
            >
              Explore Products on Amazon
            </a>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
