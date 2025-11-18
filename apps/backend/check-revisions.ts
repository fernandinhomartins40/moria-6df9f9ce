import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRevisions() {
  try {
    const count = await prisma.revision.count();
    console.log('Total de revisões:', count);

    if (count > 0) {
      const revisions = await prisma.revision.findMany({
        include: {
          customer: {
            select: {
              name: true,
              email: true
            }
          }
        },
        take: 5,
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log('\nÚltimas 5 revisões:');
      revisions.forEach((rev, index) => {
        console.log(`\n${index + 1}. ID: ${rev.id}`);
        console.log(`   Cliente: ${rev.customer.name} (${rev.customer.email})`);
        console.log(`   Veículo: ${rev.vehicleBrand} ${rev.vehicleModel} ${rev.vehicleYear}`);
        console.log(`   Status: ${rev.status}`);
        console.log(`   Data: ${rev.createdAt.toLocaleDateString('pt-BR')}`);
      });
    } else {
      console.log('\n⚠️ Nenhuma revisão encontrada no banco de dados');
    }
  } catch (error) {
    console.error('Erro ao verificar revisões:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRevisions();
