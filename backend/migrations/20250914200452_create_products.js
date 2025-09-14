/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('products', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.string('category').notNullable();
    table.string('subcategory');
    table.decimal('price', 10, 2).notNullable();
    table.decimal('sale_price', 10, 2).nullable();
    table.decimal('promo_price', 10, 2).nullable();
    table.decimal('cost_price', 10, 2).nullable();
    table.json('images').defaultTo('[]');
    table.integer('stock').defaultTo(0);
    table.integer('min_stock').defaultTo(0);
    table.string('sku').unique();
    table.string('supplier');
    table.boolean('is_active').defaultTo(true);
    table.decimal('rating', 2, 1).defaultTo(0);
    table.integer('rating_count').defaultTo(0);
    table.json('specifications').defaultTo('{}');
    table.json('vehicle_compatibility').defaultTo('[]');
    table.integer('views_count').defaultTo(0);
    table.integer('sales_count').defaultTo(0);
    table.timestamps(true, true);

    // Indexes
    table.index(['category']);
    table.index(['subcategory']);
    table.index(['is_active']);
    table.index(['price']);
    table.index(['stock']);
    table.index(['rating']);
    table.index(['created_at']);
    table.index(['supplier']);
    table.index(['name']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('products');
};
