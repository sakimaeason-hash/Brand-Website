export function getAmazonPurchaseLink(purchaseLink?: string | null): string | null {
  if (!purchaseLink) return null;

  try {
    const url = new URL(purchaseLink);
    const isAmazonHost = url.hostname === "amazon.com" || url.hostname.endsWith(".amazon.com");
    return url.protocol === "https:" && isAmazonHost ? purchaseLink : null;
  } catch {
    return null;
  }
}
