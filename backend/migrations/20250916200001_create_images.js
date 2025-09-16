/**
 * Migration: Create images table
 * Tabela para armazenar diferentes versões/tamanhos de imagens processadas
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('images', function (table) {
    table.increments('id').primary();
    table.string('uuid').notNullable().unique(); // UUID base da imagem
    table.integer('upload_id').notNullable(); // Referência ao upload original
    table.enum('size', ['thumbnail', 'medium', 'full', 'original']).notNullable();
    table.string('path').notNullable(); // Caminho do arquivo processado
    table.string('url').notNullable(); // URL de acesso
    table.integer('width').notNullable(); // Largura da imagem
    table.integer('height').notNullable(); // Altura da imagem
    table.integer('file_size').notNullable(); // Tamanho do arquivo em bytes
    table.string('format', 10).notNullable(); // Formato (webp, jpg, png)
    table.integer('quality').nullable(); // Qualidade de compressão
    table.json('crop_data').nullable(); // Dados de crop aplicado
    table.boolean('is_processed').defaultTo(false); // Se foi processada
    table.timestamps(true, true);

    // Indexes
    table.index(['uuid']);
    table.index(['upload_id']);
    table.index(['size']);
    table.index(['is_processed']);
    table.index(['created_at']);

    // Unique constraint para evitar duplicatas
    table.unique(['upload_id', 'size']);

    // Foreign key para uploads
    table.foreign('upload_id').references('id').inTable('uploads').onDelete('CASCADE');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('images');
};