import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedShippingMethods() {
  console.log('🚀 Seeding shipping methods...');

  const methods = [
    {
      name: 'Correios PAC',
      type: 'CORREIOS',
      trackingUrl: 'https://rastreamento.correios.com.br/app/index.php?codigo={code}',
      isActive: true,
      order: 1,
    },
    {
      name: 'Correios SEDEX',
      type: 'CORREIOS',
      trackingUrl: 'https://rastreamento.correios.com.br/app/index.php?codigo={code}',
      isActive: true,
      order: 2,
    },
    {
      name: 'Transportadora',
      type: 'TRANSPORTADORA',
      isActive: true,
      order: 3,
    },
    {
      name: 'Motoboy',
      type: 'MOTOBOY',
      isActive: true,
      order: 4,
    },
    {
      name: 'Retirada na Loja',
      type: 'RETIRADA',
      isActive: true,
      order: 5,
    },
  ];

  for (const method of methods) {
    const existing = await prisma.shippingMethod.findUnique({
      where: { name: method.name },
    });

    if (!existing) {
      await prisma.shippingMethod.create({
        data: method,
      });
      console.log(`✅ Created: ${method.name}`);
    } else {
      console.log(`⏭️  Skipped (already exists): ${method.name}`);
    }
  }

  console.log('✨ Shipping methods seed completed!');
}

seedShippingMethods()
  .catch((error) => {
    console.error('❌ Error seeding shipping methods:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
