import { prisma } from './src/config/database.js';

async function createTestRevision() {
  try {
    // 1. Encontrar Fernando Martins
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { name: { contains: 'Fernando Martins' } },
          { email: { contains: 'fernando' } }
        ]
      },
      include: { vehicles: true }
    });

    if (!customer) {
      console.log('❌ Fernando Martins não encontrado');
      await prisma.$disconnect();
      return;
    }

    console.log('✅ Cliente encontrado:', customer.name);
    console.log('📧 Email:', customer.email);

    // 2. Deletar revisões antigas
    const deleted = await prisma.revision.deleteMany({
      where: { customerId: customer.id }
    });
    console.log(`🗑️  Deletadas ${deleted.count} revisões antigas`);

    // 3. Pegar o veículo do cliente
    const vehicle = customer.vehicles[0];
    if (!vehicle) {
      console.log('❌ Cliente não tem veículos');
      await prisma.$disconnect();
      return;
    }

    console.log('🚗 Veículo:', vehicle.brand, vehicle.model, '-', vehicle.plate);

    // 4. Buscar categorias de checklist
    const checklistCategories = await prisma.checklistCategory.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    console.log(`📋 Encontradas ${checklistCategories.length} categorias de checklist`);

    // 5. Criar checklist items com status variados para teste
    const checklistItems = checklistCategories.map((category, catIdx) => ({
      categoryId: category.id,
      categoryName: category.name,
      items: category.items.map((item, itemIdx) => {
        // Vamos criar um padrão de status para teste
        let status: string;
        let notes: string | null = null;

        // Categoria Motor - alguns críticos
        if (catIdx === 0) {
          if (itemIdx === 0) {
            status = 'CRITICAL';
            notes = '⚠️ URGENTE: Óleo do motor muito sujo e abaixo do nível mínimo. Necessita troca imediata!';
          } else if (itemIdx === 1) {
            status = 'CRITICAL';
            notes = 'Filtro de óleo completamente saturado. Troca urgente necessária.';
          } else if (itemIdx === 6) {
            status = 'ATTENTION';
            notes = 'Correia dentada com sinais de desgaste. Recomenda-se troca em breve.';
          } else {
            status = 'OK';
          }
        }
        // Categoria Freios - alguns com atenção
        else if (catIdx === 1) {
          if (itemIdx === 0) {
            status = 'ATTENTION';
            notes = 'Pastilhas de freio com 30% de vida útil. Agendar troca nas próximas semanas.';
          } else if (itemIdx === 2) {
            status = 'ATTENTION';
            notes = 'Fluido de freio levemente escurecido. Trocar na próxima manutenção.';
          } else {
            status = 'OK';
          }
        }
        // Categoria Suspensão - um crítico
        else if (catIdx === 2) {
          if (itemIdx === 0) {
            status = 'CRITICAL';
            notes = '⚠️ Amortecedor dianteiro esquerdo vazando óleo. Substituição imediata necessária!';
          } else if (itemIdx === 2) {
            status = 'ATTENTION';
            notes = 'Barra estabilizadora com folga. Monitorar.';
          } else {
            status = 'OK';
          }
        }
        // Outras categorias - mix de status
        else {
          const random = Math.random();
          if (random < 0.1) {
            status = 'CRITICAL';
            notes = 'Problema identificado que requer atenção imediata.';
          } else if (random < 0.3) {
            status = 'ATTENTION';
            notes = 'Desgaste normal. Monitorar nas próximas revisões.';
          } else {
            status = 'OK';
          }
        }

        return {
          itemId: item.id,
          itemName: item.name,
          status,
          notes
        };
      })
    }));

    // 6. Criar a revisão
    const revision = await prisma.revision.create({
      data: {
        customerId: customer.id,
        vehicleId: vehicle.id,
        date: new Date(),
        mileage: 45000,
        status: 'COMPLETED',
        checklistItems: checklistItems,
        generalNotes: 'Revisão completa realizada em ' + new Date().toLocaleDateString('pt-BR') + '. Veículo apresenta alguns itens críticos que necessitam atenção imediata. Cliente foi notificado sobre as prioridades de reparo.',
        recommendations: `🔴 URGENTE - Itens Críticos:
- Troca de óleo e filtro do motor IMEDIATAMENTE
- Substituição do amortecedor dianteiro esquerdo

🟡 Atenção - Próximas 2 semanas:
- Troca de pastilhas de freio
- Verificar correia dentada

✅ Observações Gerais:
- Demais itens em bom estado
- Próxima revisão recomendada em 10.000 km ou 6 meses
- Manter calibragem dos pneus em dia`,
        mechanicName: 'João Silva',
        mechanicNotes: 'Cliente orientado sobre as urgências. Todos os itens críticos foram devidamente explicados. Veículo não deve circular até correção do óleo do motor.',
        completedAt: new Date()
      },
      include: {
        vehicle: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('\n✅ REVISÃO CRIADA COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ID da Revisão:', revision.id);
    console.log('Cliente:', revision.customer.name);
    console.log('Veículo:', revision.vehicle.brand, revision.vehicle.model);
    console.log('Quilometragem:', revision.mileage, 'km');
    console.log('Status:', revision.status);

    // Contar itens por status
    const allItems = checklistItems.flatMap(cat => cat.items);
    const criticalCount = allItems.filter(i => i.status === 'CRITICAL').length;
    const attentionCount = allItems.filter(i => i.status === 'ATTENTION').length;
    const okCount = allItems.filter(i => i.status === 'OK').length;

    console.log('\n📊 Estatísticas do Checklist:');
    console.log(`   🔴 Críticos: ${criticalCount}`);
    console.log(`   🟡 Atenção: ${attentionCount}`);
    console.log(`   ✅ OK: ${okCount}`);
    console.log(`   📋 Total: ${allItems.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createTestRevision();
