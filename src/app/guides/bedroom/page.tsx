"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const tableOfContents = [
  { id: "assessment", label: "1. Pre-Renovation Assessment" },
  { id: "bed-height", label: "2.1 Bed Height" },
  { id: "clearance", label: "2.2 Bedside Clearance" },
  { id: "transfer", label: "2.3 Transfer Aids" },
  { id: "closet", label: "2.4 Closet & Storage" },
  { id: "nightstand", label: "2.5 Nightstand" },
  { id: "lighting", label: "2.6 Lighting" },
  { id: "emergency", label: "2.7 Emergency Response" },
  { id: "floor", label: "2.8 Floor Safety" },
  { id: "plans", label: "3. Renovation Plans" },
  { id: "safety", label: "5. Safety" },
  { id: "cases", label: "6. Real Stories" },
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

export default function BedroomGuidePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#2AAAA0] via-[#2AAAA0] to-[#259990] text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F5A623]/20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-5xl"></span>
              <Badge className="bg-white/20 text-white border-white/30">Bedroom Guide</Badge>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">Bedroom Accessibility</h1>
            <p className="text-xl text-white/90 mb-8">Powered Wheelchair Adaptation -- Complete Guide</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="bg-white/15 px-4 py-2 rounded-full"> ADA Standards</span>
              <span className="bg-white/15 px-4 py-2 rounded-full"> Budget: $45-$1,800</span>
              <span className="bg-white/15 px-4 py-2 rounded-full"> 1 hour - 1 week</span>
              <span className="bg-white/15 px-4 py-2 rounded-full"> Difficulty: Easy</span>
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
                    className="block w-full text-left text-sm px-3 py-2 rounded-lg text-[#6B6B6B] hover:bg-[#2AAAA0]/10 hover:text-[#2AAAA0] transition-all"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="mt-6">
                <Link href="/guides">
                  <Button variant="outline" size="sm" className="w-full"> All Guides</Button>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {/* Intro */}
            <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
              <div className="flex flex-wrap gap-2 mb-4">
                {["powered wheelchair", "bedroom", "accessibility", "bed height", "emergency response"].map((tag) => (
                  <Badge key={tag} className="bg-[#e8f7f6] text-[#2AAAA0]" variant="secondary">{tag}</Badge>
                ))}
              </div>
              <p className="text-lg text-[#6B6B6B] mb-3">
                <strong className="text-[#2D2D2D]">Target Users:</strong> Seniors and people with disabilities who use powered wheelchairs
              </p>
              <p className="text-[#6B6B6B]">
                <strong className="text-[#2D2D2D]">Core Value:</strong> Enable wheelchair users to get in and out of bed safely, manage nighttime routines independently, and move through their bedroom with confidence.
              </p>
            </div>

            {/* Section 1 */}
            <section id="assessment" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#2AAAA0]">
                1. Pre-Renovation Assessment
              </h2>

              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">1.1 Transfer Capability Assessment</h3>
              <p className="text-[#6B6B6B] mb-4">
                The heart of bedroom accessibility is the safe transfer between bed and wheelchair. Before choosing a plan, assess the user's transfer ability.
              </p>

              <ImagePlaceholder
                src="/Homeguide/Bedroom Accessibility/Occupational therapist assessing a wheelchair user's bed transfer capability.jpg"
                alt="Occupational therapist assessing a wheelchair user's bed transfer capability"
                caption="An OT assessment determines whether a user needs equipment-assisted transfers, caregiver help, or can transfer independently."
              />

              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="bg-[#2AAAA0] text-white">
                    <th className="px-4 py-3 text-left">Assessment Area</th>
                    <th className="px-4 py-3 text-left">Standard Question</th>
                    <th className="px-4 py-3 text-left">Your Situation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {[
                    ["Upper Body Strength", "Can you lift your body weight using your arms to push up?", " Fully able  Partially  Not able"],
                    ["Trunk Control", "Can you maintain sitting balance independently?", " Fully able  Needs support  Not able"],
                    ["Transfer Aids Needed", "Do you need equipment or assistance to transfer?", " None  Equipment needed  Caregiver needed"],
                    ["Nighttime Routines", "Can you get up independently at night to use the bathroom?", " Fully able  Some assistance  Full assistance needed"],
                  ].map(([area, question, situation]) => (
                    <tr key={area} className="bg-white hover:bg-[#FAF8F5]">
                      <td className="px-4 py-3 font-medium text-[#2D2D2D]">{area}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{question}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{situation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3 mt-8">1.2 Bedroom Measurements</h3>
              <div className="grid md:grid-cols-2 gap-3 mb-4">
                {[
                  ["Bedroom floor area", "________ sq ft"],
                  ["Bed size", "Single (38 inches) / Queen (60 inches) / King (76 inches)"],
                  ["Bed surface height (floor to top of mattress)", "________ inches"],
                  ["Wheelchair seat height", "________ inches"],
                  ["Clear width on each side of bed", "Left ________in / Right ________in"],
                  ["Clear space at foot of bed", "________ inches"],
                  ["Doorway width", "________ inches"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[#2AAAA0] flex-shrink-0" />
                    <div>
                      <p className="text-xs text-[#6B6B6B]">{label}</p>
                      <p className="text-sm font-medium text-[#2D2D2D]">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2: Bed Height */}
            <section id="bed-height" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#2AAAA0]">
                2. Core Modification Points
              </h2>

              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">2.1 Bed Height -- The Most Critical Factor</h3>
              <p className="text-[#6B6B6B] mb-4">
                Bed height directly determines transfer safety, how much effort is needed to get out of bed, and how easily you can get dressed from a seated position.
              </p>

              
              <div className="bg-[#2AAAA0]/5 border border-[#2AAAA0]/20 rounded-xl p-5 mb-6">
                <p className="text-[#2AAAA0] font-semibold text-sm mb-2">[tip] The Golden Rule</p>
                <p className="text-sm text-[#2D2D2D]">
                  <strong>Ideal bed height = wheelchair seat height  0-1 inch.</strong><br />
                  For most powered wheelchair users, the target is <strong>17-19 inches</strong> from floor to top of mattress.
                </p>
              </div>

              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="bg-[#2AAAA0] text-white">
                    <th className="px-4 py-3 text-left">User Situation</th>
                    <th className="px-4 py-3 text-left">Recommended Adjustment</th>
                    <th className="px-4 py-3 text-left">Why</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {[
                    ["Weak lower body strength", "Set bed 1-2 incheshigher than wheelchair", "Makes it easier to slide/scoot into the wheelchair"],
                    ["Weak upper body strength", "Set bed height equal to wheelchair", "Minimizes the push-up force needed to stand"],
                    ["Falls risk / confusion", "Keep bed at 15-16 inchesor lower", "Reduces injury risk if user rolls out of bed"],
                  ].map(([situation, adjustment, why]) => (
                    <tr key={situation} className="bg-white">
                      <td className="px-4 py-3 font-medium text-[#2D2D2D]">{situation}</td>
                      <td className="px-4 py-3 text-[#F5A623] font-semibold">{adjustment}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 className="text-base font-semibold text-[#2D2D2D] mb-3">Three Ways to Adjust Bed Height</h4>
              <div className="space-y-3">
                {[
                  { label: "Option A -- Replace the Bed Frame or Mattress", tag: "Medium  $200-800", desc: "Choose an adjustable-height bed frame. Electric adjustable beds (Lucid L300, Tempur-Pedic Ease): $400-800. Hospital-style bed (Drive Medical): $800-1,500." },
                  { label: "Option B -- Raise or Lower an Existing Bed", tag: "Easy  $10-50", desc: "To lower: remove storage drawers, use a thinner mattress (6-8 inches). To raise: install bed risers (Home-it Bed Risers, $15-30 on Amazon) under the bed frame legs." },
                  { label: "Option C -- Professional Care Bed", tag: "Major  $800-1,800", desc: "Full electric height adjustment, removable side rails, lockable casters. Best for users with significant care needs or pressure sore risk." },
                ].map((opt) => (
                  <Card key={opt.label}>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-[#2D2D2D]">{opt.label}</p>
                        <Badge className="bg-[#2AAAA0]/10 text-[#2AAAA0] text-xs">{opt.tag}</Badge>
                      </div>
                      <p className="text-sm text-[#6B6B6B]">{opt.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Clearance */}
            <section id="clearance" className="mb-12">
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">2.2 Bedside Clearance Space</h3>
              <p className="text-[#6B6B6B] mb-4">
                Every bed needs adequate clearance around it for the wheelchair to approach, transfer, and leave safely.
              </p>

              <ImagePlaceholder
                src="/Homeguide/Bedroom Accessibility/Diagram showing minimum bedroom clearance dimensions for wheelchair access.jpg"
                alt="Diagram showing minimum bedroom clearance dimensions for wheelchair access"
                caption="Bedroom accessibility requires clear space on at least one side (32-inch minimum), 48-inch at the foot for approach, and 60-inch turning diameter."
              />

              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="bg-[#2AAAA0] text-white">
                    <th className="px-4 py-3 text-left">Space Type</th>
                    <th className="px-4 py-3 text-left">Minimum</th>
                    <th className="px-4 py-3 text-left">Comfortable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {[
                    ["Bedside clearance (one side)", "32 inches (80cm)", "40-48 inches (100-120cm)"],
                    ["Foot of bed clearance", "48 inches (120cm)", "60 inches (150cm)"],
                    ["Turn diameter", "60 inches (150cm)", "72 inches (180cm)"],
                    ["Doorway", "32 inches (80cm)", "36+ inches (90cm+)"],
                  ].map(([type, min, comfortable]) => (
                    <tr key={type} className="bg-white">
                      <td className="px-4 py-3 font-medium text-[#2D2D2D]">{type}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{min}</td>
                      <td className="px-4 py-3 text-[#2AAAA0] font-semibold">{comfortable}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="bg-red-50 border-l-4 border-red-400 rounded-r-xl p-4 mb-4">
                <p className="text-red-700 font-medium text-sm">
                  [!] If bedside clearance is less than 32 inches, transfers become unsafe -- the wheelchair cannot position close enough for a stable transfer.
                </p>
              </div>
            </section>

            {/* Transfer Aids */}
            <section id="transfer" className="mb-12">
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">2.3 Getting In and Out of Bed -- Transfer Aids</h3>

              <h4 className="text-base font-medium text-[#2D2D2D] mb-2">Bed Rails</h4>
              <p className="text-[#6B6B6B] mb-4">
                A bed rail prevents rolling out of bed at night, provides a handhold to push up from lying, and helps reposition during sleep.
              </p>

              
              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="bg-[#2AAAA0] text-white">
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Pros</th>
                    <th className="px-4 py-3 text-left">Cons</th>
                    <th className="px-4 py-3 text-left">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {[
                    ["Fold-Down Rail", "Folds down when not needed", "Weaker support", "$40-100"],
                    ["Fixed Rail", "Very stable, strong support", "Takes up space", "$60-150"],
                    ["Smart Sensing Rail", "Auto-raises/lowers, can link to alerts", "Expensive, needs power", "$200-500"],
                  ].map(([type, pros, cons, price]) => (
                    <tr key={type} className="bg-white">
                      <td className="px-4 py-3 font-medium text-[#2D2D2D]">{type}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{pros}</td>
                      <td className="px-4 py-3 text-[#6B6B6B]">{cons}</td>
                      <td className="px-4 py-3 text-[#F5A623] font-semibold">{price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 className="text-base font-medium text-[#2D2D2D] mb-2 mt-6">Transfer Boards</h4>
              <p className="text-[#6B6B6B] mb-3">
                A transfer board bridges the gap between bed and wheelchair, allowing a scooting transfer rather than a lifting transfer. This dramatically reduces the strength required.
              </p>
              <div className="bg-[#2AAAA0]/5 border border-[#2AAAA0]/20 rounded-xl p-4 mb-4">
                <p className="text-sm text-[#2D2D2D]">
                  <strong>How to use:</strong> Angle wheelchair ~30 beside bed (brakes locked). Place board one end on bed, one end on wheelchair seat. Push body weight along the board. Works best when height difference is 1 inch or less.
                </p>
              </div>
              <p className="text-sm text-[#6B6B6B]">Recommended: Sammons Preston Transfer Board ($30-80)  SmarketSale Wooden ($20-50)</p>
            </section>

            {/* Closet */}
            <section id="closet" className="mb-12">
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">2.4 Closet and Storage</h3>
              <p className="text-[#6B6B6B] mb-4">
                Most closets are built for standing-height access. Hanging rods above 55" are unreachable from a seated position.
              </p>

              <ImagePlaceholder
                src="/Homeguide/Bedroom Accessibility/Closet with lowered hanging rods at 44 and 52 inches, and full-extension drawers at the bottom for wheelchair-accessible storage.jpg"
                alt="Closet with lowered hanging rods at 44 and 52 inches, and full-extension drawers at the bottom for wheelchair-accessible storage"
                caption="The primary zone for wheelchair-accessible closets is 38-52 inches from the floor -- where daily-use items should always be stored."
              />

              <h4 className="text-base font-medium text-[#2D2D2D] mb-3">Four Ways to Make a Closet Accessible</h4>
              <div className="space-y-3">
                {[
                  { label: "Option A -- Install Sliding Doors", tag: "Medium  $300-800", desc: "Replace standard swing doors with IKEA PAX bypass sliding doors -- eliminates the 32+ inch door swing space needed." },
                  { label: "Option B -- Lower the Hanging Rods", tag: "Easy  $15-50", desc: "The single highest-impact, lowest-cost change. Reinstall upper rod at 52 inchesand lower rod at 38-44 inches from the floor -- primary zone for wheelchair access." },
                  { label: "Option C -- Drawer-Based Storage", tag: "Recommended  $150-600", desc: "Convert the bottom half of hanging storage to full-extension drawers (IKEA KOMPLEMENT). Everything is visible and reachable from a seated position." },
                  { label: "Option D -- Open Wardrobe System", tag: "Easy  $100-400", desc: "Remove cabinet doors entirely. Open hanging rods at 40-48 inches from floor, clear storage bins. Best for renters on a budget." },
                ].map((opt) => (
                  <Card key={opt.label}>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-[#2D2D2D]">{opt.label}</p>
                        <Badge className="bg-[#F5A623]/10 text-[#F5A623] text-xs">{opt.tag}</Badge>
                        {opt.tag.includes("Recommended") && <Badge className="bg-[#2AAAA0]/10 text-[#2AAAA0] text-xs"> Recommended</Badge>}
                      </div>
                      <p className="text-sm text-[#6B6B6B]">{opt.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Lighting */}
            <section id="lighting" className="mb-12">
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">2.6 Lighting Systems</h3>
              <p className="text-[#6B6B6B] mb-4">
                Standard wall switch height (48-52") is above the seated reach range for most wheelchair users. Night lighting is essential for nighttime safety.
              </p>

              
              <div className="grid md:grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Lower the Switch", cost: "$0-50", desc: "An electrician relocates the switch to 36-40 inchesfrom the floor." },
                  { label: "Add a Remote Switch", cost: "$20-60", desc: "Keep original switch. Add a battery-powered remote (Kasa, RunLessWire) that sits on the nightstand." },
                  { label: "Smart Lighting System", cost: "$100-400", desc: "Replace with Kasa Smart Switch + smart bulbs. Control by voice, phone app, or bedside remote." },
                ].map((opt) => (
                  <Card key={opt.label}>
                    <CardContent className="p-4 text-center">
                      <p className="font-medium text-[#2D2D2D] text-sm">{opt.label}</p>
                      <p className="text-[#F5A623] font-semibold text-sm">{opt.cost}</p>
                      <p className="text-xs text-[#6B6B6B] mt-1">{opt.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <h4 className="text-base font-medium text-[#2D2D2D] mb-3">Must-Light Areas at Night</h4>
              <div className="flex flex-wrap gap-2">
                {["Bedroom floor (path from bed to door)", "Hallway to bathroom", "Closet interior (for getting dressed)"].map((area) => (
                  <Badge key={area} className="bg-[#F5A623]/10 text-[#F5A623] px-3 py-2 text-sm">{area}</Badge>
                ))}
              </div>
            </section>

            {/* Emergency */}
            <section id="emergency" className="mb-12">
              <h3 className="text-lg font-semibold text-[#2D2D2D] mb-3">2.7 Emergency Response Systems</h3>
              <p className="text-[#6B6B6B] mb-4">
                Most nighttime medical emergencies happen in the bedroom. If alone, a working emergency response system is critical.
              </p>

              <div className="space-y-3">
                {[
                  { label: "Option A -- Pull-Cord or Wall Button", cost: "$15-50/mo monitoring", desc: "Mount beside bed headboard (reachable while lying down) and in the bathroom. Services: Life Alert ($30-50/mo), Medical Guardian ($25-45/mo), Bay Alarm Medical ($20-30/mo)." },
                  { label: "Option B -- Smart Watch / Medical Alert Wearable", cost: "$30-300 device + $10-30/mo", desc: "Apple Watch has automatic fall detection + SOS. For dedicated medical alert: MobileHelp Smart Watch or Medical Guardian Freedom Watch." },
                  { label: "Option C -- Smart Speaker Voice Commands", cost: "~$50-150", desc: "Place on nightstand. Say: Hey Siri call 911 or Alexa call emergency services. Requires internet and clear speech.", },
                ].map((opt) => (
                  <Card key={opt.label}>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-[#2D2D2D]">{opt.label}</p>
                        <Badge className="bg-[#2AAAA0]/10 text-[#2AAAA0] text-xs">{opt.cost}</Badge>
                      </div>
                      <p className="text-sm text-[#6B6B6B]">{opt.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Section 3: Plans */}
            <section id="plans" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#2AAAA0]">
                3. Renovation Plan Overview
              </h2>

              <table className="w-full mb-6 text-sm">
                <thead>
                  <tr className="bg-[#2D2D2D] text-white">
                    {["", "Easy", "Medium", "Major"].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E8E8]">
                  {[
                    ["Budget", "$45-300", "$300-1,200", "$1,200-1,800+"],
                    ["Time", "1-3 hours", "1-2 days", "3-7 days"],
                    ["Best For", "Renters, minor needs", "Long-term homeowners", "Full-time care needs"],
                    ["Independence", "", "", ""],
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
                  { level: "Easy Plan", color: "#4CAF50", items: ["Bed risers ($15-30)", "Single-side bed rail ($40-100)", "Transfer board ($25-80)", "Motion-sensor night lights  3 ($20-50)", "C-shaped side table ($40-100)"] },
                  { level: "Medium Plan", color: "#F5A623", items: ["Adjustable bed frame ($200-600)", "Closet sliding doors ($200-500)", "Smart lighting system ($100-300)", "Full-extension drawers ($100-300)", "Medical alert system ($20-50/mo)"] },
                  { level: "Major Plan", color: "#E53935", items: ["Electric hospital bed ($800-1,500)", "Custom sliding-door closet ($500-1,000)", "Full smart home integration ($300-600)", "Non-slip flooring ($500-1,500)", "Ceiling-mounted patient lift ($1,500-3,000)"] },
                ].map((plan) => (
                  <Card key={plan.level}>
                    <div className="h-1 rounded-t-xl" style={{ backgroundColor: plan.color }} />
                    <CardContent className="p-4">
                      <p className="font-bold text-[#2D2D2D] mb-3">{plan.level}</p>
                      <ul className="space-y-2">
                        {plan.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-[#6B6B6B]">
                            <span style={{ color: plan.color }}>[ok]</span> {item}
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
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#2AAAA0]">
                5. Safety Considerations
              </h2>

              <div className="space-y-6">
                {[
                  {
                    title: "5.1 Transfer Safety",
                    color: "#2AAAA0",
                    items: [
                      ["Lock wheelchair brakes before attempting any transfer", true],
                      ["Bed-to-wheelchair height difference should be no more than 1-2 inches", true],
                      ["Keep your body low and centered during transfer", true],
                      ["Practice using a transfer board with a caregiver present first", true],
                      ["Never stand on the wheelchair footrest platform during transfer", false],
                      ["Don't lean excessively forward during transfer", false],
                    ],
                  },
                  {
                    title: "5.2 Bed Rail Safety",
                    color: "#F5A623",
                    items: [
                      ["Check the gap between rail and mattress -- must be 3 inches or less", true],
                      ["Inspect all bolts and connections monthly", true],
                      ["Lower the rail during the day if it interferes with transfers", true],
                      ["Never use the bed rail to pull full body weight -- it's for stability, not hoisting", false],
                    ],
                  },
                  {
                    title: "5.3 Nighttime Safety",
                    color: "#2AAAA0",
                    items: [
                      ["Keep night lights on at all times", true],
                      ["Non-slip slippers beside the bed, put them on before standing", true],
                      ["Keep the path from bed to bathroom completely clear at all times", true],
                      ["Keep emergency response device within arm's reach of the bed", true],
                      ["Don't take sleep medication and attempt to get up unassisted", false],
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
                            <div key={idx} className={`flex items-start gap-3 text-sm ${good ? "text-[#6B6B6B]" : "text-red-500"}`}>
                              <span className={good ? "text-green-500" : "text-red-400"}>{good ? "[OK]" : "[X]"}</span>
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
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#2AAAA0]">
                6. Real Stories
              </h2>

              {[
                {
                  name: "Barbara's Bedroom",
                  location: "Austin, Texas",
                  age: "72",
                  condition: "Post-stroke, powered wheelchair user for 18 months",
                  budget: "$130",
                  img: "/Homeguide/Bedroom Accessibility/Barbara's Bedroom's accessible bedroom after renovation.jpg",
                  quote: "I used to have to wait for my daughter to come over just to get into bed at night. Now I do it myself, and I don't wake her up anymore. The motion light in the hallway turned out to be the most important thing we did.",
                  changes: [
                    "Added 3 inchesbed risers to raise bed from 22 inchesto 21 inches(matching wheelchair)",
                    "Installed a single-sided bed rail to assist with pushing up",
                    "Added 3 motion-sensor night lights (bedside, hallway, bathroom)",
                    "Replaced low nightstand with a C-shaped side table",
                  ],
                },
                {
                  name: "Robert's Full Renovation",
                  location: "Phoenix, Arizona",
                  age: "68",
                  condition: "Multiple sclerosis, powered wheelchair user for 4 years",
                  budget: "$720",
                  img: "/Homeguide/Bedroom Accessibility/Robert's Full Renovation's accessible bedroom after renovation.jpg",
                  quote: "The adjustable bed frame was worth every penny -- the ability to fine-tune the height with a remote means I can always maintain the perfect transfer height.",
                  changes: [
                    "Lucid L300 adjustable bed frame at exactly 18 inches(matching wheelchair)",
                    "IKEA PAX closet with bypass sliding doors",
                    "Lowered hanging rods to 44 inchesand 52 inches, added KOMPLEMENT drawers",
                    "Full Philips Hue smart lighting system (voice-controlled from bed)",
                    "Bay Alarm Medical alert system",
                  ],
                },
              ].map((story) => (
                <Card key={story.name} className="overflow-hidden mb-6 border-t-4 border-[#2AAAA0]">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#2D2D2D] mb-1">{story.name}</h3>
                        <p className="text-sm text-[#6B6B6B] mb-2">{story.location}  {story.age} years old  {story.condition}</p>
                        <p className="text-sm font-semibold text-[#F5A623] mb-4">Budget: {story.budget}</p>
                        <div className="space-y-2 mb-4">
                          {story.changes.map((change) => (
                            <div key={change} className="flex items-start gap-2 text-sm text-[#6B6B6B]">
                              <span className="text-[#2AAAA0]">[ok]</span> {change}
                            </div>
                          ))}
                        </div>
                        <blockquote className="bg-[#2AAAA0]/5 border-l-4 border-[#2AAAA0] rounded-r-lg p-4">
                          <p className="text-sm text-[#6B6B6B] italic">"{story.quote}"</p>
                        </blockquote>
                      </div>
                      <div className="md:w-64 flex-shrink-0">
                        <ImagePlaceholder
                          src={story.img}
                          alt={`${story.name}'s accessible bedroom after renovation`}
                          caption={`${story.name}'s bedroom -- accessible bed height, C-table, and motion night lights.`}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>

            {/* Checklist */}
            <section id="checklist" className="mb-12">
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#2AAAA0]">
                7. Final Checklist
              </h2>

              {[
                { title: "Bed Height and Transfers", items: ["Height difference between bed and wheelchair is 2 inches or less", "Can complete bed-to-wheelchair transfer independently", "Bed rail gap to mattress is 3 inches or less", "At least 32 inches clear on one side of the bed"] },
                { title: "Lighting", items: ["Switch reachable at 36-40 inchesor controlled by remote/voice", "Motion night lights active at bedside, hallway, bathroom entrance", "Emergency response device within arm's reach of the bed"] },
                { title: "Storage and Closet", items: ["Daily-use clothing is in the 38-52 inchesreach zone", "Closet doors don't swing into the transfer zone", "Drawers open fully without hitting the wheelchair"] },
                { title: "Safety", items: ["Floor is free of trip hazards in the transfer zone", "Anti-slip treatment or mat at the bedside standing area", "Emergency response device is within reach of the bed", "Path from bed to bathroom is completely clear"] },
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
              <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6 pb-2 border-b-2 border-[#2AAAA0]">
                8. Resources
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold text-[#2D2D2D] mb-3"> Regulations and Standards</p>
                    <ul className="space-y-2 text-sm text-[#6B6B6B]">
                      <li><a href="https://www.ada.gov/" className="text-[#2AAAA0] hover:underline">ADA Standards for Accessible Design</a></li>
                      <li><a href="https://www.iccsafe.org/" className="text-[#2AAAA0] hover:underline">ANSI A117.1 Accessible and Usable Buildings</a></li>
                      <li><a href="https://www.ncsu.edu/ncsu/design/cud/" className="text-[#2AAAA0] hover:underline">Universal Design Center -- NC State</a></li>
                      <li><a href="https://www.resna.org/" className="text-[#2AAAA0] hover:underline">RESNA</a></li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="font-semibold text-[#2D2D2D] mb-3"> Further Reading</p>
                    <ul className="space-y-2 text-sm text-[#6B6B6B]">
                      <li><em>Universal Design for the Home</em> by Wendy A. Jordan</li>
                      <li><em>Accessible America</em> by Bess Williamson</li>
                      <li><a href="https://www.aarp.org/livable-communities/info-2014/aarp-home-fit-guide.html" className="text-[#2AAAA0] hover:underline">AARP HomeFit Guide</a></li>
                      <li><a href="https://www.caregiver.org/" className="text-[#2AAAA0] hover:underline">Family Caregiver Alliance</a></li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Disclaimer */}
            <div className="bg-gradient-to-r from-[#F5A623]/10 to-[#2AAAA0]/10 rounded-2xl p-6 mt-8">
              <p className="text-sm text-[#6B6B6B]">
                [tip] <strong>Before starting any renovation, consult with an occupational therapist or physical therapist</strong> -- they can assess your specific transfer needs and recommend the right equipment and bed height. A few hundred dollars on professional guidance often saves thousands buying wrong equipment.
              </p>
              <p className="text-xs text-[#6B6B6B] mt-3">
                <strong>Document Version:</strong> v1.0  Last Updated: April 2026  Review Status: Awaiting expert review
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
