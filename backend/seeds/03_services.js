/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('services').del();

  await knex('services').insert([
    {
      id: 1,
      name: 'Troca de Óleo',
      description: 'Troca completa de óleo do motor e filtro com verificação de nível',
      category: 'manutencao',
      base_price: 89.90,
      estimated_time: '30 minutos',
      specifications: JSON.stringify({ inclui_filtro: true, tipo_oleo: 'sintético', verificacao: 'completa' }),
      is_active: true,
      rating: 4.8,
      rating_count: 45,
      bookings_count: 123,
      required_items: JSON.stringify([1, 3]), // IDs dos produtos necessários
      instructions: 'Verificar nível após 5 minutos com motor desligado',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'Alinhamento e Balanceamento',
      description: 'Alinhamento de direção e balanceamento de rodas com relatório completo',
      category: 'pneus',
      base_price: 159.90,
      estimated_time: '45 minutos',
      specifications: JSON.stringify({ inclui_relatorio: true, garantia: '6 meses', equipamento: 'digital' }),
      is_active: true,
      rating: 4.6,
      rating_count: 32,
      bookings_count: 89,
      required_items: JSON.stringify([]),
      instructions: 'Calibrar pneus antes do serviço. Verificar suspensão.',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'Troca de Pastilhas de Freio',
      description: 'Substituição das pastilhas de freio dianteiras ou traseiras',
      category: 'freios',
      base_price: 120.00,
      estimated_time: '60 minutos',
      specifications: JSON.stringify({ posicoes: ['dianteira', 'traseira'], garantia: '12 meses' }),
      is_active: true,
      rating: 4.9,
      rating_count: 28,
      bookings_count: 67,
      required_items: JSON.stringify([2]), // Pastilhas de freio
      instructions: 'Verificar discos de freio. Testar pedal após instalação.',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'Diagnóstico Eletrônico',
      description: 'Diagnóstico completo do sistema eletrônico do veículo',
      category: 'eletrica',
      base_price: 80.00,
      estimated_time: '40 minutos',
      specifications: JSON.stringify({ scanner: 'OBD2', relatorio: 'detalhado', sistemas: 'todos' }),
      is_active: true,
      rating: 4.7,
      rating_count: 15,
      bookings_count: 34,
      required_items: JSON.stringify([]),
      instructions: 'Conectar scanner antes de ligar o veículo.',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};
