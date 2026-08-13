export const FINDER_RULES = {
  seatDepth: {
    kneeClearanceMinMm: 30,
    kneeClearanceMaxMm: 50,
    idealClearanceMm: 40,
    shortfallHardLimitMm: 100,
  },
  footrest: { idealToleranceMm: 20, hardToleranceMm: 50 },
  capacity: { cautionRatio: 0.9 },
  airline: { maxRemovableLithiumWh: 300 },
  scoreWeights: { fit: 55, environment: 20, transport: 15, preferences: 10 },
  outputBands: { best: 85, good: 70, potential: 55 },
  maxRecommendations: 3,
} as const;
