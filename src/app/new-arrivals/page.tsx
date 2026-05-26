import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/CountdownTimer";

export const metadata = {
  title: "New Arrivals & Promotions | GoldSeason",
  description: "Discover our latest products and exclusive promotions. Limited time offers on GoldSeason power wheelchairs.",
};

const newProducts = [
  {
    id: "elite-x",
    name: "GoldSeason Elite X",
    tagline: "The Future of Mobility",
    price: "$2,799",
    originalPrice: "$3,199",
    badge: "NEW",
    badgeColor: "bg-[#F5A623]",
    features: [
      "AI-Powered Navigation",
      "25-Mile Range",
      "Smart App Control",
      "Auto-Folding",
    ],
    description: "Our most advanced wheelchair featuring AI-assisted navigation, premium suspension, and a 25-mile range. The Elite X represents the pinnacle of mobility technology.",
    image: "Elite X",
    launchDate: "Just Released",
  },
  {
    id: "pro-plus",
    name: "GoldSeason Pro Plus",
    tagline: "Enhanced Performance",
    price: "$1,799",
    originalPrice: "$1,999",
    badge: "NEW",
    badgeColor: "bg-[#F5A623]",
    features: [
      "18-Mile Range",
      "Enhanced Comfort Seat",
      "All-Terrain Wheels",
      "Quick-Release Battery",
    ],
    description: "Building on our popular Pro model, the Pro Plus offers extended range and enhanced comfort features for the active user.",
    image: "Pro Plus",
    launchDate: "New This Month",
  },
];

const promotions = [
  {
    id: "spring-sale",
    title: "Spring Freedom Sale",
    discount: "Save Up To $300",
    description: "Celebrate the season with special savings on select GoldSeason models. Limited time offer.",
    endDate: "2025-05-31T23:59:59",
    code: "SPRING25",
    terms: "Valid on Lite and Pro models. Cannot be combined with other offers.",
  },
  {
    id: "trade-in",
    title: "Trade-In Program",
    discount: "Get Up To $500 Credit",
    description: "Trade in any mobility device and receive credit toward a new GoldSeason wheelchair.",
    endDate: "2025-12-31T23:59:59",
    code: "No Code Needed",
    terms: "Trade-in value depends on condition and model. Contact us for assessment.",
  },
  {
    id: "referral",
    title: "Refer a Friend",
    discount: "$100 For You Both",
    description: "Refer a friend to GoldSeason and you both receive $100 off your purchase.",
    endDate: "Ongoing",
    code: "REFER100",
    terms: "Friend must be a new customer. Credit applied after purchase completion.",
  },
];

const bundleDeals = [
  {
    name: "Travel Essentials Bundle",
    items: ["Wheelchair + Travel Bag + Battery Backup"],
    savings: "$150",
    price: "$1,149",
    originalPrice: "$1,299",
  },
  {
    name: "Comfort Plus Bundle",
    items: ["Wheelchair + Premium Cushion + Weather Cover"],
    savings: "$120",
    price: "$1,379",
    originalPrice: "$1,499",
  },
  {
    name: "Complete Care Bundle",
    items: ["Wheelchair + Maintenance Kit + Extended Warranty"],
    savings: "$200",
    price: "$1,299",
    originalPrice: "$1,499",
  },
];

export default function NewArrivalsPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#F5A623] to-[#E09520] py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-white/20 text-white border-0 text-sm">
              🎉 Introducing the Elite X
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-[#2D2D2D] mb-6">
              New Arrivals
              <br />
              <span className="text-white">& Special Offers</span>
            </h1>
            <p className="text-lg text-[#2D2D2D]/80 mb-8">
              Discover our latest innovations and exclusive promotions.
              Limited time offers for a limited time only.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a]">
                Shop New Arrivals
              </Button>
              <Button variant="outline" className="border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white">
                View All Promotions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* New Products Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#2AAAA0] font-medium tracking-wide uppercase mb-2">Just Launched</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D]">New Products</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {newProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden group">
                <div className="grid md:grid-cols-2">
                  <div className="aspect-square md:aspect-auto bg-gradient-to-br from-[#F5A623]/20 to-[#2AAAA0]/20 flex items-center justify-center relative">
                    <Badge className={`absolute top-4 left-4 ${product.badgeColor} text-[#2D2D2D]`}>
                      {product.badge}
                    </Badge>
                    <span className="text-[#6B6B6B] text-xl">{product.image}</span>
                  </div>
                  <CardContent className="p-8 flex flex-col justify-center">
                    <p className="text-sm text-[#2AAAA0] font-medium mb-1">{product.launchDate}</p>
                    <h3 className="text-2xl font-bold text-[#2D2D2D] mb-1">{product.name}</h3>
                    <p className="text-[#6B6B6B] mb-4">{product.tagline}</p>

                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="text-3xl font-bold text-[#F5A623]">{product.price}</span>
                      <span className="text-lg text-[#B0B0B0] line-through">{product.originalPrice}</span>
                    </div>

                    <p className="text-[#6B6B6B] text-sm mb-4">{product.description}</p>

                    <ul className="space-y-2 mb-6">
                      {product.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-[#6B6B6B]">
                          <svg className="w-4 h-4 text-[#2AAAA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="flex gap-3">
                      <Button className="flex-1 bg-[#F5A623] text-[#2D2D2D] hover:bg-[#E09520]">
                        Pre-Order Now
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Limited Time Offers */}
      <section className="py-16 lg:py-24 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2">Limited Time</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D]">Current Promotions</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {promotions.map((promo) => (
              <Card key={promo.id} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#F5A623]/10 rounded-bl-full" />
                <CardContent className="p-8 relative">
                  <Badge className="mb-4 bg-[#2AAAA0] text-white">
                    {promo.id === "spring-sale" ? "⏰ Limited Time" : "🎁 Ongoing"}
                  </Badge>

                  <h3 className="text-xl font-bold text-[#2D2D2D] mb-2">{promo.title}</h3>
                  <p className="text-2xl font-bold text-[#F5A623] mb-3">{promo.discount}</p>
                  <p className="text-[#6B6B6B] text-sm mb-4">{promo.description}</p>

                  {promo.id === "spring-sale" && (
                    <div className="mb-4">
                      <p className="text-xs text-[#6B6B6B] mb-1">Offer ends in:</p>
                      <CountdownTimer targetDate={promo.endDate} />
                    </div>
                  )}

                  <div className="bg-[#FAF8F5] rounded-lg p-3 mb-4">
                    <p className="text-xs text-[#6B6B6B]">Use code:</p>
                    <p className="font-mono font-bold text-[#2D2D2D]">{promo.code}</p>
                  </div>

                  <p className="text-xs text-[#B0B0B0] mb-4">{promo.terms}</p>

                  <Button className="w-full bg-[#2AAAA0] hover:bg-[#259990]">
                    Claim Offer
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bundle Deals */}
      <section className="py-16 lg:py-24 bg-[#2D2D2D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#F5A623] font-medium tracking-wide uppercase mb-2">Bundle & Save</p>
            <h2 className="text-3xl lg:text-4xl font-bold">Complete Care Packages</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {bundleDeals.map((bundle, i) => (
              <Card key={i} className="bg-white/5 border-white/10 text-white overflow-hidden">
                <CardContent className="p-6">
                  <Badge className="mb-4 bg-[#F5A623] text-[#2D2D2D]">
                    Save {bundle.savings}
                  </Badge>

                  <h3 className="text-xl font-bold mb-2">{bundle.name}</h3>

                  <ul className="text-sm text-[#B0B0B0] mb-4 space-y-1">
                    {bundle.items.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-[#F5A623]">{bundle.price}</span>
                    <span className="text-sm text-[#6B6B6B] line-through">{bundle.originalPrice}</span>
                  </div>

                  <Button className="w-full bg-white text-[#2D2D2D] hover:bg-[#F5A623]">
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="py-12 bg-[#F5A623]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-bold text-[#2D2D2D] mb-2">
                ⚡ Flash Sale: 20% Off GoldSeason Lite
              </h2>
              <p className="text-[#2D2D2D]/80">
                Our lightest model at an unbeatable price. Only 50 units available!
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-[#2D2D2D]/70">Sale ends in</p>
                <CountdownTimer targetDate="2025-05-01T23:59:59" />
              </div>
              <Button className="bg-[#2D2D2D] text-white hover:bg-[#1a1a1a]">
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[#2D2D2D] mb-4">
            Be the First to Know
          </h2>
          <p className="text-[#6B6B6B] mb-8">
            Subscribe to get exclusive access to new product launches and member-only promotions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 rounded-lg border border-[#E8E8E8] focus:border-[#2AAAA0] outline-none"
            />
            <Button className="bg-[#2AAAA0] hover:bg-[#259990]">
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-[#B0B0B0] mt-4">
            New subscribers get 10% off their first order!
          </p>
        </div>
      </section>
    </div>
  );
}
