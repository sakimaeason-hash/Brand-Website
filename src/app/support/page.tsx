"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    value: "1-800-GOLD-SEA",
    subtitle: "Mon-Sun 9AM-6PM EST",
    action: "Call Now",
  },
  {
    icon: "💬",
    title: "Live Chat",
    value: "Available Now",
    subtitle: "Average wait: 2 mins",
    action: "Start Chat",
  },
  {
    icon: "📧",
    title: "Email Support",
    value: "support@goldseason.com",
    subtitle: "Response within 24 hours",
    action: "Send Email",
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
  {
    title: "On-Site Service",
    description: "We come to your home",
    turnaround: "48 hours",
    cost: "$149 + parts",
    highlight: false,
  },
];

const serviceCenters = [
  {
    city: "San Francisco",
    state: "CA",
    address: "123 Innovation Drive, Suite 200",
    phone: "(415) 555-0100",
    type: "Flagship",
  },
  {
    city: "Los Angeles",
    state: "CA",
    address: "456 Care Boulevard",
    phone: "(310) 555-0200",
    type: "Service Center",
  },
  {
    city: "New York",
    state: "NY",
    address: "789 Freedom Lane",
    phone: "(212) 555-0300",
    type: "Service Center",
  },
  {
    city: "Chicago",
    state: "IL",
    address: "321 Mobility Ave",
    phone: "(312) 555-0400",
    type: "Authorized",
  },
  {
    city: "Houston",
    state: "TX",
    address: "654 Independence St",
    phone: "(713) 555-0500",
    type: "Authorized",
  },
  {
    city: "Miami",
    state: "FL",
    address: "987 Sunshine Road",
    phone: "(305) 555-0600",
    type: "Authorized",
  },
];

const faqs = [
  {
    question: "How do I fold and unfold my GoldSeason wheelchair?",
    answer:
      "All GoldSeason wheelchairs feature our patented 3-second fold mechanism. Simply pull the release lever located at the back of the seat, and the chair will fold inward. To unfold, pull the handles apart until you hear a click indicating the locking mechanism has engaged.",
  },
  {
    question: "Is my wheelchair covered for airline travel?",
    answer:
      "Yes! All GoldSeason wheelchairs are FAA compliant and can be checked as medical equipment at no additional charge. We recommend removing the joystick controller and carrying it in your hand luggage for protection.",
  },
  {
    question: "How long does the battery last?",
    answer:
      "Battery life depends on the model and usage conditions. The Lite offers up to 10 miles per charge, the Pro up to 15 miles, and the Elite up to 20 miles. All batteries use lithium-ion technology and take 6-8 hours for a full charge.",
  },
  {
    question: "What should I do if my wheelchair needs repair?",
    answer:
      "Contact our support team via phone, chat, or email. We&apos;ll troubleshoot with you and determine if a repair is needed. For in-warranty repairs, we'll send you a prepaid shipping label. For on-site service, we'll schedule a technician visit.",
  },
  {
    question: "Can I upgrade my wheelchair after purchase?",
    answer:
      "Yes! We offer various upgrade options including extended batteries, upgraded cushions, and accessory packages. Contact our sales team to discuss upgrade options for your specific model.",
  },
];

const processSteps = [
  {
    step: "01",
    icon: "📝",
    title: "Request Service",
    desc: "Submit online or call us",
  },
  {
    step: "02",
    icon: "🔍",
    title: "Diagnosis",
    desc: "We assess and quote",
  },
  {
    step: "03",
    icon: "🔧",
    title: "Repair",
    desc: "Expert technicians fix",
  },
  {
    step: "04",
    icon: "✓",
    title: "Return",
    desc: "Receive good as new",
  },
];

export default function SupportPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

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
              24/7 Support Available
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              We&apos;re Here to Help
            </h1>
            <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto">
              Get expert support for your GoldSeason product. From warranty
              service to repairs, our team is dedicated to keeping you moving.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Contact Cards */}
      <section className="py-12 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 -mt-24 relative z-10">
            {quickLinks.map((link, i) => (
              <Card
                key={i}
                className="text-center hover:shadow-xl transition-all bg-white"
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 transition-all ${
                      hoveredCard === i
                        ? "bg-[#F5A623] scale-110"
                        : "bg-[#F5A623]/10"
                    }`}
                  >
                    {link.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#2D2D2D] mb-2">
                    {link.title}
                  </h3>
                  <p className="text-[#2AAAA0] font-semibold mb-1">
                    {link.value}
                  </p>
                  <p className="text-sm text-[#6B6B6B] mb-4">{link.subtitle}</p>
                  <Button
                    variant="outline"
                    className="w-full border-[#2AAAA0] text-[#2AAAA0] hover:bg-[#2AAAA0] hover:text-white"
                  >
                    {link.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Warranty Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2">
                Peace of Mind
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-6">
                Industry-Leading Warranty
              </h2>
              <p className="text-[#6B6B6B] mb-8 leading-relaxed">
                Every GoldSeason product comes with our comprehensive warranty.
                We stand behind our quality and are committed to your long-term
                satisfaction.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { value: "5", label: "Year Frame Warranty" },
                  { value: "FREE", label: "In-Warranty Repairs" },
                  { value: "24/7", label: "Support Access" },
                  { value: "30-Day", label: "Return Policy" },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#FAF8F5] rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-[#F5A623]">
                      {stat.value}
                    </p>
                    <p className="text-xs text-[#6B6B6B]">{stat.label}</p>
                  </div>
                ))}
              </div>

              <Button className="bg-[#2AAAA0] hover:bg-[#259990]">
                Download Warranty PDF
              </Button>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-[#2D2D2D] text-white p-4">
                  <h3 className="font-semibold">Warranty Coverage</h3>
                </div>
                <div className="divide-y divide-[#E8E8E8]">
                  {warrantyCoverage.map((item, i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#2D2D2D]">
                          {item.component}
                        </p>
                        <p className="text-xs text-[#6B6B6B]">{item.details}</p>
                      </div>
                      <Badge
                        className={`${
                          item.period === "5 Years"
                            ? "bg-[#F5A623] text-[#2D2D2D]"
                            : "bg-[#2AAAA0]/10 text-[#2AAAA0]"
                        }`}
                      >
                        {item.period}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Repair Options */}
      <section className="py-16 lg:py-24 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2">
              Service Options
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-4">
              Repair Options
            </h2>
            <p className="text-[#6B6B6B] max-w-2xl mx-auto">
              Choose the service option that works best for your needs and
              timeline.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {repairOptions.map((option, i) => (
              <Card
                key={i}
                className={`overflow-hidden ${
                  option.highlight ? "ring-2 ring-[#F5A623]" : ""
                }`}
              >
                {option.highlight && (
                  <div className="bg-[#F5A623] text-[#2D2D2D] text-center text-xs font-bold py-1">
                    MOST POPULAR
                  </div>
                )}
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-bold text-[#2D2D2D] mb-2">
                    {option.title}
                  </h3>
                  <p className="text-sm text-[#6B6B6B] mb-4">
                    {option.description}
                  </p>
                  <div className="border-t border-[#E8E8E8] pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B6B6B]">Turnaround</span>
                      <span className="text-[#2D2D2D] font-medium">
                        {option.turnaround}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6B6B6B]">Cost</span>
                      <span
                        className={`font-bold ${
                          option.cost === "FREE"
                            ? "text-[#2AAAA0]"
                            : "text-[#F5A623]"
                        }`}
                      >
                        {option.cost}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Process */}
      <section className="py-16 lg:py-24 bg-[#2D2D2D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              How Service Works
            </h2>
            <p className="text-[#B0B0B0] max-w-2xl mx-auto">
              Simple, hassle-free service process designed around your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {processSteps.map((item, i) => (
              <div key={i} className="text-center relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-[#F5A623]/30" />
                )}
                <div className="w-16 h-16 bg-[#F5A623] rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 relative z-10">
                  {item.icon}
                </div>
                <p className="text-[#F5A623] text-sm font-bold mb-1">
                  Step {item.step}
                </p>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-[#B0B0B0] text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Centers */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2">
                Visit Us
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D]">
                Service Centers
              </h2>
            </div>
            <Button variant="outline" className="self-start">
              View All Locations
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCenters.map((center, i) => (
              <Card
                key={i}
                className="group hover:shadow-lg transition-all overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-[#2D2D2D]">
                          {center.city}, {center.state}
                        </h3>
                        <Badge
                          variant={
                            center.type === "Flagship" ? "default" : "secondary"
                          }
                          className="mt-1"
                        >
                          {center.type}
                        </Badge>
                      </div>
                      <div className="w-10 h-10 bg-[#F5A623]/10 rounded-lg flex items-center justify-center group-hover:bg-[#F5A623] transition-colors">
                        <svg
                          className="w-5 h-5 text-[#F5A623] group-hover:text-[#2D2D2D]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-[#6B6B6B] mb-1">
                      {center.address}
                    </p>
                    <p className="text-sm text-[#2AAAA0] font-medium">
                      {center.phone}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-[#FAF8F5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2">
              Common Questions
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-[#6B6B6B]">
              Find quick answers to common questions about our products and
              services.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white rounded-lg mb-3 border-none">
                <AccordionTrigger className="px-6 py-4 hover:no-underline text-left font-semibold text-[#2D2D2D]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-[#6B6B6B]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-8">
            <p className="text-[#6B6B6B] mb-4">
              Cannot find what you're looking for?
            </p>
            <Button
              variant="outline"
              className="border-[#2AAAA0] text-[#2AAAA0] hover:bg-[#2AAAA0] hover:text-white"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-[#F5A623] to-[#E09520]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-6">
            Need Immediate Assistance?
          </h2>
          <p className="text-lg text-[#2D2D2D]/80 mb-8 max-w-2xl mx-auto">
            Our support team is standing by to help you with any questions or
            concerns.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a]"
            >
              Call 1-800-GOLD-SEA
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white"
            >
              Start Live Chat
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
