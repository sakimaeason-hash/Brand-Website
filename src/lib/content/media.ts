export type ImageMetadata = {
  altText: string | null;
  sourceNote: string | null;
};

function optionalText(value: unknown, field: string): string | null {
  if (value == null) return null;
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  return value.trim() || null;
}

export function parseImageMetadata(raw: string | null, expectedCount: number): ImageMetadata[] {
  if (!Number.isInteger(expectedCount) || expectedCount < 0) {
    throw new Error("Expected image count must be a non-negative integer");
  }

  if (raw == null || raw === "") {
    if (expectedCount === 0) return [];
    throw new Error("Image metadata must match uploaded images");
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("Image metadata must be valid JSON");
  }

  if (!Array.isArray(value) || value.length !== expectedCount) {
    throw new Error("Image metadata must match uploaded images");
  }

  return value.map((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error("Image metadata entries must be objects");
    }

    const fields = Object.keys(entry);
    if (fields.some((field) => field !== "altText" && field !== "sourceNote")) {
      throw new Error("Image metadata contains unsupported fields");
    }

    const metadata = entry as Record<string, unknown>;
    return {
      altText: optionalText(metadata.altText, "altText"),
      sourceNote: optionalText(metadata.sourceNote, "sourceNote"),
    };
  });
}

export function shouldRemoveFromContentStorage(path: string): boolean {
  return /^(products|stories)\/[a-zA-Z0-9_-]+\/[a-f0-9-]+-\d+-[a-zA-Z0-9._-]+$/.test(path)
    || /^https:\/\/[a-zA-Z0-9.-]+\.public\.blob\.vercel-storage\.com\/(products|stories)\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9-]+-\d+-[a-zA-Z0-9._-]+$/.test(path);
}
