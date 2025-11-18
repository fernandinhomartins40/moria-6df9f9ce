import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const revisionId = '884edc80-2dc2-4f06-bffd-919bdc86e085';

  const revision = await prisma.revision.findUnique({
    where: { id: revisionId },
  });

  if (!revision) {
    console.log('❌ Revisão não encontrada!');
    return;
  }

  console.log('📋 Revisão encontrada:');
  console.log('  ID:', revision.id);
  console.log('  Status atual:', revision.status);
  console.log('  Cliente ID:', revision.customerId);

  // Reset status para IN_PROGRESS
  const updated = await prisma.revision.update({
    where: { id: revisionId },
    data: {
      status: 'IN_PROGRESS',
      completedAt: null,
      nextRevisionDate: null,
      nextRevisionMileage: null,
      nextOilChangeDate: null,
      nextOilChangeMileage: null,
      oilChangeDate: null,
      oilChangeMileage: null,
      revisionData: null,
      servicesPerformed: [],
      partsReplaced: [],
    },
  });

  console.log('\n✅ Status da revisão resetado para IN_PROGRESS');
  console.log('   Agora você pode testá-la novamente!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
