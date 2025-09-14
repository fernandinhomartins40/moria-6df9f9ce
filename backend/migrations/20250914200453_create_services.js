/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('services', function (table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.string('category').notNullable();
    table.decimal('base_price', 10, 2).notNullable();
    table.string('estimated_time');
    table.json('specifications').defaultTo('{}');
    table.boolean('is_active').defaultTo(true);
    table.decimal('rating', 2, 1).defaultTo(0);
    table.integer('rating_count').defaultTo(0);
    table.integer('bookings_count').defaultTo(0);
    table.json('required_items').defaultTo('[]');
    table.text('instructions');
    table.timestamps(true, true);

    // Indexes
    table.index(['category']);
    table.index(['is_active']);
    table.index(['base_price']);
    table.index(['rating']);
    table.index(['created_at']);
    table.index(['name']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('services');
};
