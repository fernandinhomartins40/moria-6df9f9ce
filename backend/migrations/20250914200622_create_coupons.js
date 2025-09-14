/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('coupons', function (table) {
    table.increments('id').primary();
    table.string('code').unique().notNullable();
    table.text('description');
    table.enum('discount_type', ['percentage', 'fixed']).notNullable();
    table.decimal('discount_value', 10, 2).notNullable();
    table.decimal('min_amount', 10, 2).nullable();
    table.decimal('max_discount', 10, 2).nullable();
    table.integer('max_uses').nullable(); // Limite total de usos
    table.integer('max_uses_per_user').defaultTo(1); // Limite por usuário
    table.integer('used_count').defaultTo(0);
    table.date('starts_at').nullable();
    table.date('expires_at').nullable();
    table.boolean('is_active').defaultTo(true);
    table.boolean('first_purchase_only').defaultTo(false);
    table.json('applicable_categories').defaultTo('[]'); // Categorias aplicáveis
    table.json('applicable_products').defaultTo('[]'); // Produtos específicos
    table.timestamps(true, true);

    // Indexes
    table.index(['code']);
    table.index(['is_active']);
    table.index(['expires_at']);
    table.index(['starts_at']);
    table.index(['is_active', 'starts_at', 'expires_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('coupons');
};
