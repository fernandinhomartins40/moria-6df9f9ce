/**
 * Migration: Create image_operations table
 * Tabela para rastrear operações realizadas em imagens (crop, resize, etc.)
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('image_operations', function (table) {
    table.increments('id').primary();
    table.integer('image_id').notNullable();
    table.enum('operation_type', ['upload', 'crop', 'resize', 'compress', 'delete']).notNullable();
    table.json('parameters').defaultTo('{}'); // Parâmetros da operação
    table.json('result').defaultTo('{}'); // Resultado da operação
    table.enum('status', ['pending', 'processing', 'completed', 'failed']).defaultTo('pending');
    table.string('error_message').nullable(); // Mensagem de erro se falhou
    table.integer('processing_time').nullable(); // Tempo de processamento em ms
    table.integer('user_id').nullable(); // Usuário que iniciou a operação
    table.timestamps(true, true);

    // Indexes
    table.index(['image_id']);
    table.index(['operation_type']);
    table.index(['status']);
    table.index(['user_id']);
    table.index(['created_at']);

    // Foreign keys
    table.foreign('image_id').references('id').inTable('images').onDelete('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('image_operations');
};