-- Additive content-management tables. Existing commerce tables are untouched.
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED');

CREATE TABLE "content_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'wheelchair',
    "tagline" TEXT,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "originalPrice" DECIMAL(10,2),
    "amazonLink" TEXT,
    "weightCapacity" TEXT,
    "seatWidth" TEXT,
    "range" TEXT,
    "maxSpeed" TEXT,
    "productWeight" TEXT,
    "features" JSONB NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "content_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "content_product_images" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "altText" TEXT,
    "sourceNote" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "content_product_images_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "content_customer_stories" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "location" TEXT,
    "quote" TEXT NOT NULL,
    "productId" TEXT,
    "source" TEXT,
    "tags" JSONB NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "content_customer_stories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "content_story_images" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "altText" TEXT,
    "sourceNote" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "content_story_images_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "content_promotions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "salePrice" DECIMAL(10,2),
    "discountPercent" DECIMAL(5,2),
    "label" TEXT,
    "bannerImageUrl" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "isAutoScheduleEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "content_promotions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "content_products_status_sortOrder_idx" ON "content_products"("status", "sortOrder");
CREATE INDEX "content_product_images_productId_sortOrder_idx" ON "content_product_images"("productId", "sortOrder");
CREATE INDEX "content_customer_stories_status_sortOrder_idx" ON "content_customer_stories"("status", "sortOrder");
CREATE INDEX "content_story_images_storyId_sortOrder_idx" ON "content_story_images"("storyId", "sortOrder");
CREATE INDEX "content_promotions_status_startAt_endAt_idx" ON "content_promotions"("status", "startAt", "endAt");

ALTER TABLE "content_product_images" ADD CONSTRAINT "content_product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "content_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_customer_stories" ADD CONSTRAINT "content_customer_stories_productId_fkey" FOREIGN KEY ("productId") REFERENCES "content_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "content_story_images" ADD CONSTRAINT "content_story_images_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "content_customer_stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "content_promotions" ADD CONSTRAINT "content_promotions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "content_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
