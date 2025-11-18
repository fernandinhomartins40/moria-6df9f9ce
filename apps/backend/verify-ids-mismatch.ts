import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function verifyIdsMismatch() {
  try {
    // Buscar categorias e itens do checklist
    const categories = await prisma.checklistCategory.findMany({
      include: {
        items: {
          where: { isEnabled: true },
          orderBy: { order: 'asc' }
        }
      },
      where: { isEnabled: true },
      orderBy: { order: 'asc' }
    });

    // Buscar revisão da Camila
    const revision = await prisma.revision.findFirst({
      where: {
        id: 'fc39832f-54b1-418d-bd13-43cc88be8b84'
      }
    });

    if (!revision) {
      fs.writeFileSync('verify-error.json', JSON.stringify({ error: 'Revisão não encontrada' }, null, 2));
      return;
    }

    const revisionItems = revision.checklistItems as any[];

    // Criar mapa de itemId para status
    const itemStatusMap = new Map();
    revisionItems.forEach(item => {
      itemStatusMap.set(item.itemId, item.status);
    });

    // Verificar correspondência
    const analysis: any[] = [];
    let matched = 0;
    let notMatched = 0;

    categories.forEach(category => {
      category.items.forEach(item => {
        const hasStatus = itemStatusMap.has(item.id);
        const status = itemStatusMap.get(item.id);

        if (hasStatus) {
          matched++;
        } else {
          notMatched++;
        }

        analysis.push({
          categoryName: category.name,
          itemName: item.name,
          itemIdFromCategory: item.id,
          hasStatus,
          status: status || 'NOT_FOUND'
        });
      });
    });

    fs.writeFileSync('verify-analysis.json', JSON.stringify({
      totalCategoryItems: analysis.length,
      totalRevisionItems: revisionItems.length,
      matched,
      notMatched,
      details: analysis.slice(0, 10) // Primeiros 10 para análise
    }, null, 2));

  } catch (error) {
    fs.writeFileSync('verify-error.json', JSON.stringify({ error: String(error) }, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

verifyIdsMismatch();
