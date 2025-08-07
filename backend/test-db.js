// Teste rápido do banco SQLite
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log('🧪 Testando conexão com SQLite...');
    
    // Contar produtos
    const productCount = await prisma.product.count();
    console.log(`📦 Total de produtos: ${productCount}`);
    
    // Buscar produtos
    const products = await prisma.product.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        category: true,
        price: true
      }
    });
    
    console.log('📋 Produtos encontrados:');
    products.forEach(p => {
      console.log(`  ${p.id}: ${p.name} (${p.category}) - R$ ${p.price}`);
    });
    
    // Contar serviços
    const serviceCount = await prisma.service.count();
    console.log(`🔧 Total de serviços: ${serviceCount}`);
    
    console.log('✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();