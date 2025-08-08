const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed com dados realistas...')

  // Limpar dados existentes
  console.log('🗑️  Limpando dados existentes...')
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.promotion.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.service.deleteMany()
  await prisma.product.deleteMany()

  // ========================================
  // PRODUTOS REALISTAS - PEÇAS AUTOMOTIVAS
  // ========================================

  console.log('🔧 Criando produtos...')

  const products = [
    // MOTOR
    {
      name: "Filtro de Óleo Tecfil PSL140",
      description: "Filtro de óleo original Tecfil compatível com diversos modelos VW, Fiat, Ford. Material de alta qualidade com vedações em borracha.",
      category: "Motor",
      price: 24.90,
      salePrice: 19.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 50,
      isActive: true,
      rating: 4.8,
      specifications: JSON.stringify({
        marca: "Tecfil",
        codigo: "PSL140",
        compatibilidade: ["VW Gol", "Fiat Uno", "Ford Ka"],
        material: "Papel microporoso",
        garantia: "12 meses"
      }),
      vehicleCompatibility: JSON.stringify([
        { brand: "Volkswagen", models: ["Gol", "Fox", "Polo"] },
        { brand: "Fiat", models: ["Uno", "Palio", "Siena"] },
        { brand: "Ford", models: ["Ka", "Fiesta"] }
      ])
    },
    {
      name: "Óleo Motor Castrol GTX 20W50 1L",
      description: "Óleo lubrificante mineral Castrol GTX 20W50 para motores a gasolina e álcool. Proteção superior contra desgaste e depósitos.",
      category: "Motor",
      price: 18.90,
      salePrice: 15.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 120,
      isActive: true,
      rating: 4.7,
      specifications: JSON.stringify({
        marca: "Castrol",
        viscosidade: "20W50",
        tipo: "Mineral",
        volume: "1 litro",
        aplicacao: "Gasolina/Álcool"
      })
    },
    {
      name: "Vela de Ignição NGK BPR6ES",
      description: "Vela de ignição NGK modelo BPR6ES com eletrodo de níquel. Ignição eficiente e durabilidade comprovada.",
      category: "Motor",
      price: 12.50,
      salePrice: 9.90,
      promoPrice: 8.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 80,
      isActive: true,
      rating: 4.9,
      specifications: JSON.stringify({
        marca: "NGK",
        modelo: "BPR6ES",
        eletrodo: "Níquel",
        rosca: "14mm",
        distancia: "0.8mm"
      })
    },
    {
      name: "Correia Dentada Gates T166",
      description: "Correia dentada original Gates modelo T166. Fabricada com material de alta resistência para sincronismo preciso do motor.",
      category: "Motor",
      price: 89.90,
      salePrice: 79.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 25,
      isActive: true,
      rating: 4.8
    },

    // FREIOS
    {
      name: "Pastilha de Freio Cobreq N-509",
      description: "Pastilha de freio dianteira Cobreq modelo N-509. Composto cerâmico para frenagem segura e durável.",
      category: "Freios",
      price: 45.90,
      salePrice: 39.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 40,
      isActive: true,
      rating: 4.6,
      specifications: JSON.stringify({
        marca: "Cobreq",
        modelo: "N-509",
        posicao: "Dianteira",
        material: "Cerâmico",
        compatibilidade: "Gol G5/G6/G7"
      })
    },
    {
      name: "Disco de Freio Ventilado Fremax BD5487",
      description: "Disco de freio ventilado Fremax modelo BD5487. Ferro fundido cinzento com tratamento anticorrosivo.",
      category: "Freios",
      price: 89.90,
      salePrice: 79.90,
      promoPrice: 69.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 15,
      isActive: true,
      rating: 4.7
    },
    {
      name: "Fluido de Freio Bosch DOT4 500ml",
      description: "Fluido de freio sintético Bosch DOT4. Ponto de ebulição elevado e proteção contra corrosão do sistema.",
      category: "Freios",
      price: 28.90,
      salePrice: 24.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 60,
      isActive: true,
      rating: 4.8
    },

    // SUSPENSÃO
    {
      name: "Amortecedor Dianteiro Cofap B18644",
      description: "Amortecedor dianteiro hidráulico Cofap modelo B18644. Válvulas de precisão para maior conforto e estabilidade.",
      category: "Suspensão",
      price: 129.90,
      salePrice: 119.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 20,
      isActive: true,
      rating: 4.5
    },
    {
      name: "Mola Helicoidal Traseira Eibach E10-15-021-02-22",
      description: "Mola helicoidal traseira esportiva Eibach. Reduz altura em 30mm e melhora dirigibilidade.",
      category: "Suspensão",
      price: 189.90,
      salePrice: 169.90,
      promoPrice: 149.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 8,
      isActive: true,
      rating: 4.9
    },
    {
      name: "Bieleta Estabilizadora Nakata N99004",
      description: "Bieleta estabilizadora dianteira Nakata modelo N99004. Componente essencial para estabilidade em curvas.",
      category: "Suspensão",
      price: 35.90,
      salePrice: 29.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 30,
      isActive: true,
      rating: 4.4
    },

    // ELÉTRICA
    {
      name: "Bateria Moura 60Ah M60GD",
      description: "Bateria automotiva Moura 60Ah modelo M60GD. Tecnologia prata com 18 meses de garantia. Livre de manutenção.",
      category: "Elétrica",
      price: 320.00,
      salePrice: 289.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 12,
      isActive: true,
      rating: 4.8,
      specifications: JSON.stringify({
        marca: "Moura",
        capacidade: "60Ah",
        voltagem: "12V",
        tecnologia: "Prata",
        garantia: "18 meses",
        dimensoes: "242x175x190mm"
      })
    },
    {
      name: "Alternador Bosch 90A Remanufaturado",
      description: "Alternador remanufaturado Bosch 90 amperes. Testado e aprovado com garantia de 6 meses.",
      category: "Elétrica",
      price: 280.00,
      salePrice: 249.90,
      promoPrice: 219.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 6,
      isActive: true,
      rating: 4.3
    },
    {
      name: "Kit Cabos de Vela NGK SCE58",
      description: "Kit completo cabos de vela NGK modelo SCE58. Condutores de silicone para máxima eficiência na ignição.",
      category: "Elétrica",
      price: 78.90,
      salePrice: 69.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 35,
      isActive: true,
      rating: 4.7
    },

    // FILTROS E ÓLEOS
    {
      name: "Filtro de Ar Wega FAP2340",
      description: "Filtro de ar motor Wega modelo FAP2340. Papel plissado de alta filtragem para proteção máxima do motor.",
      category: "Filtros",
      price: 19.90,
      salePrice: 16.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 70,
      isActive: true,
      rating: 4.6
    },
    {
      name: "Filtro Combustível Tecfil GI05",
      description: "Filtro de combustível Tecfil modelo GI05 para veículos flex. Remove impurezas e protege sistema de injeção.",
      category: "Filtros", 
      price: 32.90,
      salePrice: 27.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 45,
      isActive: true,
      rating: 4.5
    }
  ]

  const createdProducts = []
  for (const product of products) {
    const created = await prisma.product.create({ data: product })
    createdProducts.push(created)
    console.log(`✅ Produto criado: ${product.name}`)
  }

  // ========================================
  // SERVIÇOS REALISTAS
  // ========================================

  console.log('🔧 Criando serviços...')

  const services = [
    {
      name: "Troca de Óleo e Filtro",
      description: "Serviço completo de troca de óleo motor com filtro. Inclui verificação de fluidos e inspeção visual.",
      category: "Motor",
      basePrice: 45.00,
      estimatedTime: "30 minutos",
      specifications: JSON.stringify({
        inclui: ["Óleo 20W50 4L", "Filtro de óleo", "Mão de obra"],
        observacoes: "Óleos sintéticos com valor adicional",
        garantia: "5.000km ou 6 meses"
      }),
      isActive: true
    },
    {
      name: "Alinhamento e Balanceamento",
      description: "Alinhamento de direção computadorizado + balanceamento das 4 rodas. Aumenta vida útil dos pneus.",
      category: "Suspensão",
      basePrice: 89.90,
      estimatedTime: "1 hora",
      specifications: JSON.stringify({
        equipamento: "Computadorizado",
        inclui: ["Alinhamento", "Balanceamento 4 rodas", "Relatório impresso"],
        garantia: "10.000km"
      }),
      isActive: true
    },
    {
      name: "Revisão de Freios Completa",
      description: "Inspeção completa do sistema de freios: pastilhas, discos, fluido, mangueiras e funcionamento.",
      category: "Freios",
      basePrice: 25.00,
      estimatedTime: "45 minutos",
      specifications: JSON.stringify({
        inclui: ["Inspeção visual", "Teste de frenagem", "Medição pastilhas/discos", "Relatório detalhado"],
        observacoes: "Peças e serviços adicionais cobrados separadamente"
      }),
      isActive: true
    },
    {
      name: "Diagnóstico Eletrônico",
      description: "Diagnóstico computadorizado completo dos sistemas eletrônicos do veículo com scanner automotivo.",
      category: "Elétrica",
      basePrice: 35.00,
      estimatedTime: "20 minutos",
      specifications: JSON.stringify({
        equipamento: "Scanner OBD2 profissional",
        sistemas: ["Motor", "Transmissão", "ABS", "Airbag", "Ar condicionado"],
        inclui: "Relatório impresso com códigos de falha"
      }),
      isActive: true
    },
    {
      name: "Limpeza de Bicos Injetores",
      description: "Limpeza ultrassônica dos bicos injetores. Melhora desempenho e reduz consumo de combustível.",
      category: "Motor",
      basePrice: 120.00,
      estimatedTime: "2 horas",
      specifications: JSON.stringify({
        processo: "Limpeza ultrassônica + teste de vazão",
        beneficios: ["Melhor desempenho", "Menor consumo", "Redução emissões"],
        garantia: "15.000km"
      }),
      isActive: true
    },
    {
      name: "Troca de Correia Dentada",
      description: "Substituição da correia dentada com tensor. Serviço crítico para evitar danos ao motor.",
      category: "Motor", 
      basePrice: 180.00,
      estimatedTime: "3 horas",
      specifications: JSON.stringify({
        inclui: ["Mão de obra especializada", "Regulagem de ponto"],
        observacoes: "Correia e tensor cobrados separadamente",
        recomendacao: "A cada 60.000km"
      }),
      isActive: true
    }
  ]

  const createdServices = []
  for (const service of services) {
    const created = await prisma.service.create({ data: service })
    createdServices.push(created)
    console.log(`✅ Serviço criado: ${service.name}`)
  }

  // ========================================
  // CUPONS REALISTAS
  // ========================================

  console.log('🎫 Criando cupons...')

  const coupons = [
    {
      code: "BEMVINDO10",
      name: "Desconto Boas-vindas",
      description: "10% de desconto para novos clientes na primeira compra",
      discountType: "percentage",
      discountValue: 10,
      minimumAmount: 50.00,
      maxDiscount: 30.00,
      usageLimit: 100,
      usageCount: 0,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      isActive: true
    },
    {
      code: "FRETE15",
      name: "Desconto no Frete",
      description: "R$ 15,00 de desconto no frete para compras acima de R$ 100",
      discountType: "fixed",
      discountValue: 15.00,
      minimumAmount: 100.00,
      usageLimit: 50,
      usageCount: 0,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias
      isActive: true
    },
    {
      code: "TROCA20",
      name: "Desconto Troca de Óleo",
      description: "20% off em serviços de troca de óleo",
      discountType: "percentage", 
      discountValue: 20,
      minimumAmount: 40.00,
      maxDiscount: 25.00,
      usageLimit: 30,
      usageCount: 0,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      isActive: true
    }
  ]

  const createdCoupons = []
  for (const coupon of coupons) {
    const created = await prisma.coupon.create({ data: coupon })
    createdCoupons.push(created)
    console.log(`✅ Cupom criado: ${coupon.code}`)
  }

  // ========================================
  // PROMOÇÕES REALISTAS
  // ========================================

  console.log('🏷️  Criando promoções...')

  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const promotions = [
    // PROMOÇÕES DIÁRIAS (Ofertas Flash)
    {
      name: "Flash: Filtro de Óleo",
      description: "Oferta relâmpago! Filtro de óleo com desconto especial válido apenas hoje!",
      type: "daily",
      discountType: "percentage",
      discountValue: 25,
      maxDiscount: null,
      startsAt: now,
      endsAt: tomorrow,
      conditions: JSON.stringify({
        productId: createdProducts.find(p => p.name.includes("Filtro de Óleo"))?.id,
        category: "Motor",
        basePrice: 24.90
      }),
      isActive: true
    },
    {
      name: "Flash: Velas NGK",
      description: "Velas de ignição NGK com preço imperdível! Apenas por hoje!",
      type: "daily",
      discountType: "fixed",
      discountValue: 3.60,
      startsAt: now,
      endsAt: tomorrow,
      conditions: JSON.stringify({
        productId: createdProducts.find(p => p.name.includes("Vela de Ignição"))?.id,
        category: "Motor",
        basePrice: 12.50
      }),
      isActive: true
    },
    {
      name: "Flash: Pastilha Freio",
      description: "Pastilha de freio com desconto especial! Oferta válida apenas hoje!",
      type: "daily",
      discountType: "percentage",
      discountValue: 15,
      startsAt: now,
      endsAt: tomorrow,
      conditions: JSON.stringify({
        productId: createdProducts.find(p => p.name.includes("Pastilha de Freio"))?.id,
        category: "Freios",
        basePrice: 45.90
      }),
      isActive: true
    },
    {
      name: "Flash: Óleo Castrol",
      description: "Óleo Castrol GTX com preço promocional! Aproveite hoje!",
      type: "daily",
      discountType: "percentage",
      discountValue: 20,
      startsAt: now,
      endsAt: tomorrow,
      conditions: JSON.stringify({
        productId: createdProducts.find(p => p.name.includes("Óleo Motor Castrol"))?.id,
        category: "Motor",
        basePrice: 18.90
      }),
      isActive: true
    },

    // PROMOÇÕES SEMANAIS
    {
      name: "Semana do Motor",
      description: "Semana especial com descontos em peças do motor. Filtros, óleos, correias e muito mais!",
      type: "weekly",
      discountType: "percentage",
      discountValue: 15,
      maxDiscount: 50.00,
      startsAt: now,
      endsAt: nextWeek,
      conditions: JSON.stringify({
        category: "Motor",
        basePrice: 100.00
      }),
      isActive: true
    },
    {
      name: "Combo Freios Segurança",
      description: "Kit completo para revisão de freios com desconto especial. Segurança em primeiro lugar!",
      type: "weekly",
      discountType: "percentage",
      discountValue: 20,
      maxDiscount: 80.00,
      startsAt: now,
      endsAt: nextWeek,
      conditions: JSON.stringify({
        category: "Freios",
        basePrice: 200.00
      }),
      isActive: true
    },
    {
      name: "Kit Suspensão Confort",
      description: "Amortecedores e molas com desconto progressivo. Mais conforto para seu veículo!",
      type: "weekly",
      discountType: "percentage",
      discountValue: 12,
      maxDiscount: 100.00,
      startsAt: now,
      endsAt: nextWeek,
      conditions: JSON.stringify({
        category: "Suspensão",
        basePrice: 250.00
      }),
      isActive: true
    },
    {
      name: "Elétrica Premium",
      description: "Baterias, alternadores e sistemas elétricos com preços especiais!",
      type: "weekly", 
      discountType: "percentage",
      discountValue: 18,
      maxDiscount: 120.00,
      startsAt: now,
      endsAt: nextWeek,
      conditions: JSON.stringify({
        category: "Elétrica",
        basePrice: 300.00
      }),
      isActive: true
    },

    // PROMOÇÕES MENSAIS (Kits e Combos)
    {
      name: "Mega Kit Manutenção",
      description: "Kit completo de manutenção: óleo, filtros, velas e mais! Economia de até 30%!",
      type: "monthly",
      discountType: "percentage",
      discountValue: 30,
      maxDiscount: 150.00,
      startsAt: now,
      endsAt: nextMonth,
      conditions: JSON.stringify({
        category: "general",
        basePrice: 300.00,
        kit: true,
        items: ["Óleo", "Filtro óleo", "Filtro ar", "Velas"]
      }),
      isActive: true
    },
    {
      name: "Super Combo Revisão",
      description: "Combo especial para revisão completa com desconto progressivo. Mais de 25% de economia!",
      type: "monthly",
      discountType: "percentage",
      discountValue: 25,
      maxDiscount: 200.00,
      startsAt: now,
      endsAt: nextMonth,
      conditions: JSON.stringify({
        category: "general",
        basePrice: 500.00,
        combo: true
      }),
      isActive: true
    }
  ]

  const createdPromotions = []
  for (const promotion of promotions) {
    const created = await prisma.promotion.create({ data: promotion })
    createdPromotions.push(created)
    console.log(`✅ Promoção criada: ${promotion.name}`)
  }

  // ========================================
  // PEDIDOS DE EXEMPLO
  // ========================================

  console.log('📦 Criando pedidos de exemplo...')

  const orders = [
    {
      orderNumber: `ORD-${Date.now()}-001`,
      customerName: "João Silva",
      customerEmail: "joao.silva@email.com",
      customerPhone: "(11) 99999-1234",
      customerAddress: JSON.stringify({
        street: "Rua das Flores, 123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567"
      }),
      totalAmount: 89.70,
      status: "pending",
      notes: "Entrega no período da manhã"
    },
    {
      orderNumber: `ORD-${Date.now()}-002`, 
      customerName: "Maria Santos",
      customerEmail: "maria.santos@email.com",
      customerPhone: "(11) 88888-5678",
      customerAddress: JSON.stringify({
        street: "Av. Principal, 456",
        neighborhood: "Jardim Europa", 
        city: "São Paulo",
        state: "SP",
        zipCode: "05678-901"
      }),
      totalAmount: 156.80,
      status: "processing",
      notes: "Cliente preferencial"
    }
  ]

  for (const order of orders) {
    const created = await prisma.order.create({ data: order })
    console.log(`✅ Pedido criado: ${order.orderNumber}`)
  }

  console.log('✅ Seed concluído com sucesso!')
  console.log('\n📊 Resumo:')
  console.log(`   • ${createdProducts.length} produtos criados`)
  console.log(`   • ${createdServices.length} serviços criados`) 
  console.log(`   • ${createdCoupons.length} cupons criados`)
  console.log(`   • ${createdPromotions.length} promoções criadas`)
  console.log(`   • ${orders.length} pedidos de exemplo criados`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })