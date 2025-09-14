/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('settings').del();

  await knex('settings').insert([
    {
      id: 1,
      key: 'company_name',
      value: 'Moria Peças & Serviços',
      description: 'Nome da empresa',
      category: 'company',
      type: 'string',
      is_public: true,
      is_editable: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      key: 'company_email',
      value: 'contato@moria.com.br',
      description: 'Email principal da empresa',
      category: 'company',
      type: 'string',
      is_public: true,
      is_editable: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      key: 'company_phone',
      value: '(11) 3333-4444',
      description: 'Telefone principal da empresa',
      category: 'company',
      type: 'string',
      is_public: true,
      is_editable: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      key: 'company_whatsapp',
      value: '5511999887766',
      description: 'WhatsApp da empresa',
      category: 'company',
      type: 'string',
      is_public: true,
      is_editable: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      key: 'company_address',
      value: 'Rua das Peças, 123 - Centro - São Paulo/SP - CEP: 01234-567',
      description: 'Endereço completo da empresa',
      category: 'company',
      type: 'string',
      is_public: true,
      is_editable: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 6,
      key: 'shipping_free_min_amount',
      value: '200.00',
      description: 'Valor mínimo para frete grátis',
      category: 'shipping',
      type: 'number',
      is_public: true,
      is_editable: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 7,
      key: 'business_hours',
      value: JSON.stringify({
        monday: '08:00-18:00',
        tuesday: '08:00-18:00',
        wednesday: '08:00-18:00',
        thursday: '08:00-18:00',
        friday: '08:00-18:00',
        saturday: '08:00-12:00',
        sunday: 'Fechado'
      }),
      description: 'Horário de funcionamento',
      category: 'company',
      type: 'json',
      is_public: true,
      is_editable: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 8,
      key: 'featured_categories',
      value: JSON.stringify(['filtros', 'freios', 'lubrificantes', 'eletrica']),
      description: 'Categorias em destaque na página inicial',
      category: 'catalog',
      type: 'json',
      is_public: true,
      is_editable: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 9,
      key: 'maintenance_mode',
      value: 'false',
      description: 'Modo de manutenção ativo',
      category: 'system',
      type: 'boolean',
      is_public: false,
      is_editable: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
