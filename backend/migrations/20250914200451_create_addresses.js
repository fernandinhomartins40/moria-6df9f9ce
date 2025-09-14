/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('addresses', function (table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.enum('type', ['home', 'work', 'other']).defaultTo('home');
    table.string('street').notNullable();
    table.string('number').notNullable();
    table.string('complement');
    table.string('neighborhood').notNullable();
    table.string('city').notNullable();
    table.string('state', 2).notNullable();
    table.string('zip_code', 10).notNullable();
    table.boolean('is_default').defaultTo(false);
    table.timestamps(true, true);

    // Indexes
    table.index(['user_id']);
    table.index(['is_default']);
    table.index(['zip_code']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('addresses');
};
