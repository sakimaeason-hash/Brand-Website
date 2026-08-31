"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Car,
  Check,
  ExternalLink,
  Printer,
  Ruler,
  ShieldCheck,
  TriangleAlert,
  Truck,
  Weight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TRANSPORT_PRODUCT_ROWS,
  TRANSPORT_SOURCES,
  VEHICLE_METHODS,
} from "@/data/outdoor-transportation";

const tableOfContents = [
  ["measure", "1. Measure Before Loading"],
  ["vehicles", "2. Choose a Vehicle Method"],
  ["steps", "3. Photo Loading Sequence"],
  ["heavy", "4. Heavy Wheelchair Path"],
  ["products", "5. GoldSeason Transport Fit"],
  ["worksheet", "6. Vehicle Fit Worksheet"],
  ["checklist", "7. Final Drive Checklist"],
  ["help", "8. When to Get Professional Help"],
  ["sources", "9. Sources and Verification"],
] as const;

const measurements = [
  {
    title: "Cargo opening width",
    value: "Measure the narrowest point",
    text: "Measure between trim, hinges, weather seals, and any lift hardware. The opening must clear the folded chair at its widest point.",
    icon: Ruler,
  },
  {
    title: "Cargo depth with seats folded",
    value: "Measure the usable floor",
    text: "Measure from the loading edge to the seatback or barrier. Include the space needed to close the hatch or trunk without contact.",
    icon: Car,
  },
  {
    title: "Chair-only weight",
    value: "Weigh without the battery",
    text: "Record the heaviest piece a helper must handle. Add the battery, cushion, ramp, and accessories separately for the total transport load.",
    icon: Weight,
  },
];

const loadingSteps = [
  ["Measure", "Confirm the vehicle opening, floor depth, lift-over height, and the chair's folded envelope before the trip."],
  ["Prepare", "Remove the battery only when the chair and vehicle instructions call for it. Clear loose items and set the ramp or lift on level ground."],
  ["Load", "Use the vehicle's designed ramp, lift, or loading aid. Keep hands clear of pinch points and never improvise a ramp angle."],
  ["Secure", "Lock the chair or engage its parking brake. Use the restraint system specified for the chair and vehicle, then check every connection."],
];

const checklistGroups = [
  {
    title: "Vehicle and equipment",
    items: [
      "The opening, cargo depth, and lift-over height were measured at the actual vehicle.",
      "The ramp or lift rating exceeds the combined chair, battery, accessory, and user load when occupied.",
      "The loading surface is level, dry, and clear of traffic before the process begins.",
      "The battery and accessories are packed according to the chair and carrier instructions.",
    ],
  },
  {
    title: "Loading and securing",
    items: [
      "A helper is available when the chair piece exceeds one person's safe handling capacity.",
      "The chair is fully inside the cargo area and cannot contact the hatch, trunk lid, or barrier.",
      "All restraint points are attached to approved anchor locations and checked for tension.",
      "A chair transported occupied uses an approved occupant restraint system for the user.",
    ],
  },
  {
    title: "Before driving",
    items: [
      "Loose batteries, ramps, cushions, and accessories cannot become projectiles.",
      "Doors, ramps, and lifts are latched or stowed according to their instructions.",
      "The driver knows the route, stopping plan, and who will assist at the destination.",
      "The setup was tested at low speed or in a safe area before a longer trip.",
    ],
  },
];

const worksheetFields = [
  ["vehicle-opening-width", "Vehicle opening width", "in", "Enter the narrowest clear width."],
  ["cargo-depth", "Usable cargo depth", "in", "Measure with the seats in the planned position."],
  ["ramp-rating", "Ramp or lift rating", "lb", "Use the equipment label or manual."],
  ["chair-weight", "Chair-only weight", "lb", "Exclude the battery and loose accessories."],
  ["battery-accessory-weight", "Battery and accessory weight", "lb", "Add every item loaded with the chair."],
  ["helper-capacity", "Helper safe handling capacity", "lb", "Use a conservative personal limit, not a maximum effort."],
] as const;

const photoCredits = [
  ["Vehicle ramp and lift photographs — John Robert McPherson (CC BY-SA 4.0)", "https://commons.wikimedia.org/wiki/Category:Wheelchair_accessible_vehicles"],
  ["Wheelchair platform scale photograph — Xavier020 (CC0)", "https://commons.wikimedia.org/wiki/File:Wheelchair_scale,_hospital_in_Shimane_prefecture_-_Jan_27,_2026.jpg"],
  ["Securement station photograph — Metropolitan Transportation Authority (CC BY 2.0)", "https://commons.wikimedia.org/wiki/File:Quantum_Self_Securement_Station_(53067875662).jpg"],
] as const;

function SectionHeading({ number, children }: { number: string; children: ReactNode }) {
  return (
    <div className="mb-6 border-b-2 border-[#315C4A] pb-3">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#315C4A]">Section {number}</p>
      <h2 className="text-2xl font-bold text-[#2D2D2D]">{children}</h2>
    </div>
  );
}

function GuideImage({ src, alt, caption, position = "center" }: { src: string; alt: string; caption: string; position?: "center" | "top" }) {
  return (
    <figure className="my-8">
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-[#E8E8E8] shadow-sm">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 896px, (min-width: 1024px) calc(100vw - 400px), 100vw"
          className={position === "top" ? "object-cover object-top" : "object-cover object-center"}
        />
      </div>
      <figcaption className="mx-auto mt-3 max-w-3xl text-center text-sm italic leading-6 text-[#6B6B6B]">{caption}</figcaption>
    </figure>
  );
}

function MethodIcon({ id }: { id: (typeof VEHICLE_METHODS)[number]["id"] }) {
  if (id === "sedan") return <Car className="h-6 w-6" aria-hidden="true" />;
  if (id === "suv-crossover") return <Truck className="h-6 w-6" aria-hidden="true" />;
  return <ShieldCheck className="h-6 w-6" aria-hidden="true" />;
}

export default function OutdoorTransportationGuidePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <section className="bg-[#315C4A] text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-4xl">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="text-4xl" aria-hidden="true">🚐</span>
              <Badge className="border-white/30 bg-white/15 text-white">Outdoor Transportation Guide</Badge>
              <Badge className="border-white/30 bg-white/15 text-white">Photo-first</Badge>
            </div>
            <h1 className="mb-5 text-4xl font-bold tracking-tight text-white lg:text-6xl">Wheelchair Transportation Outdoors</h1>
            <p className="mb-8 max-w-3xl text-xl leading-relaxed text-white/90">
              Measure your vehicle, choose a loading method, and secure a light or heavy wheelchair for everyday drives in the United States.
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              {["Sedan", "SUV / Crossover", "Accessible Van", "Heavy Wheelchair"].map((tag) => (
                <span key={tag} className="rounded-full bg-white/15 px-4 py-2">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row">
          <aside className="flex-shrink-0 lg:w-64">
            <div className="lg:sticky lg:top-24">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[#6B6B6B]">Table of Contents</p>
              <nav aria-label="Outdoor transportation guide sections" className="space-y-1">
                {tableOfContents.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#6B6B6B] transition-colors hover:bg-[#315C4A]/10 hover:text-[#315C4A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315C4A]"
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <div className="mt-6">
                <Link href="/guides">
                  <Button variant="outline" size="sm" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                    All Guides
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

          <article className="min-w-0 flex-1">
            <div className="mb-10 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-4 flex flex-wrap gap-2">
                {["vehicle loading", "wheelchair travel", "sedan", "SUV", "accessible van", "heavy chair"].map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-[#E9F0EC] text-[#315C4A]">{tag}</Badge>
                ))}
              </div>
              <p className="mb-3 text-lg leading-relaxed text-[#4A4A4A]">
                A safe trip starts with a measured vehicle and a loading plan that matches the actual chair, battery, accessories, helper capacity, and whether the user stays seated during transport.
              </p>
              <p className="text-sm leading-6 text-[#6B6B6B]">
                This is a planning guide, not a vehicle-fit guarantee. Follow the chair, ramp, lift, restraint, and vehicle instructions for the exact equipment in use. Federal and professional sources are listed at the end.
              </p>
            </div>

            <section id="measure" className="mb-14 scroll-mt-24">
              <SectionHeading number="1">Measure Before Loading</SectionHeading>
              <p className="mb-6 leading-7 text-[#6B6B6B]">
                Measure the physical path the chair will travel. Manufacturer cargo-volume numbers rarely show the narrowest opening, trim intrusion, hinge movement, or the clearance needed to close a trunk or hatch.
              </p>
              <GuideImage
                src="/Homeguide/Outdoor Transportation/vehicle-cargo-measurement.jpg"
                alt="A powered wheelchair and portable ramp positioned at the rear cargo opening of a vehicle"
                caption="Use a real vehicle walk-through to check the opening, floor path, ramp placement, and closed-door clearance before loading."
              />
              <div className="mb-6 grid gap-4 md:grid-cols-3">
                {measurements.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.title} className="border-t-4 border-t-[#315C4A]">
                      <CardContent className="p-5">
                        <Icon className="mb-4 h-6 w-6 text-[#315C4A]" aria-hidden="true" />
                        <h3 className="mb-2 font-semibold text-[#2D2D2D]">{item.title}</h3>
                        <p className="mb-2 text-sm font-semibold text-[#315C4A]">{item.value}</p>
                        <p className="text-sm leading-6 text-[#6B6B6B]">{item.text}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <GuideImage
                src="/Homeguide/Outdoor Transportation/folded-wheelchair-scale.jpg"
                alt="A low platform scale designed for weighing a wheelchair user in a clinical setting"
                caption="A platform scale can provide a reliable reference for the chair and user; record chair-only weight separately when a helper will lift the chair."
              />
              <div className="rounded-xl border border-[#315C4A]/25 bg-[#315C4A]/5 p-5 text-sm leading-6 text-[#4A4A4A]">
                <p className="mb-2 font-semibold text-[#315C4A]">A useful measurement note</p>
                <p>For an occupied lift or ramp, total load means the user, wheelchair, battery, cushion, bags, and any other carried equipment. The chair-only number is for the piece a helper actually lifts.</p>
              </div>
            </section>

            <section id="vehicles" className="mb-14 scroll-mt-24">
              <SectionHeading number="2">Choose a Vehicle Method</SectionHeading>
              <p className="mb-6 leading-7 text-[#6B6B6B]">Choose the method that matches the chair's folded dimensions, the total load, the user's transfer plan, and the available assistance. A larger vehicle is not automatically compatible.</p>
              <div className="grid gap-5 md:grid-cols-3">
                {VEHICLE_METHODS.map((method) => (
                  <Card key={method.id} className="overflow-hidden">
                    <div className="h-1.5 bg-[#315C4A]" />
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#E9F0EC] text-[#315C4A]"><MethodIcon id={method.id} /></div>
                      <h3 className="mb-2 text-lg font-semibold text-[#2D2D2D]">
                        {method.id === "suv-crossover" ? "SUV / Crossover" : method.id === "accessible-van" ? "Accessible van" : "Sedan"}
                      </h3>
                      <p className="mb-4 text-sm leading-6 text-[#4A4A4A]">{method.bestFor}</p>
                      <p className="border-t border-[#E8E8E8] pt-4 text-sm leading-6 text-[#6B6B6B]"><span className="font-semibold text-[#A15C38]">Check:</span> {method.caution}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <GuideImage
                  src="/Homeguide/Outdoor Transportation/sedan-trunk-loading.jpg"
                  alt="A powered wheelchair being guided up a rear loading ramp into a vehicle in a paved parking area"
                  caption="A rear loading ramp is shown as an example of a controlled path; a sedan trunk still requires a separate opening, depth, and helper-capacity check."
                />
                <GuideImage
                  src="/Homeguide/Outdoor Transportation/suv-ramp-loading.jpg"
                  alt="A folded wheelchair being guided up a portable ramp into an SUV cargo area"
                  caption="An SUV or crossover can provide a wider opening, but the ramp angle, ramp rating, lift-over height, and anchor points still need verification."
                />
              </div>
            </section>

            <section id="steps" className="mb-14 scroll-mt-24">
              <SectionHeading number="3">Photo Loading Sequence</SectionHeading>
              <ol className="space-y-4">
                {loadingSteps.map(([title, text], index) => (
                  <li key={title} className="flex gap-4 rounded-xl border border-[#E8E8E8] bg-white p-5">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#315C4A] text-sm font-bold text-white">{index + 1}</span>
                    <div><h3 className="mb-1 font-semibold text-[#2D2D2D]">{title}</h3><p className="text-sm leading-6 text-[#6B6B6B]">{text}</p></div>
                  </li>
                ))}
              </ol>
              <p className="mt-6 rounded-xl border border-[#A15C38]/25 bg-[#A15C38]/5 p-5 text-sm leading-6 text-[#4A4A4A]">Never ask one person to catch, twist, or carry a moving chair beyond their safe capacity. Stop and reset the equipment when the path, posture, or weather makes the loading motion unstable.</p>
            </section>

            <section id="heavy" className="mb-14 scroll-mt-24">
              <SectionHeading number="4">Heavy Wheelchair Path</SectionHeading>
              <div className="mb-6 rounded-2xl border-2 border-[#A15C38]/35 bg-[#FFF7F1] p-6">
                <div className="mb-3 flex items-center gap-3 text-[#A15C38]"><TriangleAlert className="h-6 w-6" aria-hidden="true" /><h3 className="text-lg font-bold">Heavy Wheelchair safety boundary</h3></div>
                <p className="mb-4 text-sm leading-6 text-[#4A4A4A]">Calculate the total load before choosing a ramp or lift. The equipment rating must exceed the loaded total, and the vehicle structure and anchor points must be approved for that use.</p>
                <ul className="space-y-2 text-sm leading-6 text-[#4A4A4A]">
                  <li className="flex gap-2"><Check className="mt-1 h-4 w-4 flex-shrink-0 text-[#A15C38]" aria-hidden="true" />Use a rated lift or ramp with margin above the combined chair, user, battery, and accessory load.</li>
                  <li className="flex gap-2"><Check className="mt-1 h-4 w-4 flex-shrink-0 text-[#A15C38]" aria-hidden="true" />Use two-person help or powered equipment when one person's safe handling capacity is not enough.</li>
                  <li className="flex gap-2"><Check className="mt-1 h-4 w-4 flex-shrink-0 text-[#A15C38]" aria-hidden="true" />When the user remains seated, use an approved occupant restraint system designed for occupied wheelchair transport.</li>
                  <li className="flex gap-2"><Check className="mt-1 h-4 w-4 flex-shrink-0 text-[#A15C38]" aria-hidden="true" />Ordinary cargo straps do not replace occupant restraints and should not be presented as a passenger safety system.</li>
                </ul>
              </div>
              <GuideImage
                src="/Homeguide/Outdoor Transportation/accessible-van-heavy-wheelchair-lift.jpg"
                alt="A heavy powered wheelchair being raised with a platform lift at the side door of an accessible van"
                caption="A platform lift or engineered ramp can keep a heavy chair on a controlled path; confirm the rating and anchor system with the vehicle provider."
              />
              <GuideImage
                src="/Homeguide/Outdoor Transportation/wheelchair-transport-tie-down.jpg"
                alt="Approved wheelchair tie-down straps attached to marked anchor points inside an accessible vehicle"
                caption="Use the chair and vehicle manufacturer's approved tie-down and occupant-restraint instructions; inspect every anchor before departure."
              />
            </section>

            <section id="products" className="mb-14 scroll-mt-24">
              <SectionHeading number="5">GoldSeason Transport Fit</SectionHeading>
              <p className="mb-6 leading-7 text-[#6B6B6B]">These rows repeat the official GoldSeason product data already used by the fit finder. They help you compare pieces to a measured vehicle; they do not certify a vehicle match, ramp rating, or occupant restraint.</p>
              <div className="overflow-x-auto rounded-2xl border border-[#E8E8E8] bg-white shadow-sm" aria-label="GoldSeason wheelchair transport measurements">
                <table className="min-w-[760px] w-full border-collapse text-left text-sm">
                  <thead className="bg-[#E9F0EC] text-[#315C4A]">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Model</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Chair-only</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Folded L × W × H</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Seat width</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Battery</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Source status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TRANSPORT_PRODUCT_ROWS.map((row) => (
                      <tr key={row.productId} className="border-t border-[#E8E8E8] align-top">
                        <th scope="row" className="px-4 py-4 font-semibold text-[#2D2D2D]">{row.name}</th>
                        <td className="px-4 py-4 text-[#4A4A4A]">{row.netWeightLb.toFixed(1)} lb</td>
                        <td className="whitespace-nowrap px-4 py-4 text-[#4A4A4A]">{row.foldedIn.length.toFixed(1)} × {row.foldedIn.width.toFixed(1)} × {row.foldedIn.height.toFixed(1)} in</td>
                        <td className="px-4 py-4 text-[#4A4A4A]">{row.seatWidthIn.toFixed(1)} in</td>
                        <td className="px-4 py-4 text-[#4A4A4A]">{row.removableBattery ? "Removable" : "Not removable"}</td>
                        <td className="px-4 py-4 text-xs leading-5 text-[#6B6B6B]"><span className="block font-semibold text-[#315C4A]">Manufacturer spec</span>{row.fdaStatus === "not_verified" ? "FDA listing not verified" : "FDA verification recorded"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section id="worksheet" className="mb-14 scroll-mt-24">
              <SectionHeading number="6">Vehicle Fit Worksheet</SectionHeading>
              <p className="mb-6 leading-7 text-[#6B6B6B]">Record the numbers you will review with the vehicle, equipment, and rehabilitation professionals. This worksheet is for planning only and does not issue an automated safety verdict.</p>
              <form className="rounded-2xl border border-[#E8E8E8] bg-white p-6 shadow-sm sm:p-8" onSubmit={(event) => event.preventDefault()}>
                <div className="grid gap-5 sm:grid-cols-2">
                  {worksheetFields.map(([id, label, unit, help]) => (
                    <div key={id}>
                      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[#2D2D2D]">{label} <span className="font-normal text-[#6B6B6B]">({unit})</span></label>
                      <div className="flex items-center gap-2">
                        <input id={id} name={id} type="number" inputMode="decimal" min="0" step="0.1" className="w-full rounded-lg border border-[#CFCFCF] px-3 py-2 text-[#2D2D2D] focus:border-[#315C4A] focus:outline-none focus:ring-2 focus:ring-[#315C4A]/25" />
                        <span className="text-sm text-[#6B6B6B]" aria-hidden="true">{unit}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[#6B6B6B]">{help}</p>
                    </div>
                  ))}
                </div>
              </form>
            </section>

            <section id="checklist" className="mb-14 scroll-mt-24">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#315C4A] pb-3">
                <div><p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#315C4A]">Section 7</p><h2 className="text-2xl font-bold text-[#2D2D2D]">Final Drive Checklist</h2></div>
                <Button type="button" variant="outline" size="sm" onClick={() => window.print()} aria-label="Print the final drive checklist"><Printer className="mr-2 h-4 w-4" aria-hidden="true" />Print checklist</Button>
              </div>
              <div className="space-y-6">
                {checklistGroups.map((group, groupIndex) => (
                  <div key={group.title}>
                    <h3 className="mb-3 font-semibold text-[#2D2D2D]">{group.title}</h3>
                    <div className="grid gap-3 rounded-xl border border-[#E8E8E8] bg-white p-5 md:grid-cols-2">
                      {group.items.map((item, itemIndex) => {
                        const id = `transport-check-${groupIndex}-${itemIndex}`;
                        return <label key={item} htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[#6B6B6B] hover:text-[#2D2D2D]"><input id={id} type="checkbox" className="mt-1 rounded border-[#CFCFCF] text-[#315C4A] focus:ring-[#315C4A]" /><span>{item}</span></label>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="help" className="mb-14 scroll-mt-24">
              <SectionHeading number="8">When to Get Professional Help</SectionHeading>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["Vehicle mobility specialist", "Ask a qualified mobility dealer to verify the lift, ramp, anchor, door, and floor structure for the exact vehicle and chair."],
                  ["Occupational or physical therapist", "Get an individual assessment when transfers, fatigue, posture, pressure care, or occupied transport are part of the trip."],
                  ["Manufacturer or carrier", "Request written equipment limits and installation instructions when a battery, lift, tie-down, or restraint is not clearly identified."],
                  ["Two-person loading plan", "Stop and redesign the process when the chair or load exceeds a helper's safe capacity, or when weather and traffic remove a stable setup."],
                ].map(([title, text]) => <Card key={title}><CardContent className="p-5"><h3 className="mb-2 font-semibold text-[#2D2D2D]">{title}</h3><p className="text-sm leading-6 text-[#6B6B6B]">{text}</p></CardContent></Card>)}
              </div>
              <p className="mt-6 rounded-xl border border-[#315C4A]/25 bg-[#315C4A]/5 p-5 text-sm leading-6 text-[#4A4A4A]"><strong>Scope:</strong> This guide supports planning and professional conversations. It does not replace professional evaluation, equipment instructions, or applicable vehicle and accessibility requirements.</p>
            </section>

            <section id="sources" className="mb-14 scroll-mt-24">
              <SectionHeading number="9">Sources and Verification</SectionHeading>
              <p className="mb-6 text-sm leading-6 text-[#6B6B6B]">The source layers have different jobs. FDA resources are used for device-information verification; they are not used to certify vehicle fit, ramp capacity, tie-down installation, or occupant restraint performance.</p>
              <div className="grid gap-4 md:grid-cols-2">
                {TRANSPORT_SOURCES.map((source) => {
                  const external = source.href.startsWith("https://");
                  return <Card key={source.kind}><CardContent className="p-5"><div className="mb-2 flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-wide text-[#315C4A]">{source.kind}</span>{external && <ExternalLink className="h-4 w-4 text-[#6B6B6B]" aria-hidden="true" />}</div><a href={source.href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="font-semibold text-[#315C4A] underline-offset-4 hover:underline">{source.label}</a><p className="mt-2 text-sm leading-6 text-[#6B6B6B]">{source.kind === "fda" ? "Device database reference; listing status for these models is not verified here." : source.kind === "nhtsa" ? "Vehicle safety and occupant-protection context." : source.kind === "standard" ? "Professional wheelchair transportation and securement standards." : "GoldSeason product specifications used for comparison."}</p></CardContent></Card>;
                })}
              </div>
              <div className="mt-6 rounded-2xl border border-[#E8E8E8] bg-white p-6 text-sm leading-6 text-[#6B6B6B]">
                <p><strong className="text-[#2D2D2D]">Verification note:</strong> Product measurements are labeled Manufacturer spec. FDA listing not verified is shown for every row until a specific model, manufacturer, and FDA record can be matched one-to-one.</p>
                <p className="mt-3">Review date: August 2026. Confirm current instructions and local requirements before each installation or trip.</p>
                <p className="mt-3"><strong className="text-[#2D2D2D]">Photography:</strong> The photographs are illustrative third-party images, not GoldSeason product photos. Attribution and license details:</p>
                <ul className="mt-2 space-y-1">
                  {photoCredits.map(([label, href]) => <li key={href}><a href={href} target="_blank" rel="noreferrer" className="text-[#315C4A] underline-offset-4 hover:underline">{label}</a></li>)}
                </ul>
              </div>
            </section>

            <div className="rounded-2xl border border-[#315C4A]/20 bg-[#E9F0EC] p-6">
              <p className="text-sm leading-6 text-[#315C4A]"><strong>Remember:</strong> A measured route, rated equipment, approved securement, and a realistic helper plan are all required parts of safe wheelchair transportation.</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
