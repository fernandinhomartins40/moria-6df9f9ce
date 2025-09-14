/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('promotions', function (table) {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table.enum('type', ['product', 'category', 'general']).notNullable();
    table.json('conditions').defaultTo('{}');
    table.enum('discount_type', ['percentage', 'fixed', 'free_shipping']).notNullable();
    table.decimal('discount_value', 10, 2).notNullable();
    table.decimal('max_discount', 10, 2).nullable();
    table.string('category').nullable();
    table.decimal('min_amount', 10, 2).nullable();
    table.integer('max_uses_per_customer').nullable();
    table.integer('total_uses').defaultTo(0);
    table.integer('max_total_uses').nullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('priority').defaultTo(0); // Para ordenar aplicação de promoções
    table.timestamps(true, true);

    // Indexes
    table.index(['type']);
    table.index(['category']);
    table.index(['is_active']);
    table.index(['start_date']);
    table.index(['end_date']);
    table.index(['priority']);
    table.index(['is_active', 'start_date', 'end_date']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('promotions');
};
