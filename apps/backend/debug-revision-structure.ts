import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function debugRevisionStructure() {
  try {
    // Pegar a revisão da Camila
    const revision = await prisma.revision.findFirst({
      where: {
        id: 'fc39832f-54b1-418d-bd13-43cc88be8b84'
      }
    });

    if (!revision) {
      return;
    }

    const items = revision.checklistItems as any[];

    // Verificar estrutura dos primeiros 3 itens
    const sample = items.slice(0, 3);

    // Analisar estrutura
    sample.forEach((item, index) => {
      const hasItemId = 'itemId' in item;
      const hasId = 'id' in item;
      const hasCategoryId = 'categoryId' in item;
      const hasStatus = 'status' in item;

      // Criar objeto resumido
      const structure = {
        index,
        hasItemId,
        hasId,
        hasCategoryId,
        hasStatus,
        keys: Object.keys(item),
        itemIdValue: item.itemId,
        categoryIdValue: item.categoryId,
        statusValue: item.status
      };

      // Salvar em arquivo
      fs.writeFileSync(
        `debug-item-${index}.json`,
        JSON.stringify(item, null, 2)
      );

      fs.writeFileSync(
        `debug-structure-${index}.json`,
        JSON.stringify(structure, null, 2)
      );
    });

    // Buscar categorias do checklist
    const categories = await prisma.checklistCategory.findMany({
      include: {
        items: true
      }
    });

    // Pegar primeira categoria como exemplo
    const firstCategory = categories[0];
    if (firstCategory && firstCategory.items.length > 0) {
      const firstItem = firstCategory.items[0];

      fs.writeFileSync(
        'debug-category-item.json',
        JSON.stringify({
          categoryId: firstCategory.id,
          itemId: firstItem.id,
          itemName: firstItem.name
        }, null, 2)
      );
    }

    // Comparar IDs
    const revisionItemId = items[0].itemId;
    const categoryItemId = firstCategory?.items[0]?.id;

    fs.writeFileSync(
      'debug-comparison.json',
      JSON.stringify({
        revisionItemId,
        categoryItemId,
        match: revisionItemId === categoryItemId
      }, null, 2)
    );

  } catch (error) {
    fs.writeFileSync('debug-error.json', JSON.stringify({ error: String(error) }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

debugRevisionStructure();
