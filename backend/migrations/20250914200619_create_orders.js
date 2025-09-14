/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('orders', function (table) {
    table.increments('id').primary();
    table.string('order_number').unique().notNullable();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable();
    table.string('customer_name').notNullable();
    table.string('customer_email').notNullable();
    table.string('customer_phone').notNullable();
    table.json('customer_address').notNullable();
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('discount_amount', 10, 2).defaultTo(0);
    table.decimal('shipping_cost', 10, 2).defaultTo(0);
    table.decimal('total_amount', 10, 2).notNullable();
    table.enum('status', ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled']).defaultTo('pending');
    table.enum('payment_method', ['cash', 'pix', 'credit_card', 'debit_card', 'bank_transfer']).notNullable();
    table.enum('payment_status', ['pending', 'paid', 'failed', 'refunded']).defaultTo('pending');
    table.text('notes');
    table.text('admin_notes');
    table.string('coupon_code');
    table.decimal('coupon_discount', 10, 2).defaultTo(0);
    table.json('applied_promotions').defaultTo('[]');
    table.timestamp('confirmed_at').nullable();
    table.timestamp('shipped_at').nullable();
    table.timestamp('delivered_at').nullable();
    table.timestamps(true, true);

    // Indexes
    table.index(['user_id']);
    table.index(['status']);
    table.index(['payment_status']);
    table.index(['order_number']);
    table.index(['customer_email']);
    table.index(['created_at']);
    table.index(['coupon_code']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('orders');
};
