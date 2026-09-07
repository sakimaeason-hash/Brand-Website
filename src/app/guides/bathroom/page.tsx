"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const tableOfContents = [
  ["assessment", "1. Start With the User"],
  ["layout", "2. Space & Doorway"],
  ["toilet", "3. Toilet Transfers"],
  ["bathing", "4. Shower & Bathing"],
  ["vanity", "5. Sink & Storage"],
  ["plans", "6. Renovation Plans"],
  ["sequence", "7. Project Sequence"],
  ["safety", "8. Safety Checks"],
  ["checklist", "9. Final Checklist"],
  ["resources", "10. Resources"],
];

const benchmarks = [
  ["Clear floor space", '30" × 48"', "At fixtures, controls, and storage"],
  ["Turning space", '60" diameter', "Or a compliant T-shaped turning space"],
  ["Toilet seat height", '17"–19"', "Confirm against the user’s transfer height"],
  ["Roll-in shower", '60" × 30"', "Common minimum planning benchmark"],
  ["Door clear width", '32" minimum', 'A 36" door is often more comfortable'],
  ["Reach range", '15"–48"', "Keep daily items in comfortable seated reach"],
];

const assessmentCards = [
  [
    "Transfer method",
    "Document whether transfers are lateral, standing-pivot, sliding-board, lift-assisted, or caregiver-assisted—and from which side.",
  ],
  [
    "Wheelchair footprint",
    "Measure total width, length, seat height, footplate position, turning behavior, and whether the chair tilts or reclines.",
  ],
  [
    "Caregiver space",
    "Mark where a helper must stand and whether one-person, two-person, mobile-lift, or ceiling-lift assistance may be needed.",
  ],
  [
    "Daily routine",
    "Review bathing, toileting, grooming, medication, nighttime use, fatigue, and emergency communication.",
  ],
];

const planOptions = [
  {
    level: "Quick Safety Upgrade",
    budget: "$150–$700",
    time: "1–2 days",
    color: "#4A9B6F",
    bestFor: "Renters or a bathroom that already has usable circulation.",
    items: [
      "Structurally anchored grab bars",
      "Slip-resistant route and bathing surfaces",
      "Handheld shower on an adjustable slide bar",
      "Lever faucet, brighter lighting, and reachable storage",
      "Transfer-height review before adding a toilet riser",
    ],
  },
  {
    level: "Targeted Remodel",
    budget: "$1,500–$7,500",
    time: "3–10 days",
    color: "#F5A623",
    bestFor: "Removing one major barrier without rebuilding the whole room.",
    items: [
      "Door reversal, pocket door, or wider doorway",
      "Tub cut or low-threshold shower conversion",
      "Wall reinforcement for current and future supports",
      "Open-knee vanity or wall-mounted sink",
      "New flooring, drainage, and relocated accessories",
    ],
  },
  {
    level: "Full Accessible Bathroom",
    budget: "$8,000–$35,000+",
    time: "3–6 weeks",
    color: "#E07A5F",
    bestFor: "Long-term independence, caregiver access, or major space limits.",
    items: [
      "Reconfigured walls and a continuous step-free route",
      "Curbless roll-in shower with engineered drainage",
      "Transfer-compatible toilet zone and structural blocking",
      "Wheelchair-friendly vanity, mirror, controls, and storage",
      "Ventilation, emergency access, and future-ready electrical work",
    ],
  },
];

const checklistGroups = [
  {
    title: "Route and Space",
    items: [
      "The route has no step, loose threshold, or unsecured mat.",
      "The doorway and approach work with the actual wheelchair.",
      "There is room to turn, reposition, and close the door.",
      "The door can be released or opened from outside in an emergency.",
    ],
  },
  {
    title: "Toilet",
    items: [
      "Seat height supports the preferred transfer technique.",
      "Transfer space is free of cabinets, bins, and radiators.",
      "Grab bars are anchored into structural blocking or an approved system.",
      "Flush, paper, and hygiene controls remain reachable after transfer.",
    ],
  },
  {
    title: "Bathing",
    items: [
      "The entry is step-free or uses the lowest safe threshold possible.",
      "Drainage keeps water out of the wheelchair route.",
      "Seat, controls, and handheld shower work without standing.",
      "A dry transfer and dressing zone is available.",
    ],
  },
  {
    title: "Daily Safety",
    items: [
      "The floor remains slip resistant when wet.",
      "Daily items stay within seated reach.",
      "Lighting covers the route, toilet, shower, and vanity without glare.",
      "Ventilation, GFCI protection, and emergency communication are in place.",
    ],
  },
];

function SectionHeading({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-6 border-b-2 border-[#2AAAA0] pb-3">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#2AAAA0]">
        Section {number}
      </p>
      <h2 className="text-2xl font-bold text-[#2D2D2D]">{children}</h2>
    </div>
  );
}

function Note({
  title,
  children,
  warning = false,
}: {
  title: string;
  children: ReactNode;
  warning?: boolean;
}) {
  return (
    <div
      className={
        "mb-6 rounded-xl border p-5 " +
        (warning
          ? "border-[#F5A623]/30 bg-[#F5A623]/10"
          : "border-[#2AAAA0]/25 bg-[#2AAAA0]/5")
      }
    >
      <p
        className={
          "mb-2 text-sm font-bold " +
          (warning ? "text-[#7A5815]" : "text-[#236F69]")
        }
      >
        {title}
      </p>
      <div className="text-sm leading-6 text-[#4A4A4A]">{children}</div>
    </div>
  );
}

function GuideImage({
  src,
  alt,
  caption,
  position = "center",
}: {
  src: string;
  alt: string;
  caption: string;
  position?: "center" | "top";
}) {
  return (
    <figure className="my-8">
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-[#E8E8E8] shadow-sm">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 896px, (min-width: 1024px) calc(100vw - 400px), 100vw"
          className={
            "object-cover " +
            (position === "top" ? "object-top" : "object-center")
          }
        />
      </div>
      <figcaption className="mx-auto mt-3 max-w-3xl text-center text-sm italic leading-6 text-[#6B6B6B]">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function BathroomGuidePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#2AAAA0] via-[#248F88] to-[#1B6965] text-white">
        <div className="absolute -right-24 -top-28 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-[#F5A623]/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-4xl">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="text-4xl" aria-hidden="true">♿</span>
              <Badge className="border-white/30 bg-white/15 text-white">
                Bathroom Guide
              </Badge>
              <Badge className="border-white/30 bg-white/15 text-white">
                New
              </Badge>
            </div>
            <h1 className="mb-5 text-4xl font-bold tracking-tight lg:text-6xl">
              Bathroom Accessibility
            </h1>
            <p className="mb-8 max-w-3xl text-xl leading-relaxed text-white/90">
              A practical plan for safer transfers, step-free bathing,
              reachable fixtures, and greater everyday independence.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-white/15 px-4 py-2">
                Residential planning guide
              </span>
              <span className="rounded-full bg-white/15 px-4 py-2">
                Budget: $150–$35,000+
              </span>
              <span className="rounded-full bg-white/15 px-4 py-2">
                1 day–6 weeks
              </span>
              <span className="rounded-full bg-white/15 px-4 py-2">
                Powered wheelchair focused
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row">
          <aside className="flex-shrink-0 lg:w-64">
            <div className="lg:sticky lg:top-24">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#6B6B6B]">
                Table of Contents
              </p>
              <nav aria-label="Bathroom guide sections" className="space-y-1">
                {tableOfContents.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      document
                        .getElementById(id)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#6B6B6B] transition-colors hover:bg-[#2AAAA0]/10 hover:text-[#236F69] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2AAAA0]"
                  >
                    {label}
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

          <article className="min-w-0 flex-1">
            <div className="mb-10 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  "bathroom",
                  "wheelchair access",
                  "safe transfers",
                  "roll-in shower",
                  "aging in place",
                ].map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-[#E8F7F6] text-[#236F69]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="mb-3 text-lg leading-relaxed text-[#4A4A4A]">
                A bathroom is only truly accessible when the route, transfer
                direction, fixtures, controls, and caregiver space work together
                for one specific user.
              </p>
              <p className="text-sm leading-6 text-[#6B6B6B]">
                The dimensions below use the U.S. ADA Standards as useful
                planning benchmarks. The ADA primarily governs public,
                commercial, and government facilities—not most private homes.
                Confirm local residential code, permits, waterproofing,
                electrical protection, and the final layout with licensed
                professionals.
              </p>
            </div>

            <section id="assessment" className="mb-14 scroll-mt-24">
              <SectionHeading number="1">Start With the User</SectionHeading>
              <p className="mb-6 leading-7 text-[#6B6B6B]">
                Before choosing fixtures, observe how the user enters,
                positions the chair, transfers, reaches controls, manages
                clothing, and calls for help. This prevents an expensive layout
                that looks accessible but does not work in daily life.
              </p>
              <GuideImage
                src="/Homeguide/Bathroom Accessibility/occupational-therapist-bathroom-assessment.png"
                alt="An occupational therapist measuring reach and transfer space with an older powered-wheelchair user in an American home bathroom"
                caption="Assess the actual user, wheelchair, transfer direction, and caregiver position before selecting fixtures or moving walls."
              />
              <div className="mb-6 grid gap-4 md:grid-cols-2">
                {assessmentCards.map(([title, text]) => (
                  <Card key={title}>
                    <CardContent className="p-5">
                      <h3 className="mb-2 font-semibold text-[#2D2D2D]">
                        {title}
                      </h3>
                      <p className="text-sm leading-6 text-[#6B6B6B]">{text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Note title="Best first appointment">
                Ask an occupational therapist to assess transfers in the actual
                bathroom. Bring the contractor into the same conversation
                before walls, plumbing, or support locations are finalized.
              </Note>
              <h3 className="mb-4 text-lg font-semibold text-[#2D2D2D]">
                Record these measurements
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Door opening and hallway approach",
                  "Room width and depth",
                  "Wheelchair width, length, and seat height",
                  "Toilet centerline and open transfer side",
                  "Shower opening and threshold height",
                  "Vanity height, knee space, and pipe location",
                  "Fixture edges, walls, and door swing",
                  "Drains, vents, outlets, and wall studs",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-[#E8E8E8] bg-white p-4"
                  >
                    <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#2AAAA0]" />
                    <p className="text-sm text-[#4A4A4A]">
                      {item}: <span className="text-[#8A8A8A]">________</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section id="layout" className="mb-14 scroll-mt-24">
              <SectionHeading number="2">Space and Doorway</SectionHeading>
              <p className="mb-6 leading-7 text-[#6B6B6B]">
                Create one continuous obstacle-free route. The wheelchair must
                enter, align beside each priority fixture, and leave without
                repeated tight turns. Keep bins, scales, mats, and open cabinets
                out of this route.
              </p>
              <GuideImage
                src="/Homeguide/Bathroom Accessibility/powered-wheelchair-bathroom-turning-space.png"
                alt="Older American woman turning a powered wheelchair inside a spacious accessible residential bathroom"
                caption="A clear turning zone lets a powered-wheelchair user enter, align with fixtures, close the door, and exit without repeated tight maneuvers."
              />
              <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {benchmarks.map(([label, value, note]) => (
                  <Card key={label} className="overflow-hidden">
                    <div className="h-1 bg-[#2AAAA0]" />
                    <CardContent className="p-5">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#6B6B6B]">
                        {label}
                      </p>
                      <p className="mb-2 text-2xl font-bold text-[#236F69]">
                        {value}
                      </p>
                      <p className="text-sm leading-5 text-[#6B6B6B]">{note}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-3 font-semibold text-[#2D2D2D]">
                      Door strategy
                    </h3>
                    <ul className="space-y-2 text-sm leading-6 text-[#6B6B6B]">
                      <li>• Consider an outward-swinging or pocket door.</li>
                      <li>• Use one-hand lever hardware.</li>
                      <li>• Preserve wall structure needed for grab bars.</li>
                      <li>• Add an emergency release or outside access method.</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-3 font-semibold text-[#2D2D2D]">
                      Small-room strategy
                    </h3>
                    <ul className="space-y-2 text-sm leading-6 text-[#6B6B6B]">
                      <li>• Let clear spaces overlap where permitted.</li>
                      <li>• Replace deep cabinetry with a shallow vanity.</li>
                      <li>• Relocate the door before losing transfer space.</li>
                      <li>• Tape the full layout and test the actual chair.</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section id="toilet" className="mb-14 scroll-mt-24">
              <SectionHeading number="3">Toilet Transfers</SectionHeading>
              <p className="mb-6 leading-7 text-[#6B6B6B]">
                Match the toilet zone to transfer direction. Do not place a
                vanity, radiator, or storage tower in the wheelchair side space.
                Seat height alone does not make a toilet accessible.
              </p>
              <GuideImage
                src="/Homeguide/Bathroom Accessibility/wheelchair-accessible-toilet-transfer-zone.png"
                alt="Wheelchair-accessible toilet transfer zone in a realistic American residential bathroom with correctly positioned grab bars"
                caption="Leave the transfer side open and coordinate toilet height, wheelchair position, grab bars, flush control, and hygiene supplies as one system."
              />
              <div className="mb-6 overflow-x-auto rounded-xl border border-[#E8E8E8]">
                <table className="w-full min-w-[680px] text-sm">
                  <thead className="bg-[#236F69] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Decision</th>
                      <th className="px-4 py-3 text-left">Benchmark</th>
                      <th className="px-4 py-3 text-left">User-specific check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E8E8] bg-white">
                    {[
                      ["Seat height", '17"–19"', "Compare with chair seat height, feet, transfer board, and trunk control."],
                      ["Toilet position", '16"–18" from side wall to centerline', "Confirm transfer side and caregiver position."],
                      ["Side grab bar", '42" minimum length benchmark', "Place for the user’s reach and keep the grip clear."],
                      ["Rear grab bar", '36" minimum length benchmark', "Coordinate tank, flush, bidet, and wall blocking."],
                      ["Clearance", "Keep the transfer side unobstructed", "Test chair angle, footplates, clothing, and door position."],
                    ].map(([decision, value, check]) => (
                      <tr key={decision}>
                        <td className="px-4 py-4 font-medium text-[#2D2D2D]">{decision}</td>
                        <td className="px-4 py-4 font-semibold text-[#236F69]">{value}</td>
                        <td className="px-4 py-4 leading-6 text-[#6B6B6B]">{check}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Note title="Grab bars are structural equipment" warning>
                Towel bars and suction-cup handles are not transfer supports.
                Specify locations before walls close, add continuous blocking
                where future changes are likely, and use a qualified installer.
              </Note>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ["Fixed bars", "Simple and durable when transfer direction is stable."],
                  ["Fold-down bars", "Flexible side access with adequate anchoring and operating room."],
                  ["Bidet seat", "May improve hygiene independence; verify controls, power, water protection, and seat opening."],
                ].map(([title, text]) => (
                  <Card key={title}>
                    <CardContent className="p-5">
                      <h3 className="mb-2 font-semibold text-[#2D2D2D]">{title}</h3>
                      <p className="text-sm leading-6 text-[#6B6B6B]">{text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section id="bathing" className="mb-14 scroll-mt-24">
              <SectionHeading number="4">Shower and Bathing</SectionHeading>
              <p className="mb-6 leading-7 text-[#6B6B6B]">
                A step-free shower is usually the most flexible long-term
                solution. It must manage both access and water: a flat entry
                that floods the wheelchair route is not accessible.
              </p>
              <GuideImage
                src="/Homeguide/Bathroom Accessibility/curbless-roll-in-shower.png"
                alt="Powered-wheelchair user approaching a curbless roll-in shower with a folding seat, grab bars, and handheld shower"
                caption="A residential roll-in shower combines a step-free entry with controlled drainage, seated controls, stable support, and a dry approach route."
              />
              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <Card className="border-t-4 border-t-[#2AAAA0]">
                  <CardContent className="p-6">
                    <h3 className="mb-3 text-lg font-semibold text-[#2D2D2D]">Roll-in shower</h3>
                    <ul className="space-y-2 text-sm leading-6 text-[#6B6B6B]">
                      <li>• Supports shower chairs and minimal-transfer routines.</li>
                      <li>• Start with a 60-inch by 30-inch benchmark.</li>
                      <li>• A folding seat preserves options for different users.</li>
                      <li>• Keep controls and handheld shower within seated reach.</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-t-4 border-t-[#F5A623]">
                  <CardContent className="p-6">
                    <h3 className="mb-3 text-lg font-semibold text-[#2D2D2D]">Tub or transfer shower</h3>
                    <ul className="space-y-2 text-sm leading-6 text-[#6B6B6B]">
                      <li>• Can work with a consistent seated transfer.</li>
                      <li>• Needs a stable seat and clear exterior transfer zone.</li>
                      <li>• A tub cut lowers the step but does not remove transfer needs.</li>
                      <li>• Reassess if strength or caregiver needs may change.</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Entry", "Curbless where construction allows; otherwise minimize and contrast the threshold."],
                  ["Floor", "Slip-resistant surface with a consistent drain slope."],
                  ["Controls", "Lever or thermostatic controls usable before entering the water stream."],
                  ["Showerhead", "Handheld unit on an adjustable slide bar with reachable hose."],
                  ["Seat", "Folding or freestanding seat selected for the transfer plan and load rating."],
                  ["Drainage", "Coordinate drain, joists, waterproofing, and the dry route."],
                  ["Storage", "Use shallow or recessed shelves without sharp projections."],
                  ["Temperature", "Provide anti-scald protection and a clear comfortable setting."],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-xl border border-[#E8E8E8] bg-white p-4">
                    <h3 className="mb-1 text-sm font-semibold text-[#2D2D2D]">{title}</h3>
                    <p className="text-sm leading-6 text-[#6B6B6B]">{text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="vanity" className="mb-14 scroll-mt-24">
              <SectionHeading number="5">Sink, Mirror, and Storage</SectionHeading>
              <GuideImage
                src="/Homeguide/Bathroom Accessibility/wheelchair-accessible-vanity.png"
                alt="Older powered-wheelchair user washing hands at an accessible vanity in a warm American home bathroom"
                caption="Open knee space, protected plumbing, a shallow basin, lever controls, a seated-height mirror, and reachable storage support an independent routine."
                position="top"
              />
              <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="mb-5 leading-7 text-[#6B6B6B]">
                    A forward approach needs open knee and toe space. Protect
                    exposed pipes from contact and heat, and avoid deep cabinets
                    that force a sideways reach.
                  </p>
                  <ul className="space-y-3 text-sm leading-6 text-[#6B6B6B]">
                    <li>• Use a wall-mounted or shallow vanity with finished knee space.</li>
                    <li>• Choose a shallow basin and lever or touchless faucet.</li>
                    <li>• Lower or tilt the mirror for a seated eye line.</li>
                    <li>• Use full-extension drawers and reachable open shelves.</li>
                    <li>• Move daily items out of high and floor-level storage.</li>
                    <li>• Add layered, low-glare lighting and humidity-controlled ventilation.</li>
                  </ul>
                </div>
                <div className="rounded-2xl bg-[#236F69] p-6 text-white">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-white/65">
                    Reach test
                  </p>
                  <p className="mb-4 text-2xl font-bold">One seated routine</p>
                  <p className="text-sm leading-6 text-white/80">
                    Complete handwashing, grooming, towel use, and medication
                    storage from the actual chair. Mark every unstable reach
                    before cabinetry and controls are ordered.
                  </p>
                </div>
              </div>
            </section>

            <section id="plans" className="mb-14 scroll-mt-24">
              <SectionHeading number="6">Renovation Plans</SectionHeading>
              <p className="mb-6 text-sm leading-6 text-[#6B6B6B]">
                These are broad planning ranges. Plumbing relocation,
                structural work, waterproofing, permits, and local labor can
                change the final cost substantially.
              </p>
              <div className="grid gap-5 xl:grid-cols-3">
                {planOptions.map((plan) => (
                  <Card key={plan.level} className="overflow-hidden">
                    <div className="h-1.5" style={{ backgroundColor: plan.color }} />
                    <CardContent className="p-6">
                      <h3 className="mb-1 text-lg font-bold text-[#2D2D2D]">{plan.level}</h3>
                      <p className="mb-1 text-2xl font-bold" style={{ color: plan.color }}>
                        {plan.budget}
                      </p>
                      <p className="mb-4 text-sm text-[#6B6B6B]">{plan.time}</p>
                      <p className="mb-4 text-sm leading-6 text-[#4A4A4A]">{plan.bestFor}</p>
                      <ul className="space-y-2 border-t border-[#E8E8E8] pt-4 text-sm leading-6 text-[#6B6B6B]">
                        {plan.items.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span style={{ color: plan.color }}>✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section id="sequence" className="mb-14 scroll-mt-24">
              <SectionHeading number="7">A Safer Project Sequence</SectionHeading>
              <ol className="space-y-4">
                {[
                  ["Observe", "Document the routine, transfer side, chair dimensions, caregiver position, and priorities."],
                  ["Measure", "Draw walls, doors, fixtures, drains, utilities, studs, and clear spaces."],
                  ["Mock up", "Use tape and boxes to test the full-scale layout with the actual wheelchair."],
                  ["Coordinate", "Review one drawing with the user, OT, contractor, plumber, and electrician."],
                  ["Permit", "Confirm local structural, plumbing, electrical, and ventilation requirements."],
                  ["Build hidden support", "Install blocking, waterproofing, drainage, power, and future equipment support."],
                  ["Test", "Complete transfer, reach, water, and emergency-access checks before handoff."],
                ].map(([title, text], index) => (
                  <li key={title} className="flex gap-4 rounded-xl border border-[#E8E8E8] bg-white p-5">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#2AAAA0] text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="mb-1 font-semibold text-[#2D2D2D]">{title}</h3>
                      <p className="text-sm leading-6 text-[#6B6B6B]">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section id="safety" className="mb-14 scroll-mt-24">
              <SectionHeading number="8">Safety Checks</SectionHeading>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    title: "Do not rely on",
                    color: "#E07A5F",
                    items: [
                      "Suction grab bars for body-weight support",
                      "Loose bath mats in the wheelchair route",
                      "A toilet riser chosen without a transfer trial",
                      "A curbless shower without a drainage plan",
                      "An inward door that can trap a fallen user",
                    ],
                  },
                  {
                    title: "Verify before handoff",
                    color: "#4A9B6F",
                    items: [
                      "Grab-bar anchoring and rated hardware",
                      "Slip resistance under wet, soapy conditions",
                      "Hot-water temperature and anti-scald performance",
                      "GFCI, fixture ratings, and safe cord management",
                      "Emergency communication reachable from the floor",
                    ],
                  },
                ].map((group) => (
                  <Card key={group.title} className="overflow-hidden">
                    <div className="h-1.5" style={{ backgroundColor: group.color }} />
                    <CardContent className="p-6">
                      <h3 className="mb-4 font-semibold text-[#2D2D2D]">{group.title}</h3>
                      <ul className="space-y-3 text-sm leading-6 text-[#6B6B6B]">
                        {group.items.map((item) => (
                          <li key={item} className="flex gap-2">
                            <span style={{ color: group.color }}>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section id="checklist" className="mb-14 scroll-mt-24">
              <SectionHeading number="9">Final Checklist</SectionHeading>
              <div className="space-y-6">
                {checklistGroups.map((group, groupIndex) => (
                  <div key={group.title}>
                    <h3 className="mb-3 font-semibold text-[#2D2D2D]">{group.title}</h3>
                    <div className="grid gap-3 rounded-xl border border-[#E8E8E8] bg-white p-5 md:grid-cols-2">
                      {group.items.map((item, itemIndex) => {
                        const id = "bathroom-" + groupIndex + "-" + itemIndex;
                        return (
                          <label
                            key={item}
                            htmlFor={id}
                            className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#6B6B6B] hover:text-[#2D2D2D]"
                          >
                            <input
                              id={id}
                              type="checkbox"
                              className="mt-1 rounded border-[#CFCFCF] text-[#2AAAA0] focus:ring-[#2AAAA0]"
                            />
                            <span>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="resources" className="mb-14 scroll-mt-24">
              <SectionHeading number="10">Standards and Resources</SectionHeading>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-3 font-semibold text-[#2D2D2D]">Official standards</h3>
                    <ul className="space-y-3 text-sm leading-6">
                      {[
                        ["Clear Floor and Turning Space", "https://www.access-board.gov/ada/guides/chapter-3-clear-floor-or-ground-space-and-turning-space/"],
                        ["Toilet Rooms", "https://www.access-board.gov/ada/guides/chapter-6-toilet-rooms/"],
                        ["Bathing Rooms", "https://www.access-board.gov/ada/guides/chapter-6-bathing-rooms/"],
                      ].map(([label, href]) => (
                        <li key={label}>
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#236F69] underline-offset-4 hover:underline"
                          >
                            U.S. Access Board: {label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-3 font-semibold text-[#2D2D2D]">Professional review</h3>
                    <ul className="space-y-2 text-sm leading-6 text-[#6B6B6B]">
                      <li>• Occupational therapist for transfer and routine assessment</li>
                      <li>• Accessibility-experienced designer or contractor</li>
                      <li>• Licensed plumber and electrician</li>
                      <li>• Local building department for permits and residential code</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <div className="rounded-2xl border border-[#2AAAA0]/20 bg-gradient-to-r from-[#2AAAA0]/10 to-[#F5A623]/10 p-6">
              <p className="mb-3 text-sm leading-6 text-[#4A4A4A]">
                <strong>Important:</strong> This guide supports planning and
                professional conversations. It is not a substitute for an
                individual clinical assessment, engineering review, product
                instructions, or local code compliance.
              </p>
              <p className="text-xs text-[#6B6B6B]">
                Document version: 1.0 · Last updated: July 2026 · Review status:
                Professional review recommended before construction
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
