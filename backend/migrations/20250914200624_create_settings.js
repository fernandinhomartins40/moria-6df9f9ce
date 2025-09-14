/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('settings', function (table) {
    table.increments('id').primary();
    table.string('key').unique().notNullable();
    table.text('value');
    table.text('description');
    table.string('category').defaultTo('general');
    table.enum('type', ['string', 'number', 'boolean', 'json', 'text']).defaultTo('string');
    table.boolean('is_public').defaultTo(false); // Se pode ser acessado pelo frontend
    table.boolean('is_editable').defaultTo(true); // Se pode ser editado pelo admin
    table.timestamps(true, true);

    // Indexes
    table.index(['key']);
    table.index(['category']);
    table.index(['is_public']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('settings');
};
