"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RevealOnScroll, HoverScale } from "@/components/animations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const quickLinks = [
  {
    icon: "📞",
    title: "Call Support",
    value: "+1 888 998 8182",
    subtitle: "Mon-Sun 9AM-6PM EST",
    action: "Call Now",
  },
  {
    icon: "📧",
    title: "Email Support",
    value: "help@seniorchairservice.com",
    subtitle: "Response within 24 hours",
    action: "Send Email",
  },
  {
    icon: "youtube",
    title: "YouTube",
    value: "@GoldSeasonOfficial",
    subtitle: "Watch our videos",
    action: "Subscribe",
    href: "https://www.youtube.com/@GoldSeasonOfficial",
  },
];

const warrantyCoverage = [
  {
    component: "Frame & Structure",
    period: "5 Years",
    details: "Main frame, welds, and structural components",
  },
  {
    component: "Electronics & Motor",
    period: "2 Years",
    details: "Control system, motors, wiring, and sensors",
  },
  {
    component: "Battery Pack",
    period: "1 Year",
    details: "Battery pack and charging system",
  },
  {
    component: "Upholstery & Padding",
    period: "1 Year",
    details: "Seat cushion, backrest, and armrests",
  },
  {
    component: "Wear Items",
    period: "90 Days",
    details: "Tires, bearings, and other consumable parts",
  },
];

const repairOptions = [
  {
    title: "In-Warranty",
    description: "Free repair for covered components",
    turnaround: "5-7 days",
    cost: "FREE",
    highlight: true,
  },
  {
    title: "Out-of-Warranty",
    description: "Expert repair with quote upfront",
    turnaround: "5-7 days",
    cost: "Quoted",
    highlight: false,
  },
  {
    title: "Priority Service",
    description: "Expedited 2-3 day turnaround",
    turnaround: "2-3 days",
    cost: "$99 + parts",
    highlight: false,
  },
];

const serviceCenters = [
  { city: "San Francisco", state: "CA", address: "123 Innovation Drive, Suite 200", type: "Flagship" },
  { city: "Los Angeles", state: "CA", address: "456 Care Boulevard", type: "Service Center" },
  { city: "New York", state: "NY", address: "789 Freedom Lane", type: "Service Center" },
  { city: "Chicago", state: "IL", address: "321 Mobility Ave", type: "Authorized" },
  { city: "Houston", state: "TX", address: "654 Independence St", type: "Authorized" },
  { city: "Miami", state: "FL", address: "987 Sunshine Road", type: "Authorized" },
];

const faqs = [
  {
    question: "Can I bring my wheelchair on an airplane?",
    answer:
      "You need to check the series you purchased. The Travel Air series wheelchairs and mobility scooters can be carried onto airplanes. Of course, you should also consult with your airline about their specific policies.",
  },
  {
    question: "I'm worried about not knowing how to use it for the first time. What should I do?",
    answer:
      "You can practice using the low-speed mode in an open, flat area accompanied by a caregiver. We also provide video tutorial resources for your learning. It is normal to feel uncomfortable during first use, but with regular practice, our product will become your most trusted companion.",
  },
  {
    question: "How long does the battery last on a single charge?",
    answer:
      "Battery range depends on your usage habits, environment, temperature, and other factors, but generally refers to the range we specify. Always fully charge the battery before each use. If you need to purchase a spare battery, please contact us.",
  },
  {
    question: "What should I do if my wheelchair needs repair?",
    answer:
      "If your wheelchair is damaged, malfunctioning, or has any issues, stop using it immediately and contact us right away. We'll help you troubleshoot the problem and determine if any parts need to be replaced. For repairs within the warranty period, we'll ship the necessary replacement parts to you at no cost.",
  },
  {
    question: "How do I choose the right product for me? And can I return it if it's not suitable?",
    answer:
      "Please visit the Support page on our website and browse the section on how to choose the right electric wheelchair for you. If the product you choose is not suitable, we will provide you with a free exchange service.",
  },
];

const processSteps = [
  { step: "01", icon: "📝", title: "Request Service", desc: "Submit online or call us" },
  { step: "02", icon: "🔍", title: "Diagnosis", desc: "We assess and identify parts needed" },
  { step: "03", icon: "📦", title: "Ship Parts", desc: "We send replacement parts to you" },
  { step: "04", icon: "✓", title: "Self-Install", desc: "Easy DIY replacement with video guides" },
];

export default function SupportPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="bg-cream">
      {/* Hero Section - Editorial Style */}
      <section className="relative bg-gradient-to-br from-[#8B7355] via-[#C8956C] to-[#9CAF88] text-white overflow-hidden">
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
              24/7 Support Available
            </motion.span>
            <motion.h1
              className="text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] font-bold text-white mt-4 mb-6 tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              We're Here to Help
            </motion.h1>
            <motion.p
              className="text-[clamp(1.125rem,2vw,1.375rem)] text-white/80 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Get expert support for your GoldSeason product. From warranty
              service to repairs, our team is dedicated to keeping you moving.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Quick Contact Cards - Editorial Grid */}
      <section className="py-12 bg-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="grid md:grid-cols-3 gap-6">
            {quickLinks.map((link, i) => (
              <RevealOnScroll key={i} delay={i * 0.1}>
                <HoverScale scale={1.02}>
                  <div
                    className="editorial-card p-8 text-center"
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 transition-all ${
                        hoveredCard === i
                          ? "bg-[#C8956C] scale-110"
                          : "bg-[#C8956C]/10"
                      }`}
                    >
                      {link.icon === "youtube" ? (
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      ) : link.icon === "instagram" ? (
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                      ) : link.icon === "facebook" ? (
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.166h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      ) : (
                        <span className="text-3xl">{link.icon}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-deep-espresso mb-2">
                      {link.title}
                    </h3>
                    <p className="text-[#C8956C] font-semibold mb-1">
                      {link.value}
                    </p>
                    <p className="text-sm text-muted mb-4">{link.subtitle}</p>
                    {link.href ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-[#C8956C] text-[#C8956C] hover:bg-[#C8956C] hover:text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {link.action}
                      </a>
                    ) : (
                      <button className="w-full px-4 py-2.5 bg-[#C8956C] text-white rounded-lg text-sm font-medium hover:bg-[#8B7355] transition-colors">
                        {link.action}
                      </button>
                    )}
                  </div>
                </HoverScale>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Warranty Coverage - Editorial Timeline */}
      <section className="py-16 lg:py-24 section-editorial bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="editorial-label text-[#C8956C]">Coverage</span>
            <h2 className="editorial-subheading text-deep-espresso mt-2">
              Warranty Protection
            </h2>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            {warrantyCoverage.map((item, i) => (
              <RevealOnScroll key={i} delay={i * 0.1}>
                <div className="editorial-card p-6 text-center h-full">
                  <div className="text-4xl font-bold text-[#C8956C] mb-2">{item.period}</div>
                  <h3 className="font-semibold text-deep-espresso mb-2">{item.component}</h3>
                  <p className="text-sm text-muted">{item.details}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Repair Options */}
      <section className="py-16 lg:py-24 section-editorial-sm bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="editorial-label text-[#C8956C]">Service Options</span>
            <h2 className="editorial-subheading text-deep-espresso mt-2">
              Repair & Service Plans
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {repairOptions.map((option, i) => (
              <RevealOnScroll key={i} delay={i * 0.1}>
                <div className={`editorial-card p-6 ${option.highlight ? 'ring-2 ring-[#C8956C]' : ''}`}>
                  {option.highlight && (
                    <span className="inline-block px-3 py-1 bg-[#C8956C] text-white text-xs font-semibold rounded-full mb-4">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-semibold text-deep-espresso mb-2">{option.title}</h3>
                  <p className="text-muted mb-4">{option.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-stone">
                    <div>
                      <p className="text-sm text-muted">Turnaround</p>
                      <p className="font-semibold text-deep-espresso">{option.turnaround}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted">Cost</p>
                      <p className="font-bold text-[#C8956C]">{option.cost}</p>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Service Process */}
      <section className="py-16 lg:py-24 section-editorial bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="editorial-label text-[#C8956C]">How It Works</span>
            <h2 className="editorial-subheading text-deep-espresso mt-2">
              Simple 4-Step Process
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {processSteps.map((step, i) => (
              <RevealOnScroll key={i} delay={i * 0.15}>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C8956C] to-[#8B7355] flex items-center justify-center text-2xl mx-auto mb-4">
                    {step.icon}
                  </div>
                  <span className="text-5xl font-bold text-[#E8D5C4] -mt-8 block">{step.step}</span>
                  <h3 className="font-semibold text-deep-espresso mt-2 mb-1">{step.title}</h3>
                  <p className="text-sm text-muted">{step.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Service Centers */}
      <section className="py-16 lg:py-24 section-editorial-sm bg-[#E8D5C4]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="editorial-label text-[#C8956C]">Locations</span>
            <h2 className="editorial-subheading text-deep-espresso mt-2">
              Service Centers
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceCenters.map((center, i) => (
              <RevealOnScroll key={i} delay={i * 0.05}>
                <div className="editorial-card p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C8956C]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#C8956C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-deep-espresso">{center.city}, {center.state}</h3>
                      <span className="text-xs px-2 py-0.5 bg-[#C8956C]/10 text-[#C8956C] rounded-full">{center.type}</span>
                    </div>
                    <p className="text-sm text-muted">{center.address}</p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 section-editorial bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="editorial-label text-[#C8956C]">FAQ</span>
            <h2 className="editorial-subheading text-deep-espresso mt-2">
              Common Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-medium text-deep-espresso hover:text-[#C8956C]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-[#3D3330] to-[#5C534E]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <RevealOnScroll>
            <span className="editorial-label text-white/70">Need More Help?</span>
            <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-white mt-4 mb-6 tracking-tight">
              Let's Get You Moving Again
            </h2>
            <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Our support team is ready to help with any questions about your GoldSeason product.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+18889988182"
                className="btn-primary text-lg px-10 py-4"
              >
                Call +1 888 998 8182
              </a>
              <a
                href="mailto:help@seniorchairservice.com"
                className="inline-flex items-center justify-center px-10 py-4 rounded-lg border-2 border-white/30 text-white font-medium hover:bg-white/10 transition-colors"
              >
                Email Us
              </a>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </div>
  );
}
