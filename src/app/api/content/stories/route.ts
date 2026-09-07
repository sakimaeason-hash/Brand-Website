import { NextResponse } from "next/server";
import { listPublishedStories } from "@/lib/content/repository";

export async function GET() {
  return NextResponse.json(await listPublishedStories(), {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
