export type StaticStory = { id: number; name: string; location: string; quote: string; product: string; tags: string[]; image?: string };

export const stories: readonly StaticStory[] = [
  { id: 1, name: "Hadji Reyes", location: "Amazon", quote: "It took only 3 days since I placed the order and it arrived in perfect conditions, the speed is reasonable enough to pass safely through small doors and slim passage way.", product: "GoldSeason Travel Air W 03C", tags: ["Travel", "New User"], image: "/stories/Hadji Reyes.jpg" },
  { id: 2, name: "Stephanie Freeman", location: "Amazon", quote: "I just got my new wheelchair it was fairly easy to put it together. It is spacious, roomy and comfortable.", product: "GoldSeason Spacious Pro", tags: ["Comfort", "New User"] },
  { id: 3, name: "Stacy Olney", location: "Amazon", quote: "I am a very big girl and was very glad that I fit into this chair comfortably. It is a good chair for the price.", product: "GoldSeason Spacious Pro", tags: ["Comfort", "Support"] },
  { id: 4, name: "Lisa Sullivan", location: "Amazon", quote: "My last chair's seat was so narrow it was painful. This 22-inch seat is PERFECT. It is supportive and comfortable on longer outings.", product: "GoldSeason Spacious Pro", tags: ["Comfort", "Support"] },
  { id: 5, name: "Eddy Simon", location: "Amazon", quote: "This motorized wheelchair feels sturdy and well-built. The large tires handle uneven surfaces and light outdoor terrain better than expected.", product: "GoldSeason Basic 13L", tags: ["Travel", "Support"], image: "/stories/Eddy Simon.jpg" },
  { id: 6, name: "Kimberly Bryant", location: "Amazon", quote: "Good quality. Sturdy and durable. Easy to get in and out of our vehicle.", product: "GoldSeason Travel Air W 03D", tags: ["Travel", "New User"] },
  { id: 7, name: "Michele Guess", location: "Amazon", quote: "Wheelchair is light weight and easy to maneuver. Chair comes with a cushion. My husband loves it!", product: "GoldSeason Travel Air W 03C", tags: ["Travel", "Comfort"], image: "/stories/Michele Guess.jpg" },
  { id: 8, name: "SmashOhh", location: "Amazon", quote: "It is a good chair. Please read the manual two or three times and practice before an outing.", product: "GoldSeason Power Max 16L", tags: ["Support", "New User"], image: "/stories/SmashOhh.jpg" },
];
