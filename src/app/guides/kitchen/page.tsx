"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const tableOfContents = [
  { id: "assessment", label: "1. Pre-Renovation Assessment" },
  { id: "doorways", label: "2.1 Doorways and Passages" },
  { id: "counter", label: "2.2 Counter Height" },
  { id: "sink", label: "2.3 Sink Modification" },
  { id: "cooktop", label: "2.4 Cooktop Safety" },
  { id: "storage", label: "2.5 Storage Systems" },
  { id: "plans", label: "3. Renovation Plan Comparison" },
  { id: "products", label: "4. Product Recommendations" },
  { id: "safety", label: "5. Safety Considerations" },
  { id: "cases", label: "6. Real Case Studies" },
  { id: "checklist", label: "7. Final Checklist" },
  { id: "resources", label: "8. Resources" },
];

function ImagePlaceholder({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="my-8">
      <div className="relative rounded-2xl overflow-hidden">
        <img src={src} alt={alt} className="w-full" />
      </div>
      {caption && (
        <figcaption className="text-center text-sm text-[#6B6B6B] mt-3 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function KitchenGuidePage() {
  const [activeSection, setActiveSection] = useState("assessment");

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#F5A623] via-[#E09520] to-[#d4850f] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2AAAA0]/20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-5xl">🍳</span>
              <Badge className="bg-white/20 text-white border-white/30">
                Kitchen Guide
              </Badge>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              Kitchen Accessibility
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Powered Wheelchair Adaptation — Complete Guide
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="bg-white/15 px-4 py-2 rounded-full">
                📐 ADA Standards
              </span>
              <span className="bg-white/15 px-4 py-2 rounded-full">
                💰 Budget: $140–$15,000+
              </span>
              <span className="bg-white/15 px-4 py-2 rounded-full">
                ⏱ 1 hour – 2 weeks
              </span>
              <span className="bg-white/15 px-4 py-2 rounded-full">
                📊 Difficulty: Medium
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sticky Sidebar TOC */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wide mb-3">
                Table of Contents
              </p>
              <nav className="space-y-1">
                {tableOfContents.map((item) => (
                  <button
                    key={item.id}
                    onClick={() =>
                      document.getElementById(item.id)?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      })
                    }
                    className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                      activeSection === item.id
                        ? "bg-[#2AAAA0] text-white font-medium"
                        : "text-[#6B6B6B] hover:bg-[#2AAAA0]/10 hover:text-[#2AAAA0]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-6">
                <Link href="/guides">
                  <Button variant="outline" size="sm" className="w-full">
                    ← All Guides
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {/* Introduction */}
            <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
              <div className="flex flex-wrap gap-2 mb-4">
                {["powered wheelchair", "kitchen", "accessibility", "ADA compliant"].map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-[#e8f7f6] text-[#2AAAA0]"
                    variant="secondary"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-lg text-[#6B6B6B] mb-4">
                <strong className="text-[#2D2D2D]">Target Users:</strong> Seniors and people with disabilities using powered wheelchairs
              </p>
              <p className="text-[#6B6B6B]">
                <strong className="text-[#2D2D2D]">Core Value:</strong> Enable wheelchair users to cook, clean, and work independently and safely in the kitchen
              </p>
            </div>

            {/* Section 1: Assessment */}
            <section id="assessment" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#F5A623]">
                1. Pre-Renovation Assessment
              </h2>

              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">1.1 User Capability Assessment</h3>
              <p className="text-[#6B6B6B] mb-4">
                Before starting modifications, assess the user's abilities. This affects every decision from counter height to faucet type.
              </p>

              <ImagePlaceholder
                src="/Homeguide/Kitchen Accessibility/OT assessing a wheelchair user's upper body strength in a kitchen setting 根据这句话生成配图.png"
                alt="OT assessing a wheelchair user's upper body strength in a kitchen setting"
                caption="An occupational therapist assessing a user's capability to determine appropriate kitchen modifications."
              />

              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="bg-[#2AAAA0] text-white">
                    <th className="px-4 py-3 text-left">Assessment Area</th>
                    <th className="px-4 py-3 text-left">Key Question</th>
                    <th className="px-4 py-3 text-left">Design Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {[
                    ["Upper Body Strength", "Can you lift arms above shoulder height?", "Determines upper cabinet accessibility"],
                    ["Fine Motor Skills", "Can you use small knobs and switches?", "Affects faucet and appliance selection"],
                    ["Trunk Stability", "Can you lean forward safely?", "Determines counter depth requirements"],
                    ["Cognitive Ability", "Can you safely operate appliances?", "Affects smart device recommendations"],
                  ].map(([area, question, impact]) => (
                    <tr key={area} className="bg-white hover:bg-[#FAF8F5]">
                      <td className="px-4 py-3 font-medium text-[#2D2D2D]">{area}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{question}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3 mt-8">1.2 Kitchen Measurements</h3>
              <p className="text-[#6B6B6B] mb-4">
                Grab a laser measure and 25-foot tape measure. Measure and record these critical dimensions before buying anything:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {[
                  ["Doorway width", "________ inches"],
                  ["Doorway height", "________ inches"],
                  ["Floor to door handle", "________ inches"],
                  ["Current counter height", "________ inches"],
                  ["Under-counter clearance (knee space)", "________ inches"],
                  ["Turning diameter available", "________ inches"],
                  ["Stove type", "Gas / Electric / Induction"],
                  ["Sink type", "Single bowl / Double bowl — Size: ________"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[#F5A623] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#6B6B6B]">{label}</p>
                      <p className="text-sm font-medium text-[#2D2D2D]">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#2AAAA0]/5 border border-[#2AAAA0]/20 rounded-xl p-4">
                <p className="text-sm text-[#2AAAA0] font-medium mb-1">📏 Recommended Tools</p>
                <p className="text-sm text-[#6B6B6B]">
                  Laser measure (highest accuracy), 25-foot tape measure, RoomScan app (creates floor plans automatically)
                </p>
              </div>
            </section>

            {/* Section 2: Core Modifications */}
            <section id="doorways" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#F5A623]">
                2. Core Modification Points
              </h2>

              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">2.1 Doorways and Passages</h3>
              <p className="text-[#6B6B6B] mb-4">
                Doorway width is one of the most critical measurements. If a doorway is too narrow, the wheelchair simply cannot pass through.
              </p>

              <ImagePlaceholder
                src="/Homeguide/Kitchen Accessibility/Measuring a doorway for wheelchair accessibility.png"
                alt="Measuring a doorway for wheelchair accessibility"
                caption="Always measure the narrowest point of the doorway — the frame edge, not the opening width."
              />

              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="bg-[#2AAAA0] text-white">
                    <th className="px-4 py-3 text-left">Passage Type</th>
                    <th className="px-4 py-3 text-left">ADA Minimum</th>
                    <th className="px-4 py-3 text-left">Comfortable Width</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {[
                    ["Straight through doorway", "32 inches", "36–40 inches"],
                    ["90-degree turn", "60 inches", "64–72 inches"],
                    ["Wheelchair turnaround area", "60-inch diameter", "72-inch diameter"],
                  ].map(([type, ada, comfortable]) => (
                    <tr key={type} className="bg-white hover:bg-[#FAF8F5]">
                      <td className="px-4 py-3 font-medium text-[#2D2D2D]">{type}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{ada}</td>
                      <td className="px-4 py-3 text-[#F5A623] font-semibold">{comfortable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-4 mb-6">
                <p className="text-red-700 font-medium text-sm">
                  ⚠️ <strong>Safety Warning:</strong> Doorways narrower than 32 inches may prevent powered wheelchair access and can cause hand injuries.
                </p>
              </div>

              <h4 className="text-base font-semibold text-[#2D2D2D] mb-3">Three Ways to Widen a Doorway</h4>
              <div className="space-y-4 mb-8">
                {[
                  {
                    label: "Option A — Widen the Doorway",
                    tag: "Major Renovation",
                    cost: "$400–1,200",
                    desc: "Remove the existing door frame and expand to 36–40 inches. Consider installing a sliding or pocket door to save space.",
                  },
                  {
                    label: "Option B — Remove the Door",
                    tag: "Easy",
                    cost: "$10–30",
                    desc: "Remove the door leaf but keep the frame. Install a removable door later if privacy is needed.",
                  },
                  {
                    label: "Option C — Change the Swing Direction",
                    tag: "Easy",
                    cost: "$10–30",
                    desc: "Convert to an out-swing door or sliding door. Remove door stops and any obstacles.",
                  },
                ].map((opt) => (
                  <Card key={opt.label} className="overflow-hidden">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-[#2D2D2D]">{opt.label}</p>
                        <div className="flex gap-2">
                          <Badge className="bg-[#2AAAA0]/10 text-[#2AAAA0] text-xs">{opt.tag}</Badge>
                          <Badge className="bg-[#F5A623]/10 text-[#F5A623] text-xs">{opt.cost}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-[#6B6B6B]">{opt.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Counter Height */}
            <section id="counter" className="mb-12">
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">2.2 Counter Height</h3>
              <p className="text-[#6B6B6B] mb-4">
                Counter height is the most important factor in whether someone can work independently in the kitchen. The goal is to bring work surfaces within comfortable reach from a seated position.
              </p>

              <div className="bg-[#2AAAA0]/5 border border-[#2AAAA0]/20 rounded-xl p-5 mb-6">
                <p className="text-[#2AAAA0] font-semibold text-sm mb-2">💡 The Golden Rule</p>
                <p className="text-sm text-[#2D2D2D]">
                  <strong>Comfortable working height = your seated elbow height minus 3–5 inches.</strong><br />
                  For most adults: counter height of <strong>28–34 inches</strong> is ideal.
                </p>
              </div>

              <h4 className="text-base font-semibold text-[#2D2D2D] mb-3 mt-8">Powered Wheelchair Considerations</h4>
              <ul className="list-disc pl-6 text-[#6B6B6B] mb-4 space-y-1">
                <li>Footrest height typically adds 2–6 inches below the chair</li>
                <li>Joystick controller may protrude 4–6 inches in front</li>
                <li><strong>Knee clearance must be:</strong> at least 30" wide × 27" high × 19" deep (ADA 2010 standard)</li>
              </ul>

              <div className="grid md:grid-cols-3 gap-4 mt-6">
                {[
                  { label: "Lower Entire Counter", cost: "$1,200–2,200", tag: "Major" },
                  { label: "Lower a Section", cost: "$400–800", tag: "Medium" },
                  { label: "Add Adjustable Solutions", cost: "$45–220", tag: "Easy" },
                ].map((opt) => (
                  <Card key={opt.label} className="text-center">
                    <CardContent className="p-4">
                      <Badge
                        className={`mb-2 text-xs ${
                          opt.tag === "Major"
                            ? "bg-red-100 text-red-700"
                            : opt.tag === "Medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {opt.tag}
                      </Badge>
                      <p className="font-medium text-[#2D2D2D] text-sm">{opt.label}</p>
                      <p className="text-[#F5A623] font-semibold text-sm">{opt.cost}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Sink */}
            <section id="sink" className="mb-12">
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">2.3 The Sink</h3>
              <p className="text-[#6B6B6B] mb-4">
                The sink is one of the most frequently used areas in the kitchen — and one of the most commonly overlooked in accessibility modifications.
              </p>

              <ImagePlaceholder
                src="/Homeguide/Kitchen Accessibility/An accessible shallow single-bowl sink with lever faucet at wheelchair.png"
                alt="An accessible shallow single-bowl sink with lever faucet at wheelchair-accessible height"
                caption="A shallow single-bowl sink (5–6 inches deep) with a lever faucet at 10–12 inches height is the ideal accessible setup."
              />

              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="bg-[#2AAAA0] text-white">
                    <th className="px-4 py-3 text-left">Feature</th>
                    <th className="px-4 py-3 text-left">Minimum</th>
                    <th className="px-4 py-3 text-left">Ideal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {[
                    ["Sink depth", "6 inches or less", "5–6 inches"],
                    ["Faucet height", "10 inches", "10–12 inches"],
                    ["Faucet operation force", "5.5 lbs or less", "Lever or touchless"],
                    ["Drain position", "Rear or side wall", "Avoids knee collision"],
                  ].map(([f, min, ideal]) => (
                    <tr key={f} className="bg-white">
                      <td className="px-4 py-3 font-medium text-[#2D2D2D]">{f}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{min}</td>
                      <td className="px-4 py-3 text-[#2AAAA0] font-semibold">{ideal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 className="text-base font-semibold text-[#2D2D2D] mb-3">Key Sink Recommendations</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold text-[#2D2D2D] mb-1">🦷 Shallow Single-Bowl Sink</p>
                    <p className="text-sm text-[#6B6B6B]">5–6 inches deep. Single bowl allows pots to lay flat. Brands: Kohler Riverby/Strive, Moen, Delta.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold text-[#2D2D2D] mb-1">🚿 Lever or Touchless Faucet</p>
                    <p className="text-sm text-[#6B6B6B]">Single-handle lever (wrist operable) or touchless activation. Pull-down sprayer extends reach.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold text-[#2D2D2D] mb-1">🌡️ Anti-Scald Protection</p>
                    <p className="text-sm text-[#6B6B6B]">Thermostatic mixing valve. Hand-washing: 100–105°F. Users with reduced sensation: lower settings.</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold text-[#2D2D2D] mb-1">🪛 Under-Sink Modifications</p>
                    <p className="text-sm text-[#6B6B6B]">Remove cabinet floor for knee space. Insulate pipes. Relocate drain to rear/side wall.</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Cooktop */}
            <section id="cooktop" className="mb-12">
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">2.4 The Cooktop</h3>

              <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-4 mb-6">
                <p className="text-red-700 font-medium text-sm mb-2">⚠️ Critical Safety Warning</p>
                <p className="text-sm text-red-600">
                  Powered wheelchair users face elevated burn risks: feet cannot retract quickly, wheelchair materials may be flammable, and controller overheating is possible. <strong>Induction cooktops are strongly recommended over gas.</strong>
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-4 mb-6">
                <p className="text-yellow-700 font-medium text-sm mb-2">⚠️ Medical Device Warning</p>
                <p className="text-sm text-yellow-700">
                  Induction cooktops generate electromagnetic fields that may interfere with pacemakers or implanted cardiac defibrillators. Maintain at least 24 inches (60 cm) of distance. Consult your cardiologist first.
                </p>
              </div>

              <ImagePlaceholder
                src="/Homeguide/Kitchen Accessibility/Flat induction cooktop with front-mounted.jpg"
                alt="Flat induction cooktop with front-mounted controls at counter height — the safest choice for wheelchair users"
                caption="A flat induction cooktop with front-mounted controls sits flush with the counter, allowing close approach. The surface doesn't get hot, eliminating burn risk."
              />

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <Card className="border-[#F5A623]">
                  <CardContent className="p-4">
                    <p className="font-semibold text-[#2D2D2D] mb-1">🌀 Option A — Built-in Induction (Recommended)</p>
                    <p className="text-sm text-[#6B6B6B] mb-2">$220–600</p>
                    <p className="text-sm text-[#6B6B6B]">
                      Flat surface allows close wheelchair approach. Surface doesn't get hot. Timer prevents dry burning. Brands: GE Profile, Bosch, Whirlpool.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold text-[#2D2D2D] mb-1">🔌 Option B — Portable Induction</p>
                    <p className="text-sm text-[#6B6B6B] mb-2">$50–150</p>
                    <p className="text-sm text-[#6B6B6B]">
                      Best for renters or tight budgets. Place on a stable, low table at the right height.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <h4 className="text-base font-semibold text-[#2D2D2D] mb-3 mt-6">Safety Features Worth Having</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  ["Auto shut-off", "Cuts power when pan removed"],
                  ["Anti-dry burning", "Detects dry pan, auto-shuts off"],
                  ["Child lock", "Prevents accidental activation"],
                  ["Smoke detector link", "Detects smoke/overheating"],
                ].map(([name, desc]) => (
                  <div key={name} className="bg-white rounded-xl p-3 border border-[#E8E8E8] text-center">
                    <p className="font-medium text-[#2D2D2D] text-sm">{name}</p>
                    <p className="text-xs text-[#6B6B6B]">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Storage */}
            <section id="storage" className="mb-12">
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">2.5 Storage Systems</h3>
              <p className="text-[#6B6B6B] mb-4">
                Most kitchen storage is designed for standing users. Wall cabinets above 55 inches are completely unreachable from a seated position. Here's how to fix it.
              </p>

              <ImagePlaceholder
                src="/Homeguide/Kitchen Accessibility/Full-extension drawers at wheelchair-accessible height replacing swing-door base cabinets.png"
                alt="Full-extension drawers at wheelchair-accessible height replacing swing-door base cabinets"
                caption="Converting swing-door base cabinets to full-extension drawers is one of the best investments in an accessible kitchen. Everything is visible and within reach."
              />

              <div className="space-y-3 mt-4">
                {[
                  { label: "Option A — Drawer Base Cabinets", cost: "$220–600/linear ft", tag: "Recommended", desc: "Convert swing-door base cabinets to full-extension drawers. Organize by height: Low (12–24\"): heavy items. Mid (24–36\"): daily use — PRIMARY ZONE." },
                  { label: "Option B — Pull-Down Wall Cabinets", cost: "$120–300/unit", tag: "Rev-A-Shelf, Knape & Vogt", desc: "Keeps existing wall cabinets but adds an internal pull-down shelf. A light pull brings items to counter level." },
                  { label: "Option C — Open Wall Storage", cost: "$40–150", tag: "Easy", desc: "Install wall rod + hooks at 32–44 inches from floor. Magnetic knife strip at adjustable height. Open shelving 6–8 inches deep." },
                ].map((opt) => (
                  <Card key={opt.label}>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-[#2D2D2D]">{opt.label}</p>
                        <Badge className="bg-[#F5A623]/10 text-[#F5A623] text-xs">{opt.cost}</Badge>
                        {opt.tag === "Recommended" && <Badge className="bg-[#2AAAA0]/10 text-[#2AAAA0] text-xs">⭐ {opt.tag}</Badge>}
                      </div>
                      <p className="text-sm text-[#6B6B6B]">{opt.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Section 3: Plans */}
            <section id="plans" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#F5A623]">
                3. Choosing Your Renovation Plan
              </h2>

              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="bg-[#2D2D2D] text-white">
                    {["", "Easy", "Medium", "Major"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {[
                    ["Budget", "$140–445", "$1,200–2,500", "$5,000–15,000+"],
                    ["Timeline", "1–2 hours", "2–5 days", "2–6 weeks"],
                    ["What It Covers", "Assistive devices", "Counter and sink", "Full cabinetry overhaul"],
                    ["Best For", "Renters, short-term", "Homeowners, long-term", "New builds, deep needs"],
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

              <div className="grid md:grid-cols-3 gap-4 mt-6">
                {[
                  {
                    level: "Easy Plan",
                    color: "#4CAF50",
                    items: ["Electric standing desk / adjustable work surface ($45–120)", "Lever-handle faucet / faucet extender ($15–30)", "Portable induction cooktop ($50–150)", "Wall rod with hook set ($15–40)", "Rolling storage cart ($15–50)"],
                  },
                  {
                    level: "Medium Plan",
                    color: "#F5A623",
                    items: ["Section of counter lowered ($400–750)", "Shallow single-bowl sink + lever faucet ($150–350)", "Full-extension drawer installation ($300–700)", "Built-in induction cooktop ($200–450)", "Under-sink knee space modification ($100–180)"],
                  },
                  {
                    level: "Major Plan",
                    color: "#E53935",
                    items: ["Complete cabinet removal and custom rebuild ($3,000–8,000)", "Plumbing and electrical relocation ($800–2,000)", "Custom accessible sink system ($800–1,500)", "Motorized lift wall cabinet system ($1,500–3,000)", "Professional non-slip flooring ($1,000–2,500)"],
                  },
                ].map((plan) => (
                  <Card key={plan.level}>
                    <div className="h-1 rounded-t-xl" style={{ backgroundColor: plan.color }} />
                    <CardContent className="p-4">
                      <p className="font-bold text-[#2D2D2D] mb-3">{plan.level}</p>
                      <ul className="space-y-2">
                        {plan.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-[#6B6B6B]">
                            <span style={{ color: plan.color }}>✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Section 6: Cases */}
            <section id="cases" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#F5A623]">
                6. Real Stories
              </h2>

              {[
                {
                  name: "Sarah's Kitchen",
                  location: "Austin, Texas",
                  age: "68",
                  condition: "Rheumatoid arthritis, powered wheelchair user for 2 years",
                  budget: "$800",
                  before: ["Original counter at 36\" — required raising arms constantly", "Wall cabinets completely unreachable", "Sink depth 9\" — water splashed on her lap washing dishes"],
                  after: ["Lowered sink-area counter to 31\"", "Shallow 5.5\" single-bowl sink + lever faucet", "Removed cabinet floor under sink for knee clearance", "Converted base cabinets below cooktop to 3 full-extension drawers"],
                  quote: "I can cook my own meals again without waiting for my daughter to visit on weekends. The sink is the best part — I don't get soaked washing dishes anymore.",
                  img: "/Homeguide/Kitchen Accessibility/Sarah's Kitchen's accessible kitchen after renovation.jpg",
                },
              ].map((story) => (
                <Card key={story.name} className="overflow-hidden mb-6 border-t-4 border-[#2AAAA0]">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#2D2D2D] mb-1">{story.name}</h3>
                        <p className="text-sm text-[#6B6B6B] mb-3">{story.location} · {story.age} years old · {story.condition}</p>
                        <p className="text-sm font-semibold text-[#F5A623] mb-4">Budget: {story.budget}</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">Before</p>
                            <ul className="space-y-1">
                              {story.before.map((b) => (
                                <li key={b} className="text-sm text-[#6B6B6B] flex items-start gap-2">
                                  <span className="text-red-400">✗</span> {b}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">What Was Done</p>
                            <ul className="space-y-1">
                              {story.after.map((a) => (
                                <li key={a} className="text-sm text-[#6B6B6B] flex items-start gap-2">
                                  <span className="text-green-400">✓</span> {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <blockquote className="mt-4 bg-[#F5A623]/5 border-l-4 border-[#F5A623] rounded-r-lg p-4">
                          <p className="text-sm text-[#6B6B6B] italic">"{story.quote}"</p>
                        </blockquote>
                      </div>
                      <div className="md:w-64 flex-shrink-0">
                        <ImagePlaceholder
                          src={story.img}
                          alt={`${story.name}'s accessible kitchen after renovation`}
                          caption={`${story.name}'s kitchen after renovation — counter lowered, shallow sink installed, drawers added.`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>

            {/* Section 7: Checklist */}
            <section id="checklist" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#F5A623]">
                7. Final Checklist
              </h2>
              <p className="text-[#6B6B6B] mb-6">
                Once renovation is complete, verify each section:
              </p>

              {[
                {
                  title: "Doorways and Passages",
                  items: ["Doorway is at least 32 inches wide", "Turning diameter is at least 60 inches", "Floor is level with no trip hazards", "Door swing direction allows easy exit"],
                },
                {
                  title: "Counters",
                  items: ["Height allows comfortable work (elbow minus 3–5 inches)", "Knee clearance is at least 30\" wide × 27\" high × 19\" deep", "All counter edges are rounded — no sharp corners"],
                },
                {
                  title: "Sink",
                  items: ["Sink depth is 6 inches or less", "Faucet is lever-style or touchless", "Drain pipe does not block knee space", "Hot water has anti-scald protection"],
                },
                {
                  title: "Cooktop",
                  items: ["At least 6 inches of side clearance from wheelchair", "At least 19 inches of knee space in front", "Controls are front-mounted and accessible", "Auto shut-off and anti-dry-burn features present"],
                },
                {
                  title: "Safety",
                  items: ["Smoke detectors installed and working", "Fire extinguisher accessible from wheelchair height (24–48\")", "Emergency exit path is completely clear", "Floor is slip-resistant"],
                },
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

            {/* Section 8: Resources */}
            <section id="resources" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#F5A623]">
                8. Resources and References
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold text-[#2D2D2D] mb-3">📋 Regulations and Standards</p>
                    <ul className="space-y-2 text-sm text-[#6B6B6B]">
                      <li><a href="https://www.ada.gov/" className="text-[#2AAAA0] hover:underline">ADA Standards for Accessible Design</a></li>
                      <li><a href="https://www.iccsafe.org/" className="text-[#2AAAA0] hover:underline">ANSI A117.1 Accessible and Usable Buildings</a></li>
                      <li><a href="https://www.hud.gov/" className="text-[#2AAAA0] hover:underline">Fair Housing Act Accessibility Guidelines</a></li>
                      <li><a href="https://www.ncsu.edu/ncsu/design/cud/" className="text-[#2AAAA0] hover:underline">Universal Design Center — NC State University</a></li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold text-[#2D2D2D] mb-3">📚 Further Reading</p>
                    <ul className="space-y-2 text-sm text-[#6B6B6B]">
                      <li><em>Universal Design for the Home</em> by Wendy A. Jordan</li>
                      <li><em>Accessible America</em> by Bess Williamson</li>
                      <li><a href="https://www.aarp.org/livable-communities/info-2014/aarp-home-fit-guide.html" className="text-[#2AAAA0] hover:underline">AARP HomeFit Guide</a></li>
                      <li><a href="https://www.resna.org/" className="text-[#2AAAA0] hover:underline">Rehabilitation Engineering and Assistive Technology Society (RESNA)</a></li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Disclaimer */}
            <div className="bg-gradient-to-r from-[#F5A623]/10 to-[#2AAAA0]/10 rounded-2xl p-6 mt-8">
              <p className="text-sm text-[#6B6B6B]">
                💡 <strong>Before renovating, consult with a certified Aging-in-Place Specialist (CAPS)</strong> or an occupational therapist to ensure the plan fits your specific needs. A few hundred dollars spent on professional guidance often saves thousands in buying the wrong equipment.
              </p>
              <p className="text-xs text-[#6B6B6B] mt-3">
                <strong>Document Version:</strong> v1.2 · Last Updated: April 2026 · Review Status: Scientific review completed, pending clinical expert review
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
