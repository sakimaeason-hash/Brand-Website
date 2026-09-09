import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../src/lib/db";
import { BUILTIN_CATEGORIES } from "../src/lib/catalog/builtin-templates";

type SeedClient = Pick<PrismaClient, "productCategory" | "specificationField"> & {
  $transaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
};

export async function seedProductCategories(client: SeedClient = prisma) {
  return client.$transaction(async (tx) => {
    let fieldCount = 0;
    for (const category of BUILTIN_CATEGORIES) {
      const row = await tx.productCategory.upsert({
        where: { slug: category.slug },
        create: {
          name: category.name,
          slug: category.slug,
          description: category.description,
          role: category.role,
          recommendationProfile: category.recommendationProfile,
          status: "ACTIVE",
          sortOrder: category.sortOrder,
          templateVersion: 1,
        },
        update: {
          name: category.name,
          description: category.description,
          role: category.role,
          recommendationProfile: category.recommendationProfile,
          status: "ACTIVE",
          sortOrder: category.sortOrder,
        },
      });

      for (const field of category.fields) {
        fieldCount += 1;
        const protectedData = {
          label: field.label,
          group: field.group,
          scope: field.scope,
          dataType: field.dataType,
          unitFamily: field.unitFamily,
          defaultDisplayUnit: field.defaultDisplayUnit,
          options: [...field.options],
          helpText: field.helpText,
          minValue: field.minValue,
          maxValue: field.maxValue,
          requiredForPublish: field.requiredForPublish,
          requiredForRecommendation: field.requiredForRecommendation,
          semanticKey: field.semanticKey,
          isProtected: field.isProtected,
          status: field.status,
          sortOrder: field.sortOrder,
        };
        await tx.specificationField.upsert({
          where: { categoryId_key: { categoryId: row.id, key: field.key } },
          create: { categoryId: row.id, key: field.key, ...protectedData },
          update: field.isProtected ? protectedData : {},
        });
      }
    }
    return { categories: BUILTIN_CATEGORIES.length, fields: fieldCount };
  });
}

export async function main() {
  try {
    const result = await seedProductCategories();
    console.log(`Seeded ${result.categories} product categories and ${result.fields} specification fields.`);
    return result;
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Product category seed failed. Check DATABASE_URL and migration status, then retry. ${detail}`);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && /seed-product-categories\.(?:ts|js)$/.test(process.argv[1])) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
