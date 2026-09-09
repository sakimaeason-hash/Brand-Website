-- Additive catalog migration. Existing product fields remain for compatibility.
CREATE TYPE "ProductCategoryRole" AS ENUM ('PRODUCT', 'ACCESSORY');
CREATE TYPE "RecommendationProfile" AS ENUM ('NONE', 'POWERED_WHEELCHAIR', 'MANUAL_WHEELCHAIR');
CREATE TYPE "CatalogRecordStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "SpecificationScope" AS ENUM ('PRODUCT', 'VARIANT');
CREATE TYPE "SpecificationDataType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'DIMENSIONS');

CREATE TABLE "content_product_categories" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "role" "ProductCategoryRole" NOT NULL DEFAULT 'PRODUCT',
  "recommendationProfile" "RecommendationProfile" NOT NULL DEFAULT 'NONE',
  "status" "CatalogRecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "templateVersion" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "content_product_categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "content_product_categories_slug_key" ON "content_product_categories"("slug");
CREATE INDEX "content_product_categories_status_sortOrder_idx" ON "content_product_categories"("status", "sortOrder");

CREATE TABLE "content_specification_fields" (
  "id" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "group" TEXT NOT NULL,
  "scope" "SpecificationScope" NOT NULL,
  "dataType" "SpecificationDataType" NOT NULL,
  "unitFamily" TEXT NOT NULL DEFAULT 'NONE',
  "defaultDisplayUnit" TEXT,
  "options" JSONB NOT NULL DEFAULT '[]',
  "helpText" TEXT,
  "minValue" DECIMAL(12,4),
  "maxValue" DECIMAL(12,4),
  "requiredForPublish" BOOLEAN NOT NULL DEFAULT false,
  "requiredForRecommendation" BOOLEAN NOT NULL DEFAULT false,
  "semanticKey" TEXT,
  "isProtected" BOOLEAN NOT NULL DEFAULT false,
  "status" "CatalogRecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "content_specification_fields_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "content_specification_fields_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "content_product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "content_specification_fields_categoryId_key_key" ON "content_specification_fields"("categoryId", "key");
CREATE UNIQUE INDEX "content_specification_fields_categoryId_semanticKey_key" ON "content_specification_fields"("categoryId", "semanticKey");
CREATE INDEX "content_specification_fields_categoryId_status_sortOrder_idx" ON "content_specification_fields"("categoryId", "status", "sortOrder");

ALTER TABLE "content_products" ADD COLUMN "categoryId" TEXT;
ALTER TABLE "content_products" ADD COLUMN "specifications" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "content_products" ADD COLUMN "categoryTemplateVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "content_products" ADD CONSTRAINT "content_products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "content_product_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "content_product_variants" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "factoryModel" TEXT,
  "label" TEXT,
  "colorName" TEXT,
  "colorHex" TEXT,
  "priceOverride" DECIMAL(10,2),
  "originalPriceOverride" DECIMAL(10,2),
  "purchaseLinkOverride" TEXT,
  "specifications" JSONB NOT NULL DEFAULT '{}',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "content_product_variants_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "content_product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "content_products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "content_product_variants_sku_key" ON "content_product_variants"("sku");
CREATE INDEX "content_product_variants_productId_isActive_sortOrder_idx" ON "content_product_variants"("productId", "isActive", "sortOrder");

CREATE TABLE "content_product_in_box_items" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "note" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "content_product_in_box_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "content_product_in_box_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "content_products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "content_product_in_box_items_productId_sortOrder_idx" ON "content_product_in_box_items"("productId", "sortOrder");

CREATE TABLE "content_product_accessories" (
  "productId" TEXT NOT NULL,
  "accessoryProductId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "content_product_accessories_pkey" PRIMARY KEY ("productId", "accessoryProductId"),
  CONSTRAINT "content_product_accessories_productId_fkey" FOREIGN KEY ("productId") REFERENCES "content_products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "content_product_accessories_accessoryProductId_fkey" FOREIGN KEY ("accessoryProductId") REFERENCES "content_products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "content_product_accessories_accessoryProductId_idx" ON "content_product_accessories"("accessoryProductId");

INSERT INTO "content_product_categories" ("id", "name", "slug", "description", "role", "recommendationProfile", "sortOrder") VALUES
  ('builtin-powered-wheelchairs', 'Powered Wheelchairs', 'powered-wheelchairs', 'Electric wheelchair products with fit and performance specifications.', 'PRODUCT', 'POWERED_WHEELCHAIR', 10),
  ('builtin-manual-wheelchairs', 'Manual Wheelchairs', 'manual-wheelchairs', 'Manual wheelchair products with fit and mobility specifications.', 'PRODUCT', 'MANUAL_WHEELCHAIR', 20),
  ('builtin-mobility-scooters', 'Mobility Scooters', 'mobility-scooters', 'Mobility scooters and travel scooters.', 'PRODUCT', 'NONE', 30),
  ('builtin-shower-chairs', 'Shower Chairs', 'shower-chairs', 'Shower and bath seating products.', 'PRODUCT', 'NONE', 40),
  ('builtin-accessories', 'Accessories', 'accessories', 'Independently purchasable compatible accessories.', 'ACCESSORY', 'NONE', 50)
ON CONFLICT ("slug") DO NOTHING;

UPDATE "content_products"
SET "categoryId" = CASE
  WHEN LOWER("category") = 'wheelchair' THEN 'builtin-powered-wheelchairs'
  WHEN LOWER("category") = 'scooter' THEN 'builtin-mobility-scooters'
  ELSE NULL
END
WHERE "categoryId" IS NULL;
