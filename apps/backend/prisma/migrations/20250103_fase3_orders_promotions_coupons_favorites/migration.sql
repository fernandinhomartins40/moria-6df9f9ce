-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('WEB', 'APP', 'PHONE');

-- CreateEnum
CREATE TYPE "OrderItemType" AS ENUM ('PRODUCT', 'SERVICE');

-- AlterTable - Add relations to Customer
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "orders" TEXT[];
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "favorites" TEXT[];

-- CreateTable Order
CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "source" "OrderSource" NOT NULL DEFAULT 'WEB',
    "hasProducts" BOOLEAN NOT NULL DEFAULT false,
    "hasServices" BOOLEAN NOT NULL DEFAULT false,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "trackingCode" TEXT,
    "estimatedDelivery" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "couponCode" TEXT,
    "appliedPromotions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable OrderItem
CREATE TABLE IF NOT EXISTS "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "serviceId" TEXT,
    "type" "OrderItemType" NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable Promotion
CREATE TABLE IF NOT EXISTS "promotions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "bannerImage" TEXT,
    "badgeText" TEXT,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "customerSegments" JSONB NOT NULL,
    "geographicRestrictions" JSONB,
    "deviceTypes" JSONB,
    "rules" JSONB NOT NULL,
    "tiers" JSONB,
    "targetProductIds" JSONB,
    "targetCategories" JSONB,
    "targetBrands" JSONB,
    "targetPriceRange" JSONB,
    "excludeProductIds" JSONB,
    "excludeCategories" JSONB,
    "rewards" JSONB NOT NULL,
    "schedule" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "usageLimit" INTEGER,
    "usageLimitPerCustomer" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "canCombineWithOthers" BOOLEAN NOT NULL DEFAULT false,
    "excludePromotionIds" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "code" TEXT,
    "autoApply" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "analytics" JSONB,
    "createdBy" TEXT NOT NULL,
    "lastModifiedBy" TEXT,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "tags" JSONB,
    "notes" TEXT,
    "customLogic" TEXT,
    "webhookUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable Coupon
CREATE TABLE IF NOT EXISTS "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "minValue" DECIMAL(10,2),
    "maxDiscount" DECIMAL(10,2),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable Favorite
CREATE TABLE IF NOT EXISTS "favorites" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orders_customerId_idx" ON "orders"("customerId");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "orders_createdAt_idx" ON "orders"("createdAt");

CREATE INDEX IF NOT EXISTS "order_items_orderId_idx" ON "order_items"("orderId");
CREATE INDEX IF NOT EXISTS "order_items_productId_idx" ON "order_items"("productId");
CREATE INDEX IF NOT EXISTS "order_items_serviceId_idx" ON "order_items"("serviceId");

CREATE UNIQUE INDEX IF NOT EXISTS "promotions_code_key" ON "promotions"("code");
CREATE INDEX IF NOT EXISTS "promotions_code_idx" ON "promotions"("code");
CREATE INDEX IF NOT EXISTS "promotions_startDate_idx" ON "promotions"("startDate");
CREATE INDEX IF NOT EXISTS "promotions_endDate_idx" ON "promotions"("endDate");
CREATE INDEX IF NOT EXISTS "promotions_isActive_idx" ON "promotions"("isActive");

CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_key" ON "coupons"("code");
CREATE INDEX IF NOT EXISTS "coupons_code_idx" ON "coupons"("code");
CREATE INDEX IF NOT EXISTS "coupons_expiresAt_idx" ON "coupons"("expiresAt");
CREATE INDEX IF NOT EXISTS "coupons_isActive_idx" ON "coupons"("isActive");

CREATE UNIQUE INDEX IF NOT EXISTS "favorites_customerId_productId_key" ON "favorites"("customerId", "productId");
CREATE INDEX IF NOT EXISTS "favorites_customerId_idx" ON "favorites"("customerId");
CREATE INDEX IF NOT EXISTS "favorites_productId_idx" ON "favorites"("productId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "favorites" ADD CONSTRAINT "favorites_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
