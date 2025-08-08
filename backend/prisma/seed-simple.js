const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed simplificado...')

  // ========================================
  // PRODUTOS REALISTAS
  // ========================================

  console.log('🔧 Criando produtos...')

  const products = [
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
        compatibilidade: ["VW Gol", "Fiat Uno", "Ford Ka"]
      }),
      vehicleCompatibility: JSON.stringify([
        { brand: "Volkswagen", models: ["Gol", "Fox", "Polo"] },
        { brand: "Fiat", models: ["Uno", "Palio", "Siena"] }
      ])
    },
    {
      name: "Óleo Motor Castrol GTX 20W50 1L",
      description: "Óleo lubrificante mineral Castrol GTX 20W50 para motores a gasolina e álcool.",
      category: "Motor",
      price: 18.90,
      salePrice: 15.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 120,
      isActive: true,
      rating: 4.7
    },
    {
      name: "Vela de Ignição NGK BPR6ES",
      description: "Vela de ignição NGK modelo BPR6ES com eletrodo de níquel.",
      category: "Motor",
      price: 12.50,
      salePrice: 9.90,
      promoPrice: 8.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 80,
      isActive: true,
      rating: 4.9
    },
    {
      name: "Pastilha de Freio Cobreq N-509",
      description: "Pastilha de freio dianteira Cobreq modelo N-509. Composto cerâmico.",
      category: "Freios",
      price: 45.90,
      salePrice: 39.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 40,
      isActive: true,
      rating: 4.6
    },
    {
      name: "Bateria Moura 60Ah M60GD",
      description: "Bateria automotiva Moura 60Ah modelo M60GD. Tecnologia prata com 18 meses de garantia.",
      category: "Elétrica",
      price: 320.00,
      salePrice: 289.90,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 12,
      isActive: true,
      rating: 4.8
    }
  ]

  const createdProducts = []
  for (const product of products) {
    const created = await prisma.product.create({ data: product })
    createdProducts.push(created)
    console.log(`✅ Produto criado: ${product.name}`)
  }

  // ========================================
  // SERVIÇOS
  // ========================================

  console.log('🔧 Criando serviços...')

  const services = [
    {
      name: "Troca de Óleo e Filtro",
      description: "Serviço completo de troca de óleo motor com filtro.",
      category: "Motor",
      basePrice: 45.00,
      estimatedTime: "30 minutos",
      specifications: JSON.stringify({
        inclui: ["Óleo 20W50 4L", "Filtro de óleo", "Mão de obra"]
      }),
      isActive: true
    },
    {
      name: "Alinhamento e Balanceamento",
      description: "Alinhamento de direção computadorizado + balanceamento das 4 rodas.",
      category: "Suspensão",
      basePrice: 89.90,
      estimatedTime: "1 hora",
      specifications: JSON.stringify({
        equipamento: "Computadorizado",
        inclui: ["Alinhamento", "Balanceamento 4 rodas"]
      }),
      isActive: true
    },
    {
      name: "Revisão de Freios Completa",
      description: "Inspeção completa do sistema de freios.",
      category: "Freios",
      basePrice: 25.00,
      estimatedTime: "45 minutos",
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
  // CUPONS
  // ========================================

  console.log('🎫 Criando cupons...')

  const coupons = [
    {
      code: "BEMVINDO10",
      description: "10% de desconto para novos clientes na primeira compra",
      discountType: "percentage",
      discountValue: 10,
      minAmount: 50.00,
      maxUses: 100,
      usedCount: 0,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      code: "FRETE15",
      description: "R$ 15,00 de desconto no frete para compras acima de R$ 100",
      discountType: "fixed_amount",
      discountValue: 15.00,
      minAmount: 100.00,
      maxUses: 50,
      usedCount: 0,
      expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
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
  // PROMOÇÕES
  // ========================================

  console.log('🏷️  Criando promoções...')

  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const promotions = [
    // PROMOÇÕES DIÁRIAS
    {
      name: "Flash: Filtro de Óleo",
      description: "Oferta relâmpago! Filtro de óleo com desconto especial!",
      type: "daily",
      discountType: "percentage",
      discountValue: 25,
      startsAt: now,
      endsAt: tomorrow,
      conditions: JSON.stringify({
        productId: createdProducts[0]?.id,
        category: "Motor",
        basePrice: 24.90
      }),
      isActive: true
    },
    {
      name: "Flash: Velas NGK",
      description: "Velas de ignição NGK com preço imperdível!",
      type: "daily",
      discountType: "fixed_amount",
      discountValue: 3.60,
      startsAt: now,
      endsAt: tomorrow,
      conditions: JSON.stringify({
        productId: createdProducts[2]?.id,
        category: "Motor",
        basePrice: 12.50
      }),
      isActive: true
    },
    // PROMOÇÕES SEMANAIS
    {
      name: "Semana do Motor",
      description: "Semana especial com descontos em peças do motor!",
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
      name: "Kit Freios Segurança",
      description: "Kit completo para revisão de freios!",
      type: "weekly",
      discountType: "percentage",
      discountValue: 20,
      startsAt: now,
      endsAt: nextWeek,
      conditions: JSON.stringify({
        category: "Freios",
        basePrice: 200.00
      }),
      isActive: true
    },
    // PROMOÇÕES MENSAIS
    {
      name: "Mega Kit Manutenção",
      description: "Kit completo de manutenção com economia de até 30%!",
      type: "monthly",
      discountType: "percentage",
      discountValue: 30,
      maxDiscount: 150.00,
      startsAt: now,
      endsAt: nextMonth,
      conditions: JSON.stringify({
        category: "general",
        basePrice: 300.00,
        kit: true
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

  console.log('✅ Seed concluído com sucesso!')
  console.log('\n📊 Resumo:')
  console.log(`   • ${createdProducts.length} produtos criados`)
  console.log(`   • ${createdServices.length} serviços criados`) 
  console.log(`   • ${createdCoupons.length} cupons criados`)
  console.log(`   • ${createdPromotions.length} promoções criadas`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })