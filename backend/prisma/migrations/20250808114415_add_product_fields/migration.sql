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
    "rating" REAL NOT NULL DEFAULT 0,
    "specifications" TEXT,
    "vehicle_compatibility" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_products" ("category", "created_at", "description", "id", "images", "is_active", "name", "price", "promo_price", "rating", "sale_price", "specifications", "stock", "updated_at", "vehicle_compatibility") SELECT "category", "created_at", "description", "id", "images", "is_active", "name", "price", "promo_price", "rating", "sale_price", "specifications", "stock", "updated_at", "vehicle_compatibility" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE INDEX "products_category_idx" ON "products"("category");
CREATE INDEX "products_is_active_idx" ON "products"("is_active");
CREATE INDEX "products_name_idx" ON "products"("name");
CREATE INDEX "products_sku_idx" ON "products"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
