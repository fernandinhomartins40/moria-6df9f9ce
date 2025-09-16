/**
 * Migration: Create product_images table
 * Tabela pivot para relacionamento many-to-many entre produtos e imagens
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('product_images', function (table) {
    table.increments('id').primary();
    table.integer('product_id').notNullable();
    table.integer('image_id').notNullable();
    table.integer('sort_order').defaultTo(0); // Ordem de exibição
    table.boolean('is_primary').defaultTo(false); // Se é a imagem principal
    table.boolean('is_active').defaultTo(true); // Se está ativa
    table.timestamps(true, true);

    // Indexes
    table.index(['product_id']);
    table.index(['image_id']);
    table.index(['sort_order']);
    table.index(['is_primary']);
    table.index(['is_active']);

    // Unique constraint para evitar duplicatas
    table.unique(['product_id', 'image_id']);

    // Foreign keys
    table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.foreign('image_id').references('id').inTable('images').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('product_images');
};