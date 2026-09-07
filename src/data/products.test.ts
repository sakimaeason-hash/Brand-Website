import { describe, expect, expectTypeOf, it } from "vitest";
import {
  productById,
  products,
  wheelchairProducts,
  type Product,
  type WheelchairProduct,
} from "./products";

const expectedScooters = [
  {
    id: "s1",
    name: "Travel Air S 24",
    tagline: "Travel Ready • Ultra Portable",
    price: 499.99,
    originalPrice: undefined,
    category: "scooter",
    badge: "BESTSELLER",
    rating: 4.8,
    reviews: 72,
    images: [
      "/products/Scooters/Travel Air S 24A.jpg",
      "/products/Scooters/Travel Air S 24B.jpg",
      "/products/Scooters/Travel Air S 24F.jpg",
    ],
    colors: ["#DC2626", "#EA580C", "#2563EB"],
    colorNames: ["Red", "Orange", "Blue"],
    features: ["Airline Approved", "Ultra Light 28lbs", "15 Mile Range"],
    weight: "28 lbs",
    maxSpeed: "4 mph",
    warranty: "2 Years",
    amazonLink: "https://www.amazon.com/dp/B0GYNVF8QP?th=1",
  },
  {
    id: "s2",
    name: "Travel Air S 14",
    tagline: "Compact • Easy to Store",
    price: 999.99,
    originalPrice: undefined,
    category: "scooter",
    badge: undefined,
    rating: 4.6,
    reviews: 45,
    images: [
      "/products/Scooters/Travel Air S 14F.jpg",
      "/products/Scooters/Travel Air S 14H.jpg",
      "/products/Scooters/Travel Air S 14J.jpg",
    ],
    colors: ["#2563EB", "#171717", "#D4AF37"],
    colorNames: ["Blue", "Black", "Gold"],
    features: ["Airline Approved", "Lightweight", "12 Mile Range"],
    weight: "24 lbs",
    maxSpeed: "4 mph",
    warranty: "2 Years",
    amazonLink: "https://www.amazon.com/dp/B0GHYLR1BK?th=1",
  },
  {
    id: "s3",
    name: "Rover Power 23",
    tagline: "All-Terrain • Powerful Motor",
    price: 699.99,
    originalPrice: undefined,
    category: "scooter",
    badge: "NEW",
    rating: 4.9,
    reviews: 38,
    images: [
      "/products/Scooters/Rover Power 23A.jpg",
      "/products/Scooters/Rover Power 23F.jpg",
      "/products/Scooters/Rover Power 23M.jpg",
    ],
    colors: ["#DC2626", "#2563EB", "#EC4899"],
    colorNames: ["Red", "Blue", "Pink"],
    features: ["25 Mile Range", "Dual Motors", "All-Terrain"],
    weight: "35 lbs",
    maxSpeed: "5 mph",
    warranty: "3 Years",
    amazonLink: "https://www.amazon.com/dp/B0GZ43N9ZQ?th=1",
  },
  {
    id: "s4",
    name: "Rover Power 20",
    tagline: "Extended Range • Comfort",
    price: 499.99,
    originalPrice: undefined,
    category: "scooter",
    badge: undefined,
    rating: 4.7,
    reviews: 52,
    images: [
      "/products/Scooters/Rover Power 20A.jpg",
      "/products/Scooters/Rover Power 20I.jpg",
      "/products/Scooters/Rover Power 20J.jpg",
    ],
    colors: ["#DC2626", "#F5F5F5", "#D4AF37"],
    colorNames: ["Red", "White", "Gold"],
    features: ["20 Mile Range", "Comfort Seat", "All-Terrain"],
    weight: "32 lbs",
    maxSpeed: "4.5 mph",
    warranty: "3 Years",
    amazonLink: "https://www.amazon.com/dp/B0FWKC6H49",
  },
  {
    id: "s5",
    name: "Rover Power 19",
    tagline: "All-Terrain • Durable Build",
    price: 599.99,
    originalPrice: undefined,
    category: "scooter",
    badge: undefined,
    rating: 4.8,
    reviews: 29,
    images: [
      "/products/Scooters/Rover Power 19A.png",
      "/products/Scooters/Rover Power 19D.png",
    ],
    colors: ["#DC2626", "#9D9D6B"],
    colorNames: ["Red", "Pearl Green"],
    features: ["18 Mile Range", "All-Terrain", " Durable Frame"],
    weight: "30 lbs",
    maxSpeed: "4 mph",
    warranty: "3 Years",
    amazonLink: undefined,
  },
] as const;

const expectedWheelchairFacts = [
  {
    id: "1",
    weight: "33.1 lb without battery",
    range: "15 mi",
    seatWidth: "17.3 in",
    maxSpeed: "3.7 mph",
    travelLabel: "252 Wh removable lithium battery; confirm with airline",
  },
  {
    id: "2",
    weight: "35.7 lb without battery",
    range: "15 mi",
    seatWidth: "18.1 in",
    maxSpeed: "3.7 mph",
    travelLabel: "Battery voltage pending; airline status unverified",
  },
  {
    id: "3",
    weight: "37.0 lb without battery",
    range: "15 mi",
    seatWidth: "16.1 in",
    maxSpeed: "2.5 mph",
    travelLabel: "Battery voltage pending; airline status unverified",
  },
  {
    id: "4",
    weight: "54.0–61.7 lb without battery",
    range: "30 mi",
    seatWidth: "18.9 in",
    maxSpeed: "3.7 mph",
    travelLabel: "Not an airline-battery match",
  },
  {
    id: "5",
    weight: "65.5 lb without battery",
    range: "25–30 mi",
    seatWidth: "19.7 in",
    maxSpeed: "3.7 mph",
    travelLabel: "Not an airline-battery match",
  },
  {
    id: "6",
    weight: "48.5 lb without battery",
    range: "15 mi",
    seatWidth: "21.7 in",
    maxSpeed: "3.7 mph",
    travelLabel: "Not an airline-battery match",
  },
  {
    id: "7",
    weight: "63.9 lb without battery",
    range: "15 mi",
    seatWidth: "18.9 in",
    maxSpeed: "3.7 mph",
    travelLabel: "Not an airline-battery match",
  },
] as const;

describe("central storefront catalog", () => {
  it("preserves all five scooters and seven wheelchairs", () => {
    expect(products.filter((p) => p.category === "scooter")).toHaveLength(5);
    expect(wheelchairProducts).toHaveLength(7);
  });

  it("locks every scooter commercial field to the storefront baseline", () => {
    const scooterFacts = products
      .filter((product) => product.category === "scooter")
      .map((product) => ({
        id: product.id,
        name: product.name,
        tagline: product.tagline,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        badge: product.badge,
        rating: product.rating,
        reviews: product.reviews,
        images: product.images,
        colors: product.colors,
        colorNames: product.colorNames,
        features: product.features,
        weight: product.weight,
        maxSpeed: product.maxSpeed,
        warranty: product.warranty,
        amazonLink: product.amazonLink,
      }));

    expect(scooterFacts).toEqual(expectedScooters);
  });

  it("uses official facts for every wheelchair summary", () => {
    expect(
      wheelchairProducts.map((product) => ({
        id: product.id,
        weight: product.weight,
        range: product.range,
        seatWidth: product.seatWidth,
        maxSpeed: product.maxSpeed,
        travelLabel: product.features[0],
      }))
    ).toEqual(expectedWheelchairFacts);
  });

  it("keeps IDs unique and the lookup map aligned by object identity", () => {
    const ids = products.map((product) => product.id);

    expect(new Set(ids)).toHaveLength(12);
    expect(productById.size).toBe(products.length);
    for (const product of products) {
      expect(productById.get(product.id)).toBe(product);
    }
  });

  it("deep-freezes the public product catalog", () => {
    expect(Object.isFrozen(products)).toBe(true);
    expect(Object.isFrozen(wheelchairProducts)).toBe(true);

    for (const product of products) {
      expect(Object.isFrozen(product)).toBe(true);
      expect(Object.isFrozen(product.images)).toBe(true);
      expect(Object.isFrozen(product.colors)).toBe(true);
      expect(Object.isFrozen(product.colorNames)).toBe(true);
      expect(Object.isFrozen(product.features)).toBe(true);
    }
  });

  it("exposes narrowed wheelchairs and a readonly lookup type", () => {
    const typedWheelchairs: readonly WheelchairProduct[] = wheelchairProducts;

    expect(typedWheelchairs).toBe(wheelchairProducts);
    expectTypeOf(wheelchairProducts).toEqualTypeOf<
      readonly WheelchairProduct[]
    >();
    expectTypeOf(productById).toEqualTypeOf<ReadonlyMap<string, Product>>();
  });
});
