import { WheelchairFinderClient } from "@/components/wheelchair/WheelchairFinderClient";
import { listFinderCandidates } from "@/lib/wheelchair/catalog";

export default async function WheelchairFinderPage() {
  try {
    const catalog = await listFinderCandidates();
    return (
      <WheelchairFinderClient
        candidates={catalog.candidates}
        catalogError={catalog.candidates.length === 0}
      />
    );
  } catch {
    return <WheelchairFinderClient candidates={[]} catalogError />;
  }
}
