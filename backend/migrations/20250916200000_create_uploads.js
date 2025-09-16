/**
 * Migration: Create uploads table
 * Tabela para rastrear todos os uploads de arquivos
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('uploads', function (table) {
    table.increments('id').primary();
    table.string('uuid').notNullable().unique(); // UUID único do arquivo
    table.string('original_name').notNullable(); // Nome original do arquivo
    table.string('filename').notNullable(); // Nome do arquivo no sistema
    table.string('path').notNullable(); // Caminho completo do arquivo
    table.string('mime_type').notNullable(); // Tipo MIME
    table.string('extension', 10).notNullable(); // Extensão do arquivo
    table.integer('size').notNullable(); // Tamanho em bytes
    table.integer('width').nullable(); // Largura (para imagens)
    table.integer('height').nullable(); // Altura (para imagens)
    table.enum('status', ['pending', 'processing', 'completed', 'failed', 'deleted']).defaultTo('pending');
    table.enum('type', ['image', 'document', 'video', 'audio', 'other']).defaultTo('other');
    table.string('entity_type').nullable(); // Tipo da entidade (products, users, etc.)
    table.integer('entity_id').nullable(); // ID da entidade relacionada
    table.integer('user_id').nullable(); // Usuário que fez o upload
    table.json('metadata').defaultTo('{}'); // Metadados adicionais
    table.timestamps(true, true);

    // Indexes
    table.index(['uuid']);
    table.index(['status']);
    table.index(['type']);
    table.index(['entity_type', 'entity_id']);
    table.index(['user_id']);
    table.index(['created_at']);
    table.index(['mime_type']);

    // Foreign key para usuários
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('uploads');
};