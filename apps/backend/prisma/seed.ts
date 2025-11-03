import { PrismaClient, CustomerStatus, CustomerLevel, ProductStatus, ServiceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🗑️  Clearing existing data...');
  await prisma.revision.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.checklistCategory.deleteMany();
  await prisma.customerVehicle.deleteMany();
  await prisma.productVehicleCompatibility.deleteMany();
  await prisma.vehicleVariant.deleteMany();
  await prisma.vehicleModel.deleteMany();
  await prisma.vehicleMake.deleteMany();
  await prisma.service.deleteMany();
  await prisma.product.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();

  // =========================================================================
  // CUSTOMERS
  // =========================================================================
  console.log('👥 Creating customers...');

  const hashedPassword = await bcrypt.hash('Test123!', 10);

  const customer1 = await prisma.customer.create({
    data: {
      email: 'joao.silva@email.com',
      password: hashedPassword,
      name: 'João Silva',
      phone: '11987654321',
      cpf: '12345678901',
      status: CustomerStatus.ACTIVE,
      level: CustomerLevel.GOLD,
      totalOrders: 15,
      totalSpent: 4500.00,
      addresses: {
        create: [
          {
            type: 'HOME',
            street: 'Rua das Flores',
            number: '123',
            complement: 'Apto 45',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234567',
            isDefault: true,
          },
        ],
      },
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      email: 'maria.santos@email.com',
      password: hashedPassword,
      name: 'Maria Santos',
      phone: '21987654321',
      status: CustomerStatus.ACTIVE,
      level: CustomerLevel.SILVER,
      totalOrders: 8,
      totalSpent: 2300.00,
    },
  });

  console.log(`✅ Created ${2} customers`);

  // =========================================================================
  // VEHICLE MAKES
  // =========================================================================
  console.log('🚗 Creating vehicle makes...');

  const makes = await Promise.all([
    prisma.vehicleMake.create({
      data: {
        name: 'Volkswagen',
        country: 'Germany',
        logo: 'https://example.com/logos/vw.png',
        active: true,
      },
    }),
    prisma.vehicleMake.create({
      data: {
        name: 'Chevrolet',
        country: 'United States',
        logo: 'https://example.com/logos/chevrolet.png',
        active: true,
      },
    }),
    prisma.vehicleMake.create({
      data: {
        name: 'Fiat',
        country: 'Italy',
        logo: 'https://example.com/logos/fiat.png',
        active: true,
      },
    }),
    prisma.vehicleMake.create({
      data: {
        name: 'Toyota',
        country: 'Japan',
        logo: 'https://example.com/logos/toyota.png',
        active: true,
      },
    }),
  ]);

  console.log(`✅ Created ${makes.length} vehicle makes`);

  // =========================================================================
  // VEHICLE MODELS
  // =========================================================================
  console.log('🚙 Creating vehicle models...');

  // VW Models
  const vwGol = await prisma.vehicleModel.create({
    data: {
      makeId: makes[0].id, // Volkswagen
      name: 'Gol',
      segment: 'hatch',
      bodyType: '4-door',
      fuelTypes: ['Gasoline', 'Flex'],
      active: true,
    },
  });

  const vwPolo = await prisma.vehicleModel.create({
    data: {
      makeId: makes[0].id,
      name: 'Polo',
      segment: 'hatch',
      bodyType: '4-door',
      fuelTypes: ['Gasoline', 'Flex'],
      active: true,
    },
  });

  // Chevrolet Models
  const chevyOnix = await prisma.vehicleModel.create({
    data: {
      makeId: makes[1].id, // Chevrolet
      name: 'Onix',
      segment: 'hatch',
      bodyType: '4-door',
      fuelTypes: ['Gasoline', 'Flex'],
      active: true,
    },
  });

  // Fiat Models
  const fiatUno = await prisma.vehicleModel.create({
    data: {
      makeId: makes[2].id, // Fiat
      name: 'Uno',
      segment: 'hatch',
      bodyType: '4-door',
      fuelTypes: ['Gasoline', 'Flex'],
      active: true,
    },
  });

  console.log(`✅ Created 4 vehicle models`);

  // =========================================================================
  // VEHICLE VARIANTS
  // =========================================================================
  console.log('🔧 Creating vehicle variants...');

  const variants = await Promise.all([
    // VW Gol variants
    prisma.vehicleVariant.create({
      data: {
        modelId: vwGol.id,
        name: 'Gol 1.0 12V',
        engineInfo: {
          displacement: '1.0L',
          cylinders: 4,
          horsepower: 80,
          torque: '9.7 kgfm',
        },
        transmission: 'Manual 5-speed',
        yearStart: 2018,
        yearEnd: 2023,
        specifications: {
          fuelTank: '55L',
          weight: '980kg',
          maxSpeed: '165 km/h',
        },
        active: true,
      },
    }),
    prisma.vehicleVariant.create({
      data: {
        modelId: vwGol.id,
        name: 'Gol 1.6 16V',
        engineInfo: {
          displacement: '1.6L',
          cylinders: 4,
          horsepower: 120,
          torque: '16.5 kgfm',
        },
        transmission: 'Automatic 6-speed',
        yearStart: 2018,
        yearEnd: null,
        specifications: {
          fuelTank: '55L',
          weight: '1050kg',
          maxSpeed: '185 km/h',
        },
        active: true,
      },
    }),

    // Chevrolet Onix variants
    prisma.vehicleVariant.create({
      data: {
        modelId: chevyOnix.id,
        name: 'Onix 1.0 Turbo',
        engineInfo: {
          displacement: '1.0L Turbo',
          cylinders: 3,
          horsepower: 116,
          torque: '16.8 kgfm',
        },
        transmission: 'Manual 6-speed',
        yearStart: 2020,
        yearEnd: null,
        specifications: {
          fuelTank: '44L',
          weight: '1078kg',
          maxSpeed: '188 km/h',
        },
        active: true,
      },
    }),
  ]);

  console.log(`✅ Created ${variants.length} vehicle variants`);

  // =========================================================================
  // PRODUCTS
  // =========================================================================
  console.log('📦 Creating products...');

  const products = await Promise.all([
    // Oil filters
    prisma.product.create({
      data: {
        name: 'Filtro de Óleo Mann W610/3',
        description: 'Filtro de óleo de alta performance para motores 1.0 e 1.6. Fabricado com materiais premium que garantem máxima eficiência na filtragem de partículas.',
        category: 'Filtros',
        subcategory: 'Filtro de Óleo',
        sku: 'FLT-OIL-001',
        supplier: 'Mann Filter',
        costPrice: 18.50,
        salePrice: 34.90,
        promoPrice: 29.90,
        stock: 45,
        minStock: 10,
        images: ['https://example.com/products/oil-filter-1.jpg'],
        specifications: {
          type: 'Spin-on',
          thread: 'M20 x 1.5',
          diameter: '76mm',
          height: '80mm',
          pressure: '1.5 bar',
          material: 'Steel with cellulose filter media',
        },
        status: ProductStatus.ACTIVE,
        slug: 'filtro-oleo-mann-w610-3',
        metaDescription: 'Filtro de óleo Mann W610/3 para diversos veículos. Alta qualidade e durabilidade.',
        metaKeywords: 'filtro óleo, mann, w610/3, automotivo',
      },
    }),

    prisma.product.create({
      data: {
        name: 'Vela de Ignição NGK BKR6E-11',
        description: 'Vela de ignição com eletrodo de cobre para motores flex. Proporciona partida rápida e combustão eficiente.',
        category: 'Ignição',
        subcategory: 'Velas',
        sku: 'IGN-VEL-002',
        supplier: 'NGK',
        costPrice: 12.00,
        salePrice: 24.90,
        stock: 120,
        minStock: 30,
        images: ['https://example.com/products/spark-plug-1.jpg'],
        specifications: {
          gap: '1.1mm',
          thread: '14mm',
          reach: '19mm',
          hexSize: '16mm',
          electrode: 'Copper core',
          heatRange: '6',
        },
        status: ProductStatus.ACTIVE,
        slug: 'vela-ignicao-ngk-bkr6e-11',
        metaDescription: 'Vela de ignição NGK BKR6E-11 para motores flex.',
      },
    }),

    prisma.product.create({
      data: {
        name: 'Pastilha de Freio Bosch Dianteira',
        description: 'Conjunto de pastilhas de freio dianteiras com tecnologia de baixo ruído. Excelente poder de frenagem e durabilidade.',
        category: 'Freios',
        subcategory: 'Pastilhas',
        sku: 'BRK-PAD-003',
        supplier: 'Bosch',
        costPrice: 85.00,
        salePrice: 149.90,
        promoPrice: 129.90,
        stock: 32,
        minStock: 8,
        images: ['https://example.com/products/brake-pad-1.jpg'],
        specifications: {
          material: 'Semi-metallic',
          thickness: '17mm',
          width: '63mm',
          length: '151mm',
          wearIndicator: 'Yes',
          hardware: 'Included',
        },
        status: ProductStatus.ACTIVE,
        slug: 'pastilha-freio-bosch-dianteira',
        metaDescription: 'Pastilha de freio Bosch dianteira com baixo ruído e alto desempenho.',
      },
    }),

    prisma.product.create({
      data: {
        name: 'Óleo Motor Sintético 5W30',
        description: 'Óleo lubrificante sintético 5W30 API SN para motores modernos. Excelente proteção em todas as temperaturas.',
        category: 'Lubrificantes',
        subcategory: 'Óleo Motor',
        sku: 'LUB-OIL-004',
        supplier: 'Mobil',
        costPrice: 42.00,
        salePrice: 79.90,
        stock: 68,
        minStock: 20,
        images: ['https://example.com/products/engine-oil-1.jpg'],
        specifications: {
          viscosity: '5W-30',
          type: 'Full Synthetic',
          apiRating: 'SN',
          volume: '1L',
          baseOil: 'Synthetic',
        },
        status: ProductStatus.ACTIVE,
        slug: 'oleo-motor-sintetico-5w30',
        metaDescription: 'Óleo motor sintético 5W30 para máxima proteção do motor.',
      },
    }),

    prisma.product.create({
      data: {
        name: 'Kit Correia Dentada Gates',
        description: 'Kit completo de correia dentada com tensor e roldana. Garantia de 2 anos ou 40.000 km.',
        category: 'Correia',
        subcategory: 'Kit Correia Dentada',
        sku: 'BLT-KIT-005',
        supplier: 'Gates',
        costPrice: 165.00,
        salePrice: 289.90,
        stock: 18,
        minStock: 5,
        images: ['https://example.com/products/timing-belt-kit-1.jpg'],
        specifications: {
          beltLength: '1120mm',
          beltWidth: '25mm',
          teeth: '140',
          material: 'Reinforced rubber with Kevlar',
          includes: 'Belt, tensioner, idler pulley',
        },
        status: ProductStatus.ACTIVE,
        slug: 'kit-correia-dentada-gates',
        metaDescription: 'Kit correia dentada Gates completo com tensor.',
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // =========================================================================
  // SERVICES
  // =========================================================================
  console.log('🔧 Creating services...');

  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Troca de Óleo e Filtro',
        description: 'Serviço completo de troca de óleo lubrificante e filtro de óleo. Inclui verificação de níveis e inspeção visual básica.',
        category: 'Manutenção Preventiva',
        estimatedTime: '30 minutos',
        basePrice: 89.90,
        specifications: {
          includes: ['Troca de óleo', 'Troca de filtro', 'Verificação de níveis', 'Inspeção visual'],
          warranty: '3 meses ou 5.000 km',
        },
        status: ServiceStatus.ACTIVE,
        slug: 'troca-oleo-filtro',
        metaDescription: 'Troca de óleo e filtro com profissionais especializados.',
      },
    }),

    prisma.service.create({
      data: {
        name: 'Alinhamento e Balanceamento',
        description: 'Alinhamento computadorizado das 4 rodas e balanceamento. Equipamento de última geração para máxima precisão.',
        category: 'Suspensão e Direção',
        estimatedTime: '1 hora',
        basePrice: 149.90,
        specifications: {
          equipment: 'Alinhador computadorizado 3D',
          includes: ['Alinhamento 4 rodas', 'Balanceamento 4 rodas', 'Relatório impresso'],
          warranty: '3 meses',
        },
        status: ServiceStatus.ACTIVE,
        slug: 'alinhamento-balanceamento',
        metaDescription: 'Alinhamento e balanceamento computadorizado.',
      },
    }),

    prisma.service.create({
      data: {
        name: 'Revisão Completa',
        description: 'Revisão completa com checklist de 50 itens. Inclui troca de óleo, filtros e verificação de todos os sistemas do veículo.',
        category: 'Revisões',
        estimatedTime: '3 horas',
        basePrice: 449.90,
        specifications: {
          includes: [
            'Troca de óleo e filtros',
            'Verificação de freios',
            'Verificação de suspensão',
            'Teste de bateria',
            'Verificação de pneus',
            'Checklist completo 50 itens',
          ],
          warranty: '6 meses ou 10.000 km',
        },
        status: ServiceStatus.ACTIVE,
        slug: 'revisao-completa',
        metaDescription: 'Revisão completa do veículo com checklist de 50 itens.',
      },
    }),

    prisma.service.create({
      data: {
        name: 'Troca de Pastilhas de Freio',
        description: 'Troca do jogo de pastilhas de freio dianteiras ou traseiras. Inclui limpeza dos componentes e teste de frenagem.',
        category: 'Freios',
        estimatedTime: '1 hora e 30 minutos',
        basePrice: 199.90,
        specifications: {
          includes: ['Troca de pastilhas', 'Limpeza dos componentes', 'Teste de frenagem', 'Regulagem'],
          warranty: '1 ano',
          location: 'Dianteira ou Traseira',
        },
        status: ServiceStatus.ACTIVE,
        slug: 'troca-pastilhas-freio',
        metaDescription: 'Troca de pastilhas de freio com garantia.',
      },
    }),
  ]);

  console.log(`✅ Created ${services.length} services`);

  // =========================================================================
  // PRODUCT-VEHICLE COMPATIBILITY
  // =========================================================================
  console.log('🔗 Creating product-vehicle compatibility...');

  // Oil filter compatibility - universal for VW
  await prisma.productVehicleCompatibility.create({
    data: {
      productId: products[0].id, // Oil Filter
      makeId: makes[0].id, // VW
      modelId: vwGol.id,
      compatibilityData: {
        fitment: 'Direct fit',
        position: 'Engine block',
        notes: 'Compatible with all 1.0 and 1.6 engines',
      },
      verified: true,
      notes: 'Tested and verified by manufacturer',
    },
  });

  // Spark plug compatibility - Chevrolet Onix
  await prisma.productVehicleCompatibility.create({
    data: {
      productId: products[1].id, // Spark Plug
      makeId: makes[1].id, // Chevrolet
      modelId: chevyOnix.id,
      variantId: variants[2].id, // Onix 1.0 Turbo
      compatibilityData: {
        fitment: 'Direct replacement',
        quantity: '3 units needed',
        gapSetting: '1.1mm',
      },
      verified: true,
    },
  });

  // Brake pads - universal for multiple models
  await prisma.productVehicleCompatibility.create({
    data: {
      productId: products[2].id, // Brake Pads
      makeId: makes[0].id, // VW
      modelId: vwGol.id,
      yearStart: 2018,
      yearEnd: 2023,
      compatibilityData: {
        fitment: 'Front axle',
        position: 'Dianteira',
        boltPattern: 'Standard',
      },
      verified: true,
    },
  });

  // Timing belt kit - VW Polo
  await prisma.productVehicleCompatibility.create({
    data: {
      productId: products[4].id, // Timing Belt Kit
      makeId: makes[0].id, // VW
      modelId: vwPolo.id,
      yearStart: 2018,
      compatibilityData: {
        fitment: 'Complete kit',
        installationTime: '3-4 hours',
        specialTools: 'Required',
      },
      verified: true,
      notes: 'Requires special timing tools for installation',
    },
  });

  console.log(`✅ Created 4 compatibility records`);

  // =========================================================================
  // CHECKLIST CATEGORIES AND ITEMS (FASE 4)
  // =========================================================================
  await seedChecklistData();

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n📊 Seed Summary:');
  console.log('=====================================');
  console.log(`✅ Customers: 2`);
  console.log(`✅ Vehicle Makes: ${makes.length}`);
  console.log(`✅ Vehicle Models: 4`);
  console.log(`✅ Vehicle Variants: ${variants.length}`);
  console.log(`✅ Products: ${products.length}`);
  console.log(`✅ Services: ${services.length}`);
  console.log(`✅ Compatibility Records: 4`);
  console.log(`✅ Checklist Categories: 10`);
  console.log('=====================================');
  console.log('🎉 Seed completed successfully!');
}

async function seedChecklistData() {
  console.log('📋 Seeding checklist data...');

  const categories = [
    {
      name: 'Freios',
      description: 'Verificação completa do sistema de freios',
      icon: '🛑',
      order: 1,
      items: [
        { name: 'Pastilhas de freio dianteiras', order: 1 },
        { name: 'Pastilhas de freio traseiras', order: 2 },
        { name: 'Discos de freio dianteiros', order: 3 },
        { name: 'Discos de freio traseiros', order: 4 },
        { name: 'Fluido de freio (nível e qualidade)', order: 5 },
        { name: 'Cilindro mestre', order: 6 },
        { name: 'Cilindros de roda', order: 7 },
        { name: 'Freio de mão', order: 8 },
        { name: 'Mangueiras e tubulações', order: 9 },
      ],
    },
    {
      name: 'Suspensão',
      description: 'Verificação do sistema de suspensão',
      icon: '🔧',
      order: 2,
      items: [
        { name: 'Amortecedores dianteiros', order: 1 },
        { name: 'Amortecedores traseiros', order: 2 },
        { name: 'Molas', order: 3 },
        { name: 'Bandejas', order: 4 },
        { name: 'Buchas', order: 5 },
        { name: 'Pivôs', order: 6 },
        { name: 'Barra estabilizadora', order: 7 },
        { name: 'Batentes', order: 8 },
      ],
    },
    {
      name: 'Motor',
      description: 'Verificação geral do motor',
      icon: '⚙️',
      order: 3,
      items: [
        { name: 'Óleo do motor (nível e qualidade)', order: 1 },
        { name: 'Filtro de óleo', order: 2 },
        { name: 'Filtro de ar', order: 3 },
        { name: 'Filtro de combustível', order: 4 },
        { name: 'Velas de ignição', order: 5 },
        { name: 'Cabos de vela', order: 6 },
        { name: 'Correia dentada', order: 7 },
        { name: 'Correia do alternador', order: 8 },
        { name: 'Correia da direção hidráulica', order: 9 },
        { name: 'Vazamentos', order: 10 },
        { name: 'Ruídos anormais', order: 11 },
      ],
    },
    {
      name: 'Sistema de Arrefecimento',
      description: 'Verificação do sistema de refrigeração',
      icon: '🌡️',
      order: 4,
      items: [
        { name: 'Radiador', order: 1 },
        { name: 'Líquido de arrefecimento (nível e qualidade)', order: 2 },
        { name: 'Mangueiras', order: 3 },
        { name: 'Bomba d\'água', order: 4 },
        { name: 'Válvula termostática', order: 5 },
        { name: 'Eletroventilador', order: 6 },
        { name: 'Tampa do radiador', order: 7 },
      ],
    },
    {
      name: 'Sistema Elétrico',
      description: 'Verificação do sistema elétrico',
      icon: '⚡',
      order: 5,
      items: [
        { name: 'Bateria (carga e terminais)', order: 1 },
        { name: 'Alternador', order: 2 },
        { name: 'Motor de arranque', order: 3 },
        { name: 'Faróis dianteiros', order: 4 },
        { name: 'Lanternas traseiras', order: 5 },
        { name: 'Luzes de freio', order: 6 },
        { name: 'Pisca-pisca', order: 7 },
        { name: 'Luz de ré', order: 8 },
        { name: 'Luz da placa', order: 9 },
        { name: 'Fusíveis', order: 10 },
      ],
    },
    {
      name: 'Transmissão',
      description: 'Verificação do sistema de transmissão',
      icon: '🔄',
      order: 6,
      items: [
        { name: 'Óleo da transmissão (nível e qualidade)', order: 1 },
        { name: 'Embreagem', order: 2 },
        { name: 'Pedal da embreagem', order: 3 },
        { name: 'Vazamentos', order: 4 },
        { name: 'Ruídos ao trocar marcha', order: 5 },
        { name: 'Dificuldade ao engatar marchas', order: 6 },
      ],
    },
    {
      name: 'Direção',
      description: 'Verificação do sistema de direção',
      icon: '🎯',
      order: 7,
      items: [
        { name: 'Fluido da direção hidráulica', order: 1 },
        { name: 'Bomba da direção', order: 2 },
        { name: 'Caixa de direção', order: 3 },
        { name: 'Terminais de direção', order: 4 },
        { name: 'Barra axial', order: 5 },
        { name: 'Folgas na direção', order: 6 },
        { name: 'Alinhamento', order: 7 },
        { name: 'Balanceamento', order: 8 },
      ],
    },
    {
      name: 'Pneus e Rodas',
      description: 'Verificação de pneus e rodas',
      icon: '🛞',
      order: 8,
      items: [
        { name: 'Pneu dianteiro esquerdo (calibragem e desgaste)', order: 1 },
        { name: 'Pneu dianteiro direito (calibragem e desgaste)', order: 2 },
        { name: 'Pneu traseiro esquerdo (calibragem e desgaste)', order: 3 },
        { name: 'Pneu traseiro direito (calibragem e desgaste)', order: 4 },
        { name: 'Estepe', order: 5 },
        { name: 'Rodas (estado e parafusos)', order: 6 },
        { name: 'Calotas', order: 7 },
      ],
    },
    {
      name: 'Carroceria e Interior',
      description: 'Verificação da carroceria e interior',
      icon: '🚗',
      order: 9,
      items: [
        { name: 'Portas (funcionamento e travas)', order: 1 },
        { name: 'Vidros elétricos', order: 2 },
        { name: 'Retrovisores', order: 3 },
        { name: 'Limpadores de para-brisa', order: 4 },
        { name: 'Fluido do limpador', order: 5 },
        { name: 'Ar condicionado', order: 6 },
        { name: 'Bancos', order: 7 },
        { name: 'Cintos de segurança', order: 8 },
        { name: 'Painel de instrumentos', order: 9 },
        { name: 'Buzina', order: 10 },
      ],
    },
    {
      name: 'Sistema de Escapamento',
      description: 'Verificação do sistema de escape',
      icon: '💨',
      order: 10,
      items: [
        { name: 'Coletor de escapamento', order: 1 },
        { name: 'Catalisador', order: 2 },
        { name: 'Silencioso', order: 3 },
        { name: 'Ponteira', order: 4 },
        { name: 'Suportes e borrachas', order: 5 },
        { name: 'Vazamentos', order: 6 },
        { name: 'Ruídos excessivos', order: 7 },
      ],
    },
  ];

  for (const categoryData of categories) {
    const { items, ...categoryInfo } = categoryData;

    const category = await prisma.checklistCategory.create({
      data: {
        ...categoryInfo,
        isDefault: true,
        isEnabled: true,
      },
    });

    console.log(`  ✅ Created category: ${category.name}`);

    // Create items for this category
    for (const itemData of items) {
      await prisma.checklistItem.create({
        data: {
          categoryId: category.id,
          name: itemData.name,
          order: itemData.order,
          isDefault: true,
          isEnabled: true,
        },
      });
    }

    console.log(`     ➕ Created ${items.length} items`);
  }

  console.log('✅ Checklist data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
