"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const values = [
  {
    icon: "❤️",
    title: "People First",
    desc: "Every decision starts with understanding the real needs of our users. We listen, we care, we improve.",
  },
  {
    icon: "🏆",
    title: "Quality Excellence",
    desc: "Medical-grade standards in every product. We never compromise on safety or reliability.",
  },
  {
    icon: "🤝",
    title: "Warm Care",
    desc: "Design that delivers warmth and respect. Every detail reflects our genuine care for your wellbeing.",
  },
  {
    icon: "🌍",
    title: "Accessible to All",
    desc: "High quality shouldn't come with a high price. We believe mobility solutions should be affordable.",
  },
];

const milestones = [
  {
    year: "2019",
    title: "GoldSeason Founded",
    desc: "Started with a simple belief: mobility shouldn't limit life's possibilities.",
  },
  {
    year: "2020",
    title: "First Product Launch",
    desc: "Explorer Pro launched, weighing just 10kg with 25-mile range.",
  },
  {
    year: "2021",
    title: "10,000 Customers",
    desc: "Reached 10,000 happy customers and expanded to European markets.",
  },
  {
    year: "2022",
    title: "Industry Innovation Award",
    desc: "Recognized for breakthrough lightweight design and user-friendly controls.",
  },
  {
    year: "2023",
    title: "50,000 Customers",
    desc: "Milestone of 50,000 customers worldwide and counting.",
  },
  {
    year: "2024",
    title: "New Product Lines",
    desc: "Launched City Glide and Traveler series, expanding our mobility solutions.",
  },
];

const team = [
  {
    name: "Dr. Sarah Chen",
    role: "Founder & CEO",
    bio: "Former rehabilitation specialist with 20 years experience in mobility solutions. Driven by personal family experience.",
    avatar: "SC",
  },
  {
    name: "Michael Zhang",
    role: "Chief Technology Officer",
    bio: "Former aerospace engineer bringing precision engineering and innovative design to every product.",
    avatar: "MZ",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Customer Care",
    bio: "Dedicated to ensuring every customer receives exceptional support from purchase to ongoing use.",
    avatar: "ER",
  },
  {
    name: "Dr. James Liu",
    role: "Medical Advisory Board",
    bio: "Geriatric specialist advising on user comfort, safety standards, and accessibility requirements.",
    avatar: "JL",
  },
];

const certifications = [
  { name: "FDA Registered", icon: "🏥" },
  { name: "ISO 13485", icon: "✓" },
  { name: "CE Marked", icon: "🇪🇺" },
  { name: "FAA Compliant", icon: "✈️" },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2AAAA0] via-[#2AAAA0] to-[#259990] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F5A623]/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-white/20 text-white border-white/30 mb-6">
                About GoldSeason
              </Badge>
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Freedom in Every Step
            </motion.h1>

            <motion.p
              className="text-lg lg:text-xl text-white/90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              We believe mobility shouldn't limit life's possibilities. GoldSeason was founded
              to give people the freedom to live life on their own terms — with dignity,
              independence, and joy.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Story Section */}
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
                Our Story
              </h2>
              <div className="space-y-4 text-[#6B6B6B]">
                <p>
                  GoldSeason was born from a simple observation: too many people were
                  letting mobility issues limit their lives. Traditional wheelchairs were
                  heavy, complicated, and often embarrassing to use.
                </p>
                <p>
                  Our founder, Dr. Sarah Chen, a rehabilitation specialist with decades
                  of experience, saw firsthand how mobility challenges affected her patients'
                  quality of life. She believed technology should help people live more
                  freely, not less.
                </p>
                <p>
                  In 2019, she assembled a team of engineers, designers, and healthcare
                  professionals with one mission: create mobility solutions that are
                  lightweight, beautiful, and genuinely easy to use.
                </p>
                <p>
                  Today, GoldSeason serves over 50,000 customers worldwide, from active
                  seniors exploring their neighborhoods to travelers seeing the world.
                  Every product we create carries the same belief: your mobility should
                  enhance your life, not define it.
                </p>
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
                    { value: "50K+", label: "Happy Customers" },
                    { value: "30+", label: "Countries Served" },
                    { value: "4.9★", label: "Average Rating" },
                    { value: "2019", label: "Year Founded" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="text-center p-4 bg-white rounded-2xl shadow-sm"
                    >
                      <p className="text-3xl font-bold text-[#F5A623]">{stat.value}</p>
                      <p className="text-sm text-[#6B6B6B]">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
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
              What We Stand For
            </h2>
            <p className="text-[#6B6B6B] max-w-2xl mx-auto">
              Our values aren't just words on a wall — they guide every decision we make,
              from product design to customer service.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white border-0 h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <motion.span
                      className="text-5xl mb-4 block"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    >
                      {value.icon}
                    </motion.span>
                    <h3 className="text-xl font-bold text-[#2D2D2D] mb-2">
                      {value.title}
                    </h3>
                    <p className="text-[#6B6B6B] text-sm">{value.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
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
              Our Journey
            </h2>
            <p className="text-[#6B6B6B] max-w-2xl mx-auto">
              From a small startup to a global brand, every milestone has been driven
              by our commitment to improving lives.
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#E8E8E8] transform -translate-x-1/2" />

            <div className="space-y-12">
              {milestones.map((milestone, i) => (
                <motion.div
                  key={i}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${
                    i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                    <div className={`bg-[#FAF8F5] rounded-2xl p-6 ${i % 2 === 0 ? "lg:ml-auto lg:max-w-md" : "lg:mr-auto lg:max-w-md"}`}>
                      <span className="text-[#F5A623] font-bold text-lg">{milestone.year}</span>
                      <h3 className="text-xl font-bold text-[#2D2D2D] mt-1 mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-[#6B6B6B]">{milestone.desc}</p>
                    </div>
                  </div>

                  {/* Timeline dot */}
                  <div className="w-4 h-4 bg-[#F5A623] rounded-full flex-shrink-0 z-10" />

                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
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
              Meet Our Team
            </h2>
            <p className="text-[#6B6B6B] max-w-2xl mx-auto">
              Passionate experts dedicated to transforming mobility for seniors worldwide.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white border-0 h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F5A623] to-[#2AAAA0] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                      {member.avatar}
                    </div>
                    <h3 className="text-lg font-bold text-[#2D2D2D]">{member.name}</h3>
                    <p className="text-[#2AAAA0] text-sm font-medium mb-3">{member.role}</p>
                    <p className="text-[#6B6B6B] text-sm">{member.bio}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#6B6B6B] mb-6">
              Certified & Compliant
            </h3>
            <div className="flex flex-wrap justify-center gap-8">
              {certifications.map((cert, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 px-6 py-3 bg-[#FAF8F5] rounded-full"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <span className="text-2xl">{cert.icon}</span>
                  <span className="font-medium text-[#2D2D2D]">{cert.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
              Ready to Experience GoldSeason?
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Join over 50,000 happy customers who have discovered the freedom of
              lightweight, reliable mobility solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8"
                asChild
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
