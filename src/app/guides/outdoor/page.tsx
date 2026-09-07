"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const tableOfContents = [
  { id: "assessment", label: "1. Pre-Renovation Assessment" },
  { id: "ramps", label: "2.1 Ramps and Entries" },
  { id: "pathways", label: "2.2 Pathways" },
  { id: "gardening", label: "2.3 Gardening" },
  { id: "furniture", label: "2.4 Outdoor Furniture" },
  { id: "plans", label: "3. Plan Comparison" },
  { id: "safety", label: "5. Safety" },
  { id: "cases", label: "6. Case Studies" },
  { id: "checklist", label: "7. Checklist" },
  { id: "resources", label: "8. Resources" },
];

function ImagePlaceholder({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="my-8">
      <div className="relative rounded-2xl overflow-hidden">
        <img src={src} alt={alt} className="w-full" />
      </div>
      {caption && <figcaption className="text-center text-sm text-[#6B6B6B] mt-3 italic">{caption}</figcaption>}
    </figure>
  );
}

export default function OutdoorGuidePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#4A9B6F] via-[#3d8a5f] to-[#2d6b4a] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F5A623]/20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-5xl">🌿</span>
              <Badge className="bg-white/20 text-white border-white/30">Outdoor Guide</Badge>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">Outdoor Accessibility</h1>
            <p className="text-xl text-white/90 mb-8">Powered Wheelchair Adaptation — Complete Guide</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="bg-white/15 px-4 py-2 rounded-full">📐 ADA Standards</span>
              <span className="bg-white/15 px-4 py-2 rounded-full">💰 Budget: $100–$10,000</span>
              <span className="bg-white/15 px-4 py-2 rounded-full">⏱ 1 day – 3 weeks</span>
              <span className="bg-white/15 px-4 py-2 rounded-full">📊 Difficulty: Medium</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wide mb-3">Table of Contents</p>
              <nav className="space-y-1">
                {tableOfContents.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="block w-full text-left text-sm px-3 py-2 rounded-lg text-[#6B6B6B] hover:bg-[#4A9B6F]/10 hover:text-[#4A9B6F] transition-all"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-6">
                <Link href="/guides">
                  <Button variant="outline" size="sm" className="w-full">← All Guides</Button>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {/* Intro */}
            <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
              <div className="flex flex-wrap gap-2 mb-4">
                {["powered wheelchair", "outdoor", "accessibility", "ramp", "garden"].map((tag) => (
                  <Badge key={tag} className="bg-[#e8f7f6] text-[#4A9B6F]" variant="secondary">{tag}</Badge>
                ))}
              </div>
              <p className="text-lg text-[#6B6B6B] mb-3">
                <strong className="text-[#2D2D2D]">Target Users:</strong> Seniors and wheelchair users who want to enjoy their outdoor space safely — gardens, patios, porches, and yards.
              </p>
              <p className="text-[#6B6B6B]">
                <strong className="text-[#2D2D2D]">Core Value:</strong> Enable wheelchair users to access, use, and enjoy outdoor spaces independently — from getting outside to tending a garden or relaxing on a patio.
              </p>
            </div>

            {/* Section 1: Assessment */}
            <section id="assessment" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#4A9B6F]">
                1. Pre-Renovation Assessment
              </h2>

              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">1.1 Site Assessment</h3>
              <p className="text-[#6B6B6B] mb-4">
                Before making changes, document the current outdoor layout. Note elevation changes, surface types, and the distance from the door to key outdoor areas.
              </p>

              <ImagePlaceholder
                src="/Homeguide/Outdoor Accessibility/Measuring elevation change and surface type at a home entrance for outdoor accessibility planning.jpg"
                alt="Measuring elevation change and surface type at a home entrance for outdoor accessibility planning"
                caption="Start by documenting: how much elevation change exists at each entry point, what surface types are present, and the path from door to key destinations."
              />

              <div className="grid md:grid-cols-2 gap-3 mb-6">
                {[
                  ["Entry type (main door, patio door, garage)", "________"],
                  ["Elevation change at entry", "________ inches"],
                  ["Path surface type", "Concrete / Pavers / Grass / Gravel / Deck"],
                  ["Path width (narrowest point)", "________ inches"],
                  ["Turning diameter at destinations", "________ inches"],
                  ["Distance: door to garden/shed/patio", "________ feet"],
                  ["Drainage issues", "Yes / No"],
                  ["Lighting available", "Yes / No"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[#4A9B6F] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#6B6B6B]">{label}</p>
                      <p className="text-sm font-medium text-[#2D2D2D]">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3 mt-8">1.2 Key Outdoor Zones</h3>
              <p className="text-[#6B6B6B] mb-4">Identify which outdoor areas you want to make accessible and rank them by priority:</p>
              <div className="grid md:grid-cols-2 gap-3">
                {["Primary entry (front/back door)", "Patio or deck", "Garden or raised beds", "Storage shed or greenhouse", "Composting area", "BBQ grill station"].map((zone) => (
                  <label key={zone} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm text-sm text-[#6B6B6B] cursor-pointer hover:bg-[#4A9B6F]/5">
                    <input type="checkbox" className="rounded border-[#E8E8E8]" />
                    {zone}
                  </label>
                ))}
              </div>
            </section>

            {/* Section 2: Ramps */}
            <section id="ramps" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#4A9B6F]">
                2. Core Modification Points
              </h2>

              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">2.1 Ramps and Entries</h3>
              <p className="text-[#6B6B6B] mb-4">
                Getting in and out of the house is the first barrier. Standard door thresholds and stairs are impassable for many powered wheelchair users.
              </p>

              <ImagePlaceholder
                src="/Homeguide/Outdoor Accessibility/Modular aluminum threshold ramp at a standard 4-inch door threshold.jpg"
                alt="Modular aluminum threshold ramp at a standard 4-inch door threshold — lightweight, portable, ADA-compliant"
                caption="Threshold ramps bridge small elevation changes (1–6 inches) at doorways. Modular aluminum ramps can be permanent fixtures that blend with the home exterior."
              />

              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="bg-[#4A9B6F] text-white">
                    <th className="px-4 py-3 text-left">Elevation Change</th>
                    <th className="px-4 py-3 text-left">Recommended Solution</th>
                    <th className="px-4 py-3 text-left">Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {[
                    ["Under 2 inches", "Rubber threshold ramp (portable or permanent)", "$30–100"],
                    ["2–4 inches", "Foldable aluminum threshold ramp", "$80–200"],
                    ["4–8 inches", "Modular ramp system", "$400–1,000"],
                    ["8+ inches", "Permanent custom ramp (concrete or framed)", "$2,000–8,000"],
                  ].map(([change, solution, cost]) => (
                    <tr key={change} className="bg-white">
                      <td className="px-4 py-3 font-medium text-[#2D2D2D]">{change}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{solution}</td>
                      <td className="px-4 py-3 text-[#F5A623] font-semibold">{cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 className="text-base font-semibold text-[#2D2D2D] mb-3">Ramp Design Standards</h4>
              <div className="bg-[#4A9B6F]/5 border border-[#4A9B6F]/20 rounded-xl p-5 mb-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { label: "Slope Ratio", value: "1:12 max", note: "1\" rise per 12\" run" },
                    { label: "Minimum Width", value: "36 inches", note: "ADA minimum" },
                    { label: "Landing Size", value: "60×60 inches", note: "At top, bottom, and turns" },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-2xl font-bold text-[#4A9B6F]">{s.value}</p>
                      <p className="text-sm font-medium text-[#2D2D2D]">{s.label}</p>
                      <p className="text-xs text-[#6B6B6B]">{s.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <h4 className="text-base font-semibold text-[#2D2D2D] mb-3">Railing and Landing Requirements</h4>
              <ul className="list-disc pl-6 text-[#6B6B6B] space-y-1">
                <li>Ramps longer than 30 feet need an intermediate landing</li>
                <li>Handrails are required on both sides for slopes over 1:20 (or ramps longer than 6 feet)</li>
                <li>Edge protection (wheel guards or flared sides) prevents the wheelchair from rolling off the edge</li>
                <li>Surface must be slip-resistant — especially important for outdoor conditions</li>
              </ul>
            </section>

            {/* Pathways */}
            <section id="pathways" className="mb-12">
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">2.2 Pathways and Walkways</h3>
              <p className="text-[#6B6B6B] mb-4">
                Outdoor pathways must accommodate the wheelchair's turning radius and be wide enough to pass comfortably. Surface texture is equally important for safety.
              </p>

              <ImagePlaceholder
                src="/Homeguide/Outdoor Accessibility/Comparison of outdoor pathway surfaces.jpg"
                alt="Comparison of outdoor pathway surfaces — smooth concrete, pavers, and deck boards showing accessibility differences"
                caption="Left to right: smooth broom-finished concrete (best), interlocking pavers with narrow gaps (acceptable), and wooden deck boards (moderate — gaps can catch small wheels)."
              />

              <div className="space-y-3">
                {[
                  { type: "Broom-finished concrete", rating: "★★★★★", best: true, note: "Smooth, continuous, widest wheelchair path" },
                  { type: "Interlocking concrete pavers", rating: "★★★★☆", best: false, note: "Good if gaps are minimal (under ½\"). Uneven surfaces can cause vibration." },
                  { type: "Decorative gravel", rating: "★★☆☆☆", best: false, note: "Avoid — high rolling resistance. Wheels sink and the chair can get stuck." },
                  { type: "Mulch / wood chips", rating: "★☆☆☆☆", best: false, note: "Not suitable for wheelchair use. Even with adaptive bikes, nearly impossible to navigate." },
                  { type: "Artificial turf", rating: "★★★☆☆", best: false, note: "Acceptable if installed over a solid base. Can melt in hot climates and become slippery when wet." },
                ].map((surface) => (
                  <Card key={surface.type} className={surface.best ? "border-[#4A9B6F]" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-[#2D2D2D]">{surface.type}</p>
                          <p className="text-sm text-[#6B6B6B]">{surface.note}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {surface.best && <Badge className="bg-[#4A9B6F]/10 text-[#4A9B6F]">Recommended</Badge>}
                          <span className="text-[#4A9B6F] font-bold">{surface.rating}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <h4 className="text-base font-semibold text-[#2D2D2D] mb-3 mt-6">Pathway Width and Clearance</h4>
              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="bg-[#4A9B6F] text-white">
                    <th className="px-4 py-3 text-left">Standard</th>
                    <th className="px-4 py-3 text-left">ADA Accessible</th>
                    <th className="px-4 py-3 text-left">Comfortable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {[
                    ["Pathway width", "36 inches", "48+ inches"],
                    ["Passing space (every 200 ft)", "60×60 inches", "72×72 inches"],
                    ["Overhead clearance", "80 inches", "84+ inches"],
                    ["Max cross slope", "1:50 (2%)", "As flat as possible"],
                  ].map(([item, ada, comfortable]) => (
                    <tr key={item} className="bg-white">
                      <td className="px-4 py-3 font-medium text-[#2D2D2D]">{item}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{ada}</td>
                      <td className="px-4 py-3 text-[#4A9B6F] font-semibold">{comfortable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Gardening */}
            <section id="gardening" className="mb-12">
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">2.3 Gardening and Raised Beds</h3>
              <p className="text-[#6B6B6B] mb-4">
                Gardening is one of the most rewarding outdoor activities. Raised beds bring plants to wheelchair height, making gardening accessible from a seated position.
              </p>

              <ImagePlaceholder
                src="/Homeguide/Outdoor Accessibility/accessible raised garden beds.jpg"
                alt="Three accessible raised garden beds at different heights for wheelchair users — low (24 inches), mid (30 inches), and high (36 inches)"
                caption="Accessible raised beds should be no wider than 24 inches from edge to center (arm's reach from a seated position). Knee clearance below allows wheelchair approach from any direction."
              />

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  { label: "Bed Height", value: "24–30 inches", note: "Allows wheelchair armrests to fit under. Top of bed should be at elbow height." },
                  { label: "Bed Width", value: "24 inches max", note: "From edge to center of bed — maximum reach from a seated position." },
                  { label: "Bed Depth", value: "24 inches max", note: "Shallow enough to reach the center without overextending." },
                  { label: "Knee Clearance Below", value: "27 inches high × 30 inches wide", note: "For wheelchair footrests and user's knees when approaching from front." },
                ].map((spec) => (
                  <Card key={spec.label}>
                    <CardContent className="p-4">
                      <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">{spec.label}</p>
                      <p className="text-xl font-bold text-[#4A9B6F] mb-1">{spec.value}</p>
                      <p className="text-sm text-[#6B6B6B]">{spec.note}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <h4 className="text-base font-semibold text-[#2D2D2D] mb-3">Easy Gardening Tools and Aids</h4>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  ["Long-handled tools", "Avoids bending. Ergonomic grips reduce hand fatigue."],
                  ["Vertical growing towers", "Plants at chest height — no bending or kneeling needed."],
                  ["Container gardening", "Move pots to a table or raised surface for easy access."],
                ].map(([tool, desc]) => (
                  <Card key={tool}>
                    <CardContent className="p-4 text-center">
                      <p className="font-medium text-[#2D2D2D] text-sm mb-1">{tool}</p>
                      <p className="text-xs text-[#6B6B6B]">{desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Furniture */}
            <section id="furniture" className="mb-12">
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">2.4 Outdoor Furniture</h3>
              <p className="text-[#6B6B6B] mb-4">
                Standard outdoor furniture is not designed for wheelchair users. Armrests, seat height, and chair spacing all need to be considered.
              </p>

              <ImagePlaceholder
                src="/Homeguide/Outdoor Accessibility/Accessible outdoor seating area with one side open for wheelchair parking.jpg"
                alt="Accessible outdoor seating area with one side open for wheelchair parking, table at 28-30 inches high"
                caption="Accessible outdoor dining: table at 28–30 inches high with knee clearance of at least 27 inches high. One side of the table is open for wheelchair approach."
              />

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { label: "Seat Height", value: "17–19 inches", note: "Matches wheelchair seat height for easy transfer. Avoid tall bar stools." },
                  { label: "Armrests", value: "Required on transfer side", note: "Provides stability when sitting down and standing up." },
                  { label: "Table Knee Clearance", value: "27\" high × 30\" wide × 19\" deep", note: "ADA 2010 standard — allows wheelchair footrest and user to approach." },
                  { label: "Chair Spacing", value: "36\" between chairs", note: "Minimum for wheelchair passage. 48\" is more comfortable." },
                ].map((spec) => (
                  <Card key={spec.label}>
                    <CardContent className="p-4">
                      <p className="text-xs text-[#6B6B6B] uppercase tracking-wide mb-1">{spec.label}</p>
                      <p className="text-xl font-bold text-[#4A9B6F] mb-1">{spec.value}</p>
                      <p className="text-sm text-[#6B6B6B]">{spec.note}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Section 3: Plans */}
            <section id="plans" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#4A9B6F]">
                3. Renovation Plan Comparison
              </h2>

              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="bg-[#2D2D2D] text-white">
                    {["", "Easy", "Medium", "Major"].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {[
                    ["Budget", "$100–500", "$500–2,500", "$2,500–10,000+"],
                    ["Time", "1 day", "2–7 days", "1–3 weeks"],
                    ["Core Work", "Threshold ramps, mats", "Pathways, raised beds", "Full yard renovation"],
                    ["Best For", "Renters, minor needs", "Homeowners, regular use", "Full-time outdoor living"],
                    ["Independence", "⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"],
                  ].map(([aspect, easy, medium, major]) => (
                    <tr key={aspect} className="bg-white hover:bg-[#FAF8F5]">
                      <td className="px-4 py-3 font-medium text-[#2D2D2D]">{aspect}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{easy}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{medium}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{major}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { level: "Easy Plan", color: "#4CAF50", items: ["Rubber threshold ramp ($30–100)", "Non-slip outdoor mat at entry ($20–50)", "Portable fold ramp for steps ($80–200)", "Garden container on raised platform ($30–100)", "Long-handled gardening tools ($20–80)"] },
                  { level: "Medium Plan", color: "#F5A623", items: ["Modular ramp system ($400–1,000)", "Concrete pathway to garden ($300–800)", "2–3 raised garden beds ($200–600)", "Accessible outdoor table with knee clearance ($150–400)", "Motion-sensor outdoor lighting ($50–150)"] },
                  { level: "Major Plan", color: "#E53935", items: ["Permanent framed ramp with rails ($2,000–6,000)", "Full broom-finished concrete pathways ($800–2,000)", "6+ raised beds with drip irrigation ($500–1,500)", "Patio with accessible furniture zone ($1,000–3,000)", "Outdoor smart lighting + motion sensors ($300–800)"] },
                ].map((plan) => (
                  <Card key={plan.level}>
                    <div className="h-1 rounded-t-xl" style={{ backgroundColor: plan.color }} />
                    <CardContent className="p-4">
                      <p className="font-bold text-[#2D2D2D] mb-3">{plan.level}</p>
                      <ul className="space-y-2">
                        {plan.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-[#6B6B6B]">
                            <span style={{ color: plan.color }}>✓</span> {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Section 5: Safety */}
            <section id="safety" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#4A9B6F]">
                5. Safety Considerations
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: "🌡️ Sun and Heat",
                    color: "#E53935",
                    items: [
                      ["Use high-SPF sunscreen and reapply every 2 hours", true],
                      ["Wear a wide-brimmed hat and breathable, light-colored clothing", true],
                      ["Stay hydrated — outdoor activity in heat increases fluid needs", true],
                      ["Limit outdoor activity to early morning or late afternoon in summer", true],
                      ["Avoid metal surfaces on furniture — can cause burns", false],
                    ],
                  },
                  {
                    title: "☀️ Cold and Weather",
                    color: "#4A9B6F",
                    items: [
                      ["Use lap blankets or wheelchair covers for warmth", true],
                      ["Apply anti-slip treatment to outdoor surfaces before winter", true],
                      ["Clear ice and snow from pathways immediately", true],
                      ["Use a weatherproof cover for the wheelchair when outdoors", true],
                      ["Avoid wet leaves on pathways — extremely slippery", false],
                    ],
                  },
                  {
                    title: "🦟 Bites and Stings",
                    color: "#F5A623",
                    items: [
                      ["Use EPA-registered insect repellent (DEET 30%+ for ticks)", true],
                      ["Wear long sleeves and pants during high-risk seasons", true],
                      ["Perform tick checks after any outdoor time", true],
                      ["Keep soil and compost covered to reduce insect attractants", true],
                    ],
                  },
                  {
                    title: "⚡ Electrical and Water",
                    color: "#1565C0",
                    items: [
                      ["Keep all electrical outlets and cords covered (rain protection)", true],
                      ["Ensure pathways have adequate drainage — standing water is a slip hazard", true],
                      ["Never operate electrical gardening tools in wet conditions", false],
                      ["Use battery-powered tools over corded when possible", true],
                    ],
                  },
                ].map((section) => (
                  <Card key={section.title}>
                    <div className="h-1 rounded-t-xl" style={{ backgroundColor: section.color }} />
                    <CardContent className="p-4">
                      <p className="font-semibold text-[#2D2D2D] mb-3">{section.title}</p>
                      <div className="space-y-2">
                        {section.items.map((item, idx) => {
                          const [text, good] = item;
                          return (
                            <div key={idx} className={`flex items-start gap-2 text-sm ${good ? "text-[#6B6B6B]" : "text-red-500"}`}>
                              <span className={good ? "text-green-500" : "text-red-400"}>{good ? "✅" : "❌"}</span>
                              {text}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Section 6: Cases */}
            <section id="cases" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#4A9B6F]">
                6. Real Stories
              </h2>

              {[
                {
                  name: "Sarah's Garden",
                  location: "Portland, Oregon",
                  age: "70",
                  condition: "Osteoarthritis, powered wheelchair user for 2 years",
                  budget: "$450",
                  img: "/Homeguide/Outdoor Accessibility/Sarah's Garden.jpg",
                  quote: "I'd given up on gardening after I started using the wheelchair. With the raised beds and the long-handled tools, I'm growing tomatoes again for the first time in three years.",
                  changes: [
                    "Three raised garden beds at 24\" height (elbow height from wheelchair)",
                    "Concrete pathway (36\" wide) from back door to garden area",
                    "Rubber threshold ramp at patio door (2\" rise)",
                    "Long-handled ergonomic gardening tools ($60 total)",
                    "Motion-sensor solar lights along pathway ($40)",
                  ],
                },
              ].map((story) => (
                <Card key={story.name} className="overflow-hidden mb-6 border-t-4 border-[#4A9B6F]">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#2D2D2D] mb-1">{story.name}</h3>
                        <p className="text-sm text-[#6B6B6B] mb-2">{story.location} · {story.age} years old · {story.condition}</p>
                        <p className="text-sm font-semibold text-[#F5A623] mb-4">Budget: {story.budget}</p>
                        <div className="space-y-2 mb-4">
                          {story.changes.map((change) => (
                            <div key={change} className="flex items-start gap-2 text-sm text-[#6B6B6B]">
                              <span className="text-[#4A9B6F]">✓</span> {change}
                            </div>
                          ))}
                        </div>
                        <blockquote className="bg-[#4A9B6F]/5 border-l-4 border-[#4A9B6F] rounded-r-lg p-4">
                          <p className="text-sm text-[#6B6B6B] italic">"{story.quote}"</p>
                        </blockquote>
                      </div>
                      <div className="md:w-64 flex-shrink-0">
                        <ImagePlaceholder
                          src={story.img}
                          alt={`${story.name}'s accessible garden with raised beds and pathway`}
                          caption={`${story.name}'s garden — three 24-inch raised beds, concrete pathway, and solar lighting.`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>

            {/* Checklist */}
            <section id="checklist" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#4A9B6F]">
                7. Final Checklist
              </h2>

              {[
                { title: "Entry and Ramp", items: ["Entry threshold has a ramp or is under 2 inches with a rubber ramp", "Ramp slope is 1:12 or less", "Ramp has handrails on both sides", "Landing area at top and bottom is at least 60×60 inches"] },
                { title: "Pathways", items: ["Pathway is at least 36 inches wide", "Surface is smooth and firm (concrete or pavers)", "No cross slope that would cause the wheelchair to drift", "Path is clear of hoses, garden tools, and debris"] },
                { title: "Garden and Beds", items: ["Raised beds are 24–30 inches high", "Beds are no wider than 24 inches (reachable from edge)", "Knee clearance below beds is at least 27 inches high", "Gardening tools are within reach without bending"] },
                { title: "Outdoor Furniture", items: ["Seating is 17–19 inches high", "At least one seating space allows wheelchair transfer", "Table knee clearance is at least 27 inches high × 30 inches wide", "Chairs are spaced at least 36 inches apart"] },
                { title: "Safety", items: ["Pathway lighting is adequate for evening use", "No standing water or ice on pathways", "Electrical outlets near outdoor areas are weatherproofed", "Fire extinguisher is accessible near the BBQ area"] },
              ].map((section) => (
                <div key={section.title} className="mb-6">
                  <h4 className="font-semibold text-[#2D2D2D] mb-2">{section.title}</h4>
                  <div className="bg-white rounded-xl p-4 border border-[#E8E8E8]">
                    <div className="grid md:grid-cols-2 gap-2">
                      {section.items.map((item) => (
                        <label key={item} className="flex items-start gap-3 text-sm text-[#6B6B6B] cursor-pointer hover:text-[#2D2D2D]">
                          <input type="checkbox" className="mt-0.5 rounded border-[#E8E8E8]" />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Resources */}
            <section id="resources" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#4A9B6F]">
                8. Resources
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold text-[#2D2D2D] mb-3">📋 Standards and Organizations</p>
                    <ul className="space-y-2 text-sm text-[#6B6B6B]">
                      <li><a href="https://www.ada.gov/" className="text-[#4A9B6F] hover:underline">ADA Standards for Accessible Design</a></li>
                      <li><a href="https://www.ncsu.edu/ncsu/design/cud/" className="text-[#4A9B6F] hover:underline">Universal Design Center — NC State</a></li>
                      <li><a href="https://www.aarp.org/livable-communities/" className="text-[#4A9B6F] hover:underline">AARP Livable Communities</a></li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold text-[#2D2D2D] mb-3">📚 Further Reading</p>
                    <ul className="space-y-2 text-sm text-[#6B6B6B]">
                      <li><em>Universal Design for the Home</em> by Wendy A. Jordan</li>
                      <li><a href="https://www.aarp.org/livable-communities/info-2014/aarp-home-fit-guide.html" className="text-[#4A9B6F] hover:underline">AARP HomeFit Guide</a></li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <div className="bg-gradient-to-r from-[#4A9B6F]/10 to-[#F5A623]/10 rounded-2xl p-6 mt-8">
              <p className="text-sm text-[#6B6B6B]">
                💡 <strong>Before starting outdoor construction</strong>, check with your local municipality about permit requirements for ramps, pathways, and structures. Some jurisdictions require permits for ramps that exceed a certain height or length. A landscaping contractor with ADA experience can help navigate these requirements.
              </p>
              <p className="text-xs text-[#6B6B6B] mt-3">
                <strong>Document Version:</strong> v1.0 · Last Updated: April 2026 · Review Status: Awaiting expert review
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
