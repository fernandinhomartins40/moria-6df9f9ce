-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "sale_price" REAL,
    "promo_price" REAL,
    "images" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "min_stock" INTEGER NOT NULL DEFAULT 5,
    "sku" TEXT,
    "brand" TEXT,
    "supplier" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'published',
    "rating" REAL NOT NULL DEFAULT 0,
    "specifications" TEXT,
    "vehicle_compatibility" TEXT,
    "cost_price" REAL,
    "internal_notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_products" ("brand", "category", "created_at", "description", "id", "images", "is_active", "min_stock", "name", "price", "promo_price", "rating", "sale_price", "sku", "specifications", "stock", "supplier", "updated_at", "vehicle_compatibility") SELECT "brand", "category", "created_at", "description", "id", "images", "is_active", "min_stock", "name", "price", "promo_price", "rating", "sale_price", "sku", "specifications", "stock", "supplier", "updated_at", "vehicle_compatibility" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "products_is_active_idx" ON "products"("is_active");
CREATE INDEX "products_is_public_idx" ON "products"("is_public");
CREATE INDEX "products_status_idx" ON "products"("status");
CREATE INDEX "products_name_idx" ON "products"("name");
CREATE INDEX "products_sku_idx" ON "products"("sku");
CREATE TABLE "new_promotions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" TEXT NOT NULL,
    "discount_value" REAL NOT NULL,
    "category" TEXT,
    "min_amount" REAL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'published',
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_promotions" ("category", "created_at", "description", "discount_type", "discount_value", "end_date", "id", "is_active", "min_amount", "start_date", "title", "updated_at") SELECT "category", "created_at", "description", "discount_type", "discount_value", "end_date", "id", "is_active", "min_amount", "start_date", "title", "updated_at" FROM "promotions";
DROP TABLE "promotions";
ALTER TABLE "new_promotions" RENAME TO "promotions";
CREATE INDEX "promotions_is_active_idx" ON "promotions"("is_active");
CREATE INDEX "promotions_is_public_idx" ON "promotions"("is_public");
CREATE INDEX "promotions_status_idx" ON "promotions"("status");
CREATE INDEX "promotions_start_date_end_date_idx" ON "promotions"("start_date", "end_date");
CREATE TABLE "new_services" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "base_price" REAL,
    "estimated_time" TEXT,
    "specifications" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'published',
    "internal_cost" REAL,
    "internal_notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_services" ("base_price", "category", "created_at", "description", "estimated_time", "id", "is_active", "name", "specifications", "updated_at") SELECT "base_price", "category", "created_at", "description", "estimated_time", "id", "is_active", "name", "specifications", "updated_at" FROM "services";
DROP TABLE "services";
ALTER TABLE "new_services" RENAME TO "services";
CREATE INDEX "services_is_active_idx" ON "services"("is_active");
CREATE INDEX "services_is_public_idx" ON "services"("is_public");
CREATE INDEX "services_status_idx" ON "services"("status");
CREATE INDEX "services_name_idx" ON "services"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
