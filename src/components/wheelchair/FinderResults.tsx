"use client";

import { useMemo, useState } from "react";
import type {
  FinderAssessment,
  Recommendation,
  WheelchairCandidate,
} from "@/lib/wheelchair/types";

type Props = {
  result: { recommendations: Recommendation[] } | null;
  assessment: FinderAssessment;
  candidates: readonly WheelchairCandidate[];
  catalogError: boolean;
  onEdit: () => void;
};

const dimensionsText = (dimensions: WheelchairCandidate["foldedMm"]) =>
  `${dimensions.length} x ${dimensions.width} x ${dimensions.height} mm`;

function candidateFacts(candidate: WheelchairCandidate) {
  const common = [
    [
      "Effective seat width / depth",
      `${candidate.effectiveSeatWidthMm} / ${candidate.seatDepthMm} mm`,
    ],
    ["Rated capacity", `${candidate.maxUserWeightKg} kg`],
    ["Seat-to-footrest distance", `${candidate.seatToFootrestMm} mm`],
    ["Folded dimensions", dimensionsText(candidate.foldedMm)],
  ] as const;

  return candidate.mobilityType === "powered"
    ? [
        ...common,
        [
          "Transport weight",
          `${candidate.netWeightWithoutBatteryKg} kg without battery`,
        ] as const,
        ["Listed range", `${candidate.rangeKm} km`] as const,
      ]
    : [
        ...common,
        ["Product weight", `${candidate.productWeightKg} kg`] as const,
        [
          "Propulsion",
          candidate.propulsionType === "self-propel"
            ? "Self-propelled"
            : "Transport / attendant",
        ] as const,
        [
          "Front / rear wheel",
          `${candidate.frontWheelMm} / ${candidate.rearWheelMm} mm`,
        ] as const,
      ];
}

export function FinderResults({
  result,
  assessment,
  candidates,
  catalogError,
  onEdit,
}: Props) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const selectedCandidates = useMemo(
    () =>
      candidates.filter(
        (candidate) => candidate.mobilityType === assessment.mobilityType,
      ),
    [assessment.mobilityType, candidates],
  );
  const candidateByVariant = useMemo(
    () =>
      new Map(
        selectedCandidates.map((candidate) => [candidate.variantId, candidate]),
      ),
    [selectedCandidates],
  );

  if (catalogError || selectedCandidates.length === 0) {
    return (
      <div className="card border-warning p-6" role="status">
        <h3 className="text-xl font-semibold">
          Recommendations are temporarily unavailable
        </h3>
        <p className="mt-2 text-warm-charcoal">
          We could not load a complete, verified {assessment.mobilityType} wheelchair
          catalog. Please try again later or browse the current products directly.
        </p>
        <a className="btn-primary mt-5 inline-flex" href="/products">
          Browse products
        </a>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card p-6">
        <h3 className="text-xl font-semibold">We need to review your answers</h3>
        <p className="mt-2 text-warm-charcoal">
          Some answers are incomplete or outside the supported screening range.
        </p>
        <button type="button" className="btn-secondary mt-5" onClick={onEdit}>
          Edit answers
        </button>
      </div>
    );
  }

  if (result.recommendations.length === 0) {
    return (
      <div className="card border-warning p-6">
        <h3 className="text-xl font-semibold">
          No wheelchair matches the required weight capacity and effective seat width
        </h3>
        <p className="mt-2 text-warm-charcoal">
          These two hard checks are required before we show a product. Recheck your
          weight and seated hip width, or speak with an OT/ATP or other qualified
          professional.
        </p>
        <button type="button" className="btn-secondary mt-5" onClick={onEdit}>
          Remeasure or edit scenarios
        </button>
      </div>
    );
  }

  const toggleCompare = (variantId: string) =>
    setCompareIds((current) =>
      current.includes(variantId)
        ? current.filter((item) => item !== variantId)
        : current.length < 3
          ? [...current, variantId]
          : current,
    );
  const comparedCandidates = compareIds
    .map((variantId) => candidateByVariant.get(variantId))
    .filter((candidate): candidate is WheelchairCandidate => Boolean(candidate));

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h3 className="text-lg font-semibold">Assessment summary</h3>
        <p className="mt-2 text-sm text-warm-charcoal">
          Type:{" "}
          {assessment.mobilityType === "powered"
            ? "Powered wheelchair"
            : "Manual wheelchair"}
          {" | "}Body mode:{" "}
          {assessment.mode === "precision" ? "Precision fit" : "Quick screen"}
          {" | "}Environment: {assessment.use.environment}
          {assessment.mobilityType === "powered" && (
            <> | Daily range: {assessment.use.dailyRangeKm.toFixed(1)} km</>
          )}
        </p>
      </div>

      {result.recommendations.map((recommendation) => {
        const candidate = candidateByVariant.get(recommendation.variantId);
        if (!candidate) return null;
        const detailOpen = detailId === candidate.variantId;

        return (
          <article key={candidate.variantId} className="card overflow-hidden">
            <div className="grid gap-5 p-5 sm:grid-cols-[180px_1fr] sm:p-6">
              <img
                src={candidate.imageUrl}
                alt={candidate.productName}
                className="h-44 w-full rounded-lg object-cover"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge">
                    {recommendation.band === "best"
                      ? "Best match"
                      : recommendation.band === "good"
                        ? "Good match"
                        : "Potential match"}
                  </span>
                  <span className="text-sm text-warm-charcoal">
                    {recommendation.score}/100 | {recommendation.confidence} confidence
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-semibold">
                  {candidate.productName}
                </h3>
                <p className="mt-1 text-xs text-warm-charcoal">SKU: {candidate.sku}</p>
                <ul className="mt-3 space-y-1 text-sm text-warm-charcoal">
                  {recommendation.reasons.map((reason) => (
                    <li key={reason}>- {reason}</li>
                  ))}
                </ul>
                {recommendation.warnings.length > 0 && (
                  <div className="mt-4 rounded-lg bg-blush-cream p-3 text-sm text-warm-charcoal">
                    <p className="font-medium">Please confirm</p>
                    <ul className="mt-1 list-disc pl-5">
                      {recommendation.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-5 flex flex-wrap gap-3 print:hidden">
                  <a
                    className="btn-primary"
                    href={candidate.productUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on Amazon
                  </a>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() =>
                      setDetailId(detailOpen ? null : candidate.variantId)
                    }
                  >
                    {detailOpen ? "Hide details" : "View details"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => toggleCompare(candidate.variantId)}
                  >
                    {compareIds.includes(candidate.variantId)
                      ? "Remove from compare"
                      : "Add to compare"}
                  </button>
                </div>
              </div>
            </div>
            {detailOpen && (
              <div className="border-t border-stone bg-cream p-5">
                <h4 className="font-semibold">Official SKU facts</h4>
                <p className="mt-1 text-xs text-warm-charcoal">
                  Variant ID: {candidate.variantId}
                </p>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  {candidateFacts(candidate).map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-warm-charcoal">{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </article>
        );
      })}

      {comparedCandidates.length > 1 && (
        <div
          className="card overflow-x-auto p-5"
          role="region"
          aria-label="Wheelchair comparison"
        >
          <h3 className="text-lg font-semibold">Compare selected wheelchairs</h3>
          <table role="table" className="mt-4 min-w-full text-left text-sm">
            <thead>
              <tr>
                <th className="p-2">Fact</th>
                {comparedCandidates.map((candidate) => (
                  <th key={candidate.variantId} className="p-2">
                    {candidate.productName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-stone">
                <th className="p-2">Effective seat width</th>
                {comparedCandidates.map((candidate) => (
                  <td key={candidate.variantId} className="p-2">
                    {candidate.effectiveSeatWidthMm} mm
                  </td>
                ))}
              </tr>
              <tr className="border-t border-stone">
                <th className="p-2">Rated capacity</th>
                {comparedCandidates.map((candidate) => (
                  <td key={candidate.variantId} className="p-2">
                    {candidate.maxUserWeightKg} kg
                  </td>
                ))}
              </tr>
              <tr className="border-t border-stone">
                <th className="p-2">
                  {assessment.mobilityType === "powered"
                    ? "Range"
                    : "Product weight"}
                </th>
                {comparedCandidates.map((candidate) => (
                  <td key={candidate.variantId} className="p-2">
                    {candidate.mobilityType === "powered"
                      ? `${candidate.rangeKm} km`
                      : `${candidate.productWeightKg} kg`}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-3 print:hidden">
        <button type="button" className="btn-secondary" onClick={() => window.print()}>
          Print summary
        </button>
        <button type="button" className="btn-secondary" onClick={onEdit}>
          Edit scenarios
        </button>
      </div>
    </div>
  );
}
