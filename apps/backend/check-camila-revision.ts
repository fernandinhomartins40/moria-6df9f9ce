import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCamilaRevision() {
  try {
    // Buscar cliente Camila
    const customer = await prisma.customer.findFirst({
      where: {
        name: {
          contains: 'Camila',
          mode: 'insensitive'
        }
      },
      include: {
        vehicles: true
      }
    });

    if (!customer) {
      console.log('❌ Cliente Camila não encontrada');
      return;
    }

    console.log('✅ Cliente encontrada:', customer.name);
    console.log('📧 Email:', customer.email);
    console.log('🚗 Veículos:', customer.vehicles.length);

    // Buscar veículo Jeep Renegade
    const vehicle = customer.vehicles.find(v =>
      v.brand.toLowerCase().includes('jeep') &&
      v.model.toLowerCase().includes('renegade')
    );

    if (!vehicle) {
      console.log('❌ Veículo Jeep Renegade não encontrado');
      console.log('Veículos disponíveis:', customer.vehicles.map(v => `${v.brand} ${v.model} ${v.year} - ${v.plate}`));
      return;
    }

    console.log('🚗 Veículo encontrado:', `${vehicle.brand} ${vehicle.model} ${vehicle.year} - ${vehicle.plate}`);

    // Buscar revisões deste veículo
    const revisions = await prisma.revision.findMany({
      where: {
        customerId: customer.id,
        vehicleId: vehicle.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`\n📋 Total de revisões encontradas: ${revisions.length}\n`);

    // Analisar cada revisão
    for (const revision of revisions) {
      console.log('=' .repeat(80));
      console.log(`🆔 ID: ${revision.id}`);
      console.log(`📅 Data: ${revision.date}`);
      console.log(`🔧 Status: ${revision.status}`);
      console.log(`📏 Quilometragem: ${revision.mileage || 'N/A'}`);
      console.log(`👨‍🔧 Mecânico: ${revision.mechanicName || 'Não atribuído'}`);
      console.log(`\n📋 ChecklistItems:`, typeof revision.checklistItems);

      if (revision.checklistItems) {
        const items = revision.checklistItems as any;
        if (Array.isArray(items)) {
          console.log(`✅ É um array com ${items.length} itens`);
          console.log('\n🔍 Estrutura do primeiro item:');
          if (items.length > 0) {
            console.log(JSON.stringify(items[0], null, 2));
          }

          // Contar itens por status
          const statusCounts: Record<string, number> = {};
          items.forEach((item: any) => {
            const status = item.status || 'UNKNOWN';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          });

          console.log('\n📊 Distribuição de status:');
          Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`  ${status}: ${count} itens`);
          });
        } else {
          console.log('⚠️ checklistItems não é um array:', items);
        }
      } else {
        console.log('❌ checklistItems é null ou undefined');
      }

      console.log('\n📝 Notas Gerais:', revision.generalNotes || 'Nenhuma');
      console.log('💡 Recomendações:', revision.recommendations || 'Nenhuma');
      console.log('🕒 Criado em:', revision.createdAt);
      console.log('🕒 Atualizado em:', revision.updatedAt);
      if (revision.completedAt) {
        console.log('✅ Concluído em:', revision.completedAt);
      }
      console.log('=' .repeat(80));
      console.log('\n');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCamilaRevision();
