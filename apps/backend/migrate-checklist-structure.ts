import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Migra a estrutura de checklistItems de formato agrupado para formato plano
 *
 * ANTES (agrupado por categoria):
 * [
 *   { categoryId: "...", categoryName: "Freios", items: [ { itemId: "...", status: "OK" }, ... ] }
 * ]
 *
 * DEPOIS (array plano):
 * [
 *   { categoryId: "...", categoryName: "Freios", itemId: "...", status: "OK" },
 *   { categoryId: "...", categoryName: "Freios", itemId: "...", status: "ATTENTION" }
 * ]
 */
async function migrateChecklistStructure() {
  try {
    console.log('🔄 Iniciando migração de estrutura de checklistItems...\n');

    // Buscar todas as revisões
    const revisions = await prisma.revision.findMany({
      select: {
        id: true,
        checklistItems: true,
        status: true
      }
    });

    console.log(`📋 Total de revisões encontradas: ${revisions.length}\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const revision of revisions) {
      try {
        const items = revision.checklistItems as any;

        if (!items || !Array.isArray(items) || items.length === 0) {
          console.log(`⏭️  Revisão ${revision.id} - sem checklistItems, pulando`);
          skippedCount++;
          continue;
        }

        // Verificar se já está no formato correto (items tem itemId diretamente)
        const firstItem = items[0];
        if (firstItem && firstItem.itemId && !firstItem.items) {
          console.log(`✅ Revisão ${revision.id} - já está no formato correto, pulando`);
          skippedCount++;
          continue;
        }

        // Verificar se está no formato antigo (items agrupados por categoria)
        if (firstItem && firstItem.items && Array.isArray(firstItem.items)) {
          console.log(`🔧 Revisão ${revision.id} - migrando do formato agrupado para plano...`);

          // Converter para formato plano
          const flatItems: any[] = [];

          items.forEach((category: any) => {
            if (category.items && Array.isArray(category.items)) {
              category.items.forEach((item: any) => {
                flatItems.push({
                  categoryId: category.categoryId,
                  categoryName: category.categoryName,
                  itemId: item.itemId,
                  itemName: item.itemName,
                  status: item.status || 'NOT_CHECKED',
                  notes: item.notes || null,
                  photos: item.photos || [],
                  checkedAt: item.checkedAt || null,
                  checkedBy: item.checkedBy || null
                });
              });
            }
          });

          console.log(`   📊 Converteu ${items.length} categorias em ${flatItems.length} itens`);

          // Atualizar no banco
          await prisma.revision.update({
            where: { id: revision.id },
            data: { checklistItems: flatItems }
          });

          console.log(`   ✅ Revisão ${revision.id} migrada com sucesso!\n`);
          migratedCount++;
        } else {
          console.log(`⚠️  Revisão ${revision.id} - formato desconhecido, pulando`);
          console.log(`   Primeiro item:`, JSON.stringify(firstItem, null, 2));
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Erro ao migrar revisão ${revision.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('📊 RESULTADO DA MIGRAÇÃO:');
    console.log('='.repeat(80));
    console.log(`✅ Migradas com sucesso: ${migratedCount}`);
    console.log(`⏭️  Puladas (já corretas): ${skippedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📋 Total processadas: ${revisions.length}`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
migrateChecklistStructure();
