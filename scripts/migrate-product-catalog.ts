import { prisma } from "../src/lib/db";
import { products as staticProducts, type Product as StaticProduct } from "../src/data/products";
import { OFFICIAL_WHEELCHAIR_SPECS } from "../src/data/wheelchair-specs";
import type {
  DimensionsMm,
  VerificationStatus,
  WheelchairProductSpec,
  WheelchairVariantSpec,
} from "../src/lib/wheelchair/types";
import type {
  DimensionsValue,
  SpecificationMap,
  StoredSpecification,
} from "../src/lib/catalog/types";
import { seedProductCategories } from "./seed-product-categories";

export type CatalogMigrationVariant = {
  sku: string;
  factoryModel: string | null;
  label: string;
  specifications: SpecificationMap;
};

export type CatalogMigrationProduct = {
  productId: string;
  storefrontName: string;
  model: string;
  categorySlug: "powered-wheelchairs" | "mobility-scooters";
  variants: CatalogMigrationVariant[];
  reviewReasons: string[];
};

export type MigrationSummary = {
  productsUpdated: number;
  variantsUpserted: number;
  productsNeedingReview: Array<{
    productId: string;
    reasons: string[];
  }>;
};

type MigrationCategoryRow = {
  id: string;
  slug: string;
  status: string;
  templateVersion: number;
};

type MigrationProductRow = {
  id: string;
  amazonLink: string | null;
};

type MigrationTransaction = {
  product: {
    update(args: {
      where: { id: string };
      data: Record<string, unknown>;
    }): Promise<unknown>;
  };
  productVariant: {
    findUnique(args: {
      where: { sku: string };
    }): Promise<{ productId: string } | null>;
    upsert(args: Record<string, unknown>): Promise<unknown>;
    updateMany(args: Record<string, unknown>): Promise<unknown>;
  };
};

type MigrationClient = MigrationTransaction & {
  product: MigrationTransaction["product"] & {
    findUnique(args: {
      where: { id: string };
    }): Promise<MigrationProductRow | null>;
  };
  productCategory: {
    findUnique(args: {
      where: { slug: string };
    }): Promise<MigrationCategoryRow | null>;
  };
  specificationField: {
    upsert(args: Record<string, unknown>): Promise<unknown>;
  };
  $transaction<T>(callback: (tx: MigrationTransaction) => Promise<T>): Promise<T>;
};

type MigrationOptions = {
  dryRun?: boolean;
};

const statusFor = (
  status: VerificationStatus | undefined,
  value: unknown,
): StoredSpecification["status"] => {
  if (status === "conflicting") return "CONFLICTING";
  if (status === "missing" || value === null || value === undefined) {
    return "NOT_PROVIDED";
  }
  return "PROVIDED";
};

function sourceNote(variant: WheelchairVariantSpec): string {
  const evidence = Object.entries(variant.source.raw)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
  return [
    `Official workbook columns ${variant.source.workbookColumns}.`,
    evidence ? `Raw evidence: ${evidence}.` : "",
    ...variant.source.notes,
  ]
    .filter(Boolean)
    .join(" ");
}

function numericSpecification(
  value: number | null,
  unit: string,
  note: string,
  verification?: VerificationStatus,
): StoredSpecification {
  const status = statusFor(verification, value);
  if (status === "NOT_PROVIDED") {
    return { status, value: null, sourceNote: note };
  }
  return {
    status,
    value,
    inputValue: value ?? undefined,
    inputUnit: unit,
    normalizedValue: value ?? undefined,
    normalizedUnit: unit,
    sourceNote: note,
  };
}

function dimensionsSpecification(
  value: DimensionsMm,
  note: string,
): StoredSpecification {
  const dimensions: DimensionsValue = {
    length: value.length,
    width: value.width,
    height: value.height,
  };
  return {
    status: "PROVIDED",
    value: dimensions,
    inputValue: dimensions,
    inputUnit: "mm",
    normalizedValue: dimensions,
    normalizedUnit: "mm",
    sourceNote: note,
  };
}

function scalarSpecification(
  value: string | boolean,
  note: string,
): StoredSpecification {
  return {
    status: "PROVIDED",
    value,
    sourceNote: note,
  };
}

const catalogTireClass = (value: WheelchairVariantSpec["tireClass"]) =>
  value === "mixed-pneumatic"
    ? "pneumatic"
    : value === "foam"
      ? "foam-filled"
      : value;

function officialSpecifications(variant: WheelchairVariantSpec): SpecificationMap {
  const note = sourceNote(variant);
  const status = variant.source.status;
  return {
    maxUserWeight: numericSpecification(variant.maxUserWeightKg, "kg", note),
    effectiveSeatWidth: numericSpecification(variant.seatWidthMm, "mm", note),
    seatDepth: numericSpecification(variant.seatDepthMm, "mm", note),
    cushionWidth: numericSpecification(
      variant.cushionWidthMm,
      "mm",
      note,
      status.cushionWidthMm,
    ),
    cushionDepth: numericSpecification(variant.cushionDepthMm, "mm", note),
    seatHeight: numericSpecification(variant.seatHeightMm, "mm", note),
    armrestSpacing: numericSpecification(variant.armrestSpacingMm, "mm", note),
    seatToFootrest: numericSpecification(variant.seatToFootrestMm, "mm", note),
    overallDimensions: dimensionsSpecification(variant.overallMm, note),
    foldedDimensions: dimensionsSpecification(variant.foldedMm, note),
    netWeightWithoutBattery: numericSpecification(
      variant.netWeightWithoutBatteryKg,
      "kg",
      note,
    ),
    batteryWeight: numericSpecification(
      variant.batteryWeightKg,
      "kg",
      note,
      status.batteryWeightKg,
    ),
    range: numericSpecification(variant.rangeKm, "km", note),
    maxSpeed: numericSpecification(variant.maxSpeedKph, "km/h", note),
    turningRadius: numericSpecification(variant.turningRadiusMm, "mm", note),
    obstacleHeight: numericSpecification(variant.obstacleHeightMm, "mm", note),
    frontWheelDiameter: numericSpecification(variant.frontWheelMm, "mm", note),
    rearWheelDiameter: numericSpecification(variant.rearWheelMm, "mm", note),
    tireClass: scalarSpecification(catalogTireClass(variant.tireClass), note),
    batteryChemistry: scalarSpecification(variant.battery.chemistry, note),
    batteryRemovable: scalarSpecification(variant.battery.removable, note),
    batteryVoltage: numericSpecification(
      variant.battery.voltageV,
      "V",
      note,
      status.batteryVoltageV,
    ),
    batteryCapacityAh: numericSpecification(
      variant.battery.capacityAh,
      "Ah",
      note,
    ),
    manufacturerAirplaneFlag: scalarSpecification(
      variant.battery.manufacturerAirplaneFlag,
      note,
    ),
  };
}

function officialProductMigration(
  product: StaticProduct,
  official: WheelchairProductSpec,
): CatalogMigrationProduct {
  const variants = official.variants.map((variant) => ({
    sku: variant.variantId,
    factoryModel: variant.factoryModel,
    label: variant.variantId,
    specifications: officialSpecifications(variant),
  }));
  return {
    productId: product.id,
    storefrontName: product.name,
    model: official.officialFamily,
    categorySlug: "powered-wheelchairs",
    reviewReasons: variants.flatMap((variant, index) => [
      ...Object.entries(variant.specifications)
        .filter(([, specification]) => specification.status !== "PROVIDED")
        .map(
          ([field, specification]) =>
            `${variant.sku}: ${field} is ${specification.status
              .toLowerCase()
              .replace("_", " ")}.`,
        ),
      ...official.variants[index].source.notes.map(
        (note) => `${variant.sku}: ${note}`,
      ),
    ]),
    variants,
  };
}

function legacyProductMigration(product: StaticProduct): CatalogMigrationProduct {
  return {
    productId: product.id,
    storefrontName: product.name,
    model: product.name,
    categorySlug: "mobility-scooters",
    reviewReasons: [],
    variants: [
      {
        sku: `LEGACY-${product.id.toUpperCase()}`,
        factoryModel: null,
        label: "Default",
        specifications: {},
      },
    ],
  };
}

export function buildCatalogMigrationPlan(
  products: readonly StaticProduct[] = staticProducts,
  officialProducts: readonly WheelchairProductSpec[] = OFFICIAL_WHEELCHAIR_SPECS,
): CatalogMigrationProduct[] {
  const officialByProduct = new Map(
    officialProducts.map((product) => [product.productId, product]),
  );

  return products.map((product) => {
    const official = officialByProduct.get(product.id);
    if (product.category === "wheelchair") {
      if (!official) {
        throw new Error(
          `Official specifications are missing for ${product.name} (${product.id}).`,
        );
      }
      return officialProductMigration(product, official);
    }
    return legacyProductMigration(product);
  });
}

async function loadMigrationCategories(client: MigrationClient) {
  const entries = await Promise.all(
    (["powered-wheelchairs", "mobility-scooters"] as const).map(
      async (slug) => [slug, await client.productCategory.findUnique({ where: { slug } })] as const,
    ),
  );
  const categories = new Map(entries);
  for (const [slug, category] of entries) {
    if (!category || category.status !== "ACTIVE") {
      throw new Error(`Active product category ${slug} is required before migration.`);
    }
  }
  return categories as Map<
    CatalogMigrationProduct["categorySlug"],
    MigrationCategoryRow
  >;
}

export async function migrateProductCatalog(
  client: MigrationClient = prisma as unknown as MigrationClient,
  options: MigrationOptions = {},
): Promise<MigrationSummary> {
  if (!options.dryRun) {
    await seedProductCategories(client as never);
  }

  const categories = await loadMigrationCategories(client);
  const plan = buildCatalogMigrationPlan();
  const summary: MigrationSummary = {
    productsUpdated: 0,
    variantsUpserted: 0,
    productsNeedingReview: [],
  };

  for (const product of plan) {
    const existing = await client.product.findUnique({
      where: { id: product.productId },
    });
    if (!existing) {
      summary.productsNeedingReview.push({
        productId: product.productId,
        reasons: ["Product record was not found; run the content seed first."],
      });
      continue;
    }

    const category = categories.get(product.categorySlug)!;
    const reasons = [...product.reviewReasons];
    if (!existing.amazonLink?.trim()) {
      reasons.push("Amazon purchase link is not provided.");
    }
    if (reasons.length > 0) {
      summary.productsNeedingReview.push({
        productId: product.productId,
        reasons: Array.from(new Set(reasons)),
      });
    }
    summary.productsUpdated += 1;
    summary.variantsUpserted += product.variants.length;

    if (options.dryRun) continue;

    await client.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: product.productId },
        data: {
          model: product.model,
          categoryId: category.id,
          categoryTemplateVersion: category.templateVersion,
        },
      });

      if (product.categorySlug === "powered-wheelchairs") {
        await tx.productVariant.updateMany({
          where: {
            productId: product.productId,
            sku: `LEGACY-${product.productId.toUpperCase()}`,
          },
          data: { isActive: false },
        });
      }

      for (let index = 0; index < product.variants.length; index += 1) {
        const variant = product.variants[index];
        const existingVariant = await tx.productVariant.findUnique({
          where: { sku: variant.sku },
        });
        if (
          existingVariant &&
          existingVariant.productId !== product.productId
        ) {
          throw new Error(
            `SKU ${variant.sku} belongs to a different product; migration stopped.`,
          );
        }
        await tx.productVariant.upsert({
          where: { sku: variant.sku },
          create: {
            productId: product.productId,
            sku: variant.sku,
            factoryModel: variant.factoryModel,
            label: variant.label,
            specifications: variant.specifications,
            isActive: true,
            sortOrder: index,
          },
          update: {
            factoryModel: variant.factoryModel,
            label: variant.label,
            specifications: variant.specifications,
            isActive: true,
            sortOrder: index,
          },
        });
      }
    });
  }

  return summary;
}

export async function main() {
  const dryRun = process.argv.includes("--dry-run");
  try {
    const result = await migrateProductCatalog(
      prisma as unknown as MigrationClient,
      { dryRun },
    );
    console.log(JSON.stringify({ dryRun, ...result }, null, 2));
    return result;
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && /migrate-product-catalog\.(?:ts|js)$/.test(process.argv[1])) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
