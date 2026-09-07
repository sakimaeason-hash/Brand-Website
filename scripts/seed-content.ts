import { prisma } from "../src/lib/db";
import { products as staticProducts, type Product as StaticProduct } from "../src/data/products";
import { stories as staticStories, type StaticStory } from "../src/data/stories";

type SeedDb = {
  product: {
    findUnique(args: { where: { id: string } }): Promise<SeedProductRow | null>;
    findFirst(args: { where: Record<string, unknown> }): Promise<SeedProductRow | null>;
    create(args: { data: Record<string, unknown> }): Promise<SeedProductRow>;
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<SeedProductRow>;
  };
  customerStory: {
    findFirst(args: { where: Record<string, unknown> }): Promise<SeedStoryRow | null>;
    create(args: { data: Record<string, unknown> }): Promise<SeedStoryRow>;
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<SeedStoryRow>;
  };
  productImage: SeedImageDelegate;
  storyImage: SeedImageDelegate;
};

type SeedProductRow = { id: string; name: string; model: string };
type SeedStoryRow = { id: string; displayName: string };
type SeedImageRow = { id?: string; productId?: string; storyId?: string; storagePath: string };
type SeedImageDelegate = {
  findFirst(args: { where: Record<string, unknown> }): Promise<SeedImageRow | null>;
  create(args: { data: Record<string, unknown> }): Promise<SeedImageRow>;
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<SeedImageRow>;
};

type SeedOptions = {
  products?: readonly StaticProduct[];
  stories?: readonly StaticStory[];
};

function productData(product: StaticProduct, sortOrder: number) {
  // Static catalog files provide transport weight, not a verified user weight capacity.
  return {
    id: product.id,
    name: product.name,
    model: product.name,
    category: product.category,
    tagline: product.tagline || null,
    description: null,
    price: product.price,
    originalPrice: product.originalPrice ?? null,
    amazonLink: product.amazonLink ?? null,
    weightCapacity: null,
    seatWidth: product.seatWidth ?? null,
    range: product.range ?? null,
    maxSpeed: product.maxSpeed ?? null,
    productWeight: product.weight ?? null,
    features: [...product.features],
    status: "PUBLISHED" as const,
    isFeatured: Boolean(product.badge),
    sortOrder,
  };
}

function storyData(story: StaticStory, sortOrder: number, productId: string | null) {
  return {
    id: String(story.id),
    displayName: story.name,
    location: story.location || null,
    quote: story.quote,
    productId,
    source: story.location || null,
    tags: [...story.tags],
    status: "PUBLISHED" as const,
    isFeatured: sortOrder < 4,
    sortOrder,
  };
}

async function upsertProduct(client: SeedDb, product: StaticProduct, sortOrder: number) {
  const data = productData(product, sortOrder);
  const existingById = await client.product.findUnique({ where: { id: data.id } });
  const existing = existingById ?? await client.product.findFirst({ where: { name: data.name, model: data.model } });
  const row = existing
    ? await client.product.update({ where: { id: existing.id }, data: (({ id: _id, ...rest }) => rest)(data) })
    : await client.product.create({ data });

  for (let imageIndex = 0; imageIndex < product.images.length; imageIndex += 1) {
    const publicPath = product.images[imageIndex];
    const imageData = {
      productId: row.id,
      storagePath: publicPath,
      publicUrl: publicPath,
      originalName: publicPath.split("/").pop() || `product-${imageIndex}`,
      altText: `${product.name} product image ${imageIndex + 1}`,
      sourceNote: "Existing public asset; seed registers metadata without uploading.",
      sortOrder: imageIndex,
    };
    const existingImage = await client.productImage.findFirst({
      where: { productId: row.id, storagePath: publicPath },
    });
    if (existingImage?.id) {
      await client.productImage.update({ where: { id: existingImage.id }, data: imageData });
    } else {
      await client.productImage.create({ data: imageData });
    }
  }
  return row;
}

async function upsertStory(client: SeedDb, story: StaticStory, sortOrder: number, productId: string | null) {
  const data = storyData(story, sortOrder, productId);
  const existing = await client.customerStory.findFirst({ where: { displayName: data.displayName } });
  const row = existing
    ? await client.customerStory.update({ where: { id: existing.id }, data: (({ id: _id, ...rest }) => rest)(data) })
    : await client.customerStory.create({ data });

  if (story.image) {
    const imageData = {
      storyId: row.id,
      storagePath: story.image,
      publicUrl: story.image,
      originalName: story.image.split("/").pop() || `story-${sortOrder}`,
      altText: `${story.name} customer story image`,
      sourceNote: "Existing public asset; seed registers metadata without uploading.",
      sortOrder: 0,
    };
    const existingImage = await client.storyImage.findFirst({ where: { storyId: row.id, storagePath: story.image } });
    if (existingImage?.id) {
      await client.storyImage.update({ where: { id: existingImage.id }, data: imageData });
    } else {
      await client.storyImage.create({ data: imageData });
    }
  }
  return row;
}

function resolveStoryProductId(story: StaticStory, seededProducts: readonly StaticProduct[]) {
  const normalized = story.product.replace(/^GoldSeason\s+/i, "").toLowerCase();
  return seededProducts.find((product) => normalized.includes(product.name.toLowerCase()) || product.name.toLowerCase().includes(normalized))?.id ?? null;
}

export async function seedContent(client: SeedDb = prisma as unknown as SeedDb, options: SeedOptions = {}) {
  const products = options.products ?? staticProducts;
  const stories = options.stories ?? staticStories;
  const seededProducts = new Map<string, SeedProductRow>();

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    seededProducts.set(product.id, await upsertProduct(client, product, index));
  }

  for (let index = 0; index < stories.length; index += 1) {
    const story = stories[index];
    const productId = resolveStoryProductId(story, products);
    await upsertStory(client, story, index, productId ? seededProducts.get(productId)?.id ?? productId : null);
  }

  return { products: products.length, stories: stories.length };
}

export async function main() {
  try {
    const result = await seedContent();
    console.log(`Seeded ${result.products} products and ${result.stories} customer stories.`);
    return result;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Content seed failed. Check DATABASE_URL and migration status, then retry. ${detail}`);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && /seed-content\.(?:ts|js)$/.test(process.argv[1])) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
