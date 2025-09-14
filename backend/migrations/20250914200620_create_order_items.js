/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('order_items', function (table) {
    table.increments('id').primary();
    table.integer('order_id').unsigned().references('id').inTable('orders').onDelete('CASCADE');
    table.enum('type', ['product', 'service']).notNullable();
    table.integer('item_id').notNullable(); // ID do produto ou serviço
    table.string('item_name').notNullable();
    table.text('item_description');
    table.integer('quantity').notNullable();
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('total_price', 10, 2).notNullable();
    table.decimal('original_unit_price', 10, 2).notNullable(); // Preço original antes de promoções
    table.json('applied_promotions').defaultTo('[]');
    table.json('item_specifications').defaultTo('{}');
    table.timestamps(true, true);

    // Indexes
    table.index(['order_id']);
    table.index(['type']);
    table.index(['item_id']);
    table.index(['type', 'item_id']); // Composite index
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('order_items');
};
