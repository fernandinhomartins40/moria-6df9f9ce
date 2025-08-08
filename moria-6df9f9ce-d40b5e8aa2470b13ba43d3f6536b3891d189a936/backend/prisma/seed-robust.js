// Seed robusto para dados de teste - Sistema Moria
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed robusto...');

  try {
    // Limpar dados existentes (opcional, para desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Limpando dados existentes...');
      await prisma.orderItem.deleteMany({});
      await prisma.order.deleteMany({});
      await prisma.coupon.deleteMany({});
      await prisma.promotion.deleteMany({});
      await prisma.service.deleteMany({});
      await prisma.product.deleteMany({});
      await prisma.appConfig.deleteMany({});
    }

    // 1. Configurações da aplicação
    console.log('⚙️ Criando configurações...');
    await prisma.appConfig.createMany({
      data: [
        {
          key: 'app_name',
          value: '"Moria Peças e Serviços"',
          description: 'Nome da aplicação'
        },
        {
          key: 'contact_info',
          value: '{"phone": "(11) 99999-9999", "email": "contato@moriapecas.com.br", "address": "Rua das Peças, 123 - São Paulo/SP"}',
          description: 'Informações de contato'
        },
        {
          key: 'business_hours',
          value: '{"monday_friday": "08:00-18:00", "saturday": "08:00-12:00", "sunday": "Fechado"}',
          description: 'Horário de funcionamento'
        }
      ]
    });

    // 2. Produtos públicos
    console.log('🛒 Criando produtos públicos...');
    const products = await prisma.product.createMany({
      data: [
        {
          name: 'Filtro de Ar Motor',
          description: 'Filtro de ar de alta qualidade para motores automotivos',
          category: 'Filtros',
          price: 45.90,
          salePrice: 39.90,
          stock: 25,
          minStock: 5,
          sku: 'FLT-001',
          brand: 'Tecfil',
          supplier: 'Auto Peças SP',
          isActive: true,
          isPublic: true,
          status: 'published',
          rating: 4.5,
          specifications: JSON.stringify({
            material: 'Papel',
            dimensoes: '20x15x5cm',
            compatibilidade: ['Ford Ka', 'Ford Fiesta', 'VW Gol']
          }),
          vehicleCompatibility: JSON.stringify(['Ford Ka 2018+', 'Ford Fiesta 2010-2020', 'VW Gol G6/G7']),
          costPrice: 25.00,
          internalNotes: 'Produto com boa margem, fornecedor confiável'
        },
        {
          name: 'Óleo Motor 20W50',
          description: 'Óleo lubrificante mineral para motores',
          category: 'Lubrificantes',
          price: 32.50,
          stock: 50,
          minStock: 10,
          sku: 'OIL-001',
          brand: 'Castrol',
          supplier: 'Distribuidora Castrol',
          isActive: true,
          isPublic: true,
          status: 'published',
          rating: 4.8,
          specifications: JSON.stringify({
            viscosidade: '20W50',
            tipo: 'Mineral',
            volume: '1L',
            aplicacao: 'Motores convencionais'
          }),
          costPrice: 18.00
        },
        {
          name: 'Pastilha Freio Dianteira',
          description: 'Pastilha de freio dianteira para veículos populares',
          category: 'Freios',
          price: 89.90,
          salePrice: 79.90,
          stock: 15,
          minStock: 3,
          sku: 'BRK-001',
          brand: 'Jurid',
          supplier: 'Freios Brasil',
          isActive: true,
          isPublic: true,
          status: 'published',
          rating: 4.7,
          specifications: JSON.stringify({
            posicao: 'Dianteira',
            material: 'Semi-metálica',
            garantia: '20.000km'
          }),
          vehicleCompatibility: JSON.stringify(['VW Gol', 'Ford Ka', 'Chevrolet Celta']),
          costPrice: 45.00
        },
        {
          name: 'Bateria 60Ah',
          description: 'Bateria automotiva 60 amperes com 18 meses de garantia',
          category: 'Elétrica',
          price: 280.00,
          promoPrice: 249.90,
          stock: 8,
          minStock: 2,
          sku: 'BAT-060',
          brand: 'Moura',
          supplier: 'Moura Distribuidora',
          isActive: true,
          isPublic: true,
          status: 'published',
          rating: 4.9,
          specifications: JSON.stringify({
            amperagem: '60Ah',
            voltagem: '12V',
            garantia: '18 meses',
            peso: '15kg'
          }),
          costPrice: 180.00
        },
        {
          name: 'Amortecedor Traseiro',
          description: 'Amortecedor traseiro para veículos de passeio',
          category: 'Suspensão',
          price: 156.90,
          stock: 12,
          minStock: 4,
          sku: 'AMO-001',
          brand: 'Monroe',
          isActive: true,
          isPublic: true,
          status: 'published',
          rating: 4.6,
          costPrice: 95.00
        },
        // Produto não público (para teste)
        {
          name: 'Peça Especial Import',
          description: 'Peça importada para casos especiais',
          category: 'Especiais',
          price: 500.00,
          stock: 2,
          minStock: 1,
          sku: 'ESP-001',
          brand: 'Importada',
          isActive: true,
          isPublic: false,
          status: 'draft',
          costPrice: 300.00,
          internalNotes: 'Apenas para clientes especiais, não exibir publicamente'
        }
      ]
    });

    // 3. Serviços públicos
    console.log('🔧 Criando serviços públicos...');
    await prisma.service.createMany({
      data: [
        {
          name: 'Troca de Óleo',
          description: 'Troca completa de óleo do motor com filtro',
          category: 'Manutenção',
          basePrice: 80.00,
          estimatedTime: '30 minutos',
          isActive: true,
          isPublic: true,
          status: 'published',
          specifications: JSON.stringify({
            inclui: ['Óleo mineral 20W50', 'Filtro de óleo', 'Mão de obra'],
            observacoes: 'Verificação de níveis incluída'
          }),
          internalCost: 35.00
        },
        {
          name: 'Balanceamento e Alinhamento',
          description: 'Serviço completo de balanceamento e alinhamento',
          category: 'Pneus',
          basePrice: 120.00,
          estimatedTime: '45 minutos',
          isActive: true,
          isPublic: true,
          status: 'published',
          specifications: JSON.stringify({
            equipamento: 'Digital computadorizado',
            garantia: '6 meses',
            inclui: ['Balanceamento 4 rodas', 'Alinhamento dianteiro']
          }),
          internalCost: 25.00
        },
        {
          name: 'Revisão Básica',
          description: 'Revisão preventiva com check-list completo',
          category: 'Revisão',
          basePrice: 150.00,
          estimatedTime: '1 hora',
          isActive: true,
          isPublic: true,
          status: 'published',
          specifications: JSON.stringify({
            itens_verificados: ['Fluidos', 'Freios', 'Suspensão', 'Elétrica básica'],
            relatorio: 'Relatório detalhado incluído'
          }),
          internalCost: 45.00
        },
        {
          name: 'Instalação de Som',
          description: 'Instalação de sistema de som automotivo',
          category: 'Elétrica',
          basePrice: 200.00,
          estimatedTime: '2 horas',
          isActive: true,
          isPublic: true,
          status: 'published',
          internalCost: 50.00
        }
      ]
    });

    // 4. Promoções públicas
    console.log('🎉 Criando promoções públicas...');
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + 30); // 30 dias no futuro

    await prisma.promotion.createMany({
      data: [
        {
          title: 'Combo Troca de Óleo',
          description: 'Troca de óleo + filtro de ar por um preço especial',
          discountType: 'fixed_amount',
          discountValue: 20.00,
          category: 'Manutenção',
          minAmount: 100.00,
          startDate: now,
          endDate: futureDate,
          isActive: true,
          isPublic: true,
          status: 'published',
          maxUses: 50,
          usedCount: 0
        },
        {
          title: 'Desconto Freios',
          description: '15% de desconto em pastilhas e discos de freio',
          discountType: 'percentage',
          discountValue: 15.00,
          category: 'Freios',
          minAmount: 150.00,
          startDate: now,
          endDate: futureDate,
          isActive: true,
          isPublic: true,
          status: 'published',
          maxUses: 30,
          usedCount: 5
        },
        {
          title: 'Mês da Bateria',
          description: 'Bateria com instalação grátis',
          discountType: 'fixed_amount',
          discountValue: 30.00,
          category: 'Elétrica',
          minAmount: 200.00,
          startDate: now,
          endDate: futureDate,
          isActive: true,
          isPublic: true,
          status: 'published',
          maxUses: 20,
          usedCount: 2
        }
      ]
    });

    // 5. Cupons
    console.log('🎫 Criando cupons...');
    await prisma.coupon.createMany({
      data: [
        {
          code: 'PRIMEIRA10',
          description: '10% de desconto na primeira compra',
          discountType: 'percentage',
          discountValue: 10.00,
          minAmount: 50.00,
          maxUses: 100,
          usedCount: 0,
          expiresAt: futureDate,
          isActive: true
        },
        {
          code: 'CLIENTE20',
          description: 'R$ 20 off para clientes cadastrados',
          discountType: 'fixed_amount',
          discountValue: 20.00,
          minAmount: 100.00,
          maxUses: 50,
          usedCount: 0,
          expiresAt: futureDate,
          isActive: true
        }
      ]
    });

    // Contagem final
    const [productCount, serviceCount, promotionCount, publicProducts, publicServices, publicPromotions] = await Promise.all([
      prisma.product.count(),
      prisma.service.count(),
      prisma.promotion.count(),
      prisma.product.count({ where: { isPublic: true, isActive: true } }),
      prisma.service.count({ where: { isPublic: true, isActive: true } }),
      prisma.promotion.count({ where: { isPublic: true, isActive: true } })
    ]);

    console.log('\n📊 SEED CONCLUÍDO COM SUCESSO!');
    console.log('========================================');
    console.log(`✅ Total de produtos: ${productCount}`);
    console.log(`✅ Total de serviços: ${serviceCount}`);
    console.log(`✅ Total de promoções: ${promotionCount}`);
    console.log('');
    console.log('🌐 Dados públicos disponíveis:');
    console.log(`  🛒 Produtos públicos: ${publicProducts}`);
    console.log(`  🔧 Serviços públicos: ${publicServices}`);
    console.log(`  🎉 Promoções públicas: ${publicPromotions}`);
    console.log('========================================');

    if (publicProducts > 0 || publicServices > 0) {
      console.log('🎉 APIs públicas agora têm dados para exibir!');
    }

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });