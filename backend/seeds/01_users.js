const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Hash da senha padrão do admin
  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123456', 12);

  await knex('users').insert([
    {
      id: 1,
      email: process.env.ADMIN_EMAIL || 'admin@moria.com.br',
      password_hash: adminPasswordHash,
      name: process.env.ADMIN_NAME || 'Administrador',
      phone: '(11) 99999-9999',
      role: 'admin',
      is_active: true,
      email_verified_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      email: 'cliente@teste.com',
      password_hash: await bcrypt.hash('123456', 12),
      name: 'Cliente Teste',
      phone: '(11) 88888-8888',
      cpf: '123.456.789-00',
      role: 'customer',
      is_active: true,
      total_orders: 3,
      total_spent: 450.50,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
