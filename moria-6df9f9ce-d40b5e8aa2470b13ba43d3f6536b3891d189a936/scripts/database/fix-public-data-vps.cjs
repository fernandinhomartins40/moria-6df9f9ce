#!/usr/bin/env node
// Script para corrigir dados públicos na VPS
const { PrismaClient } = require('@prisma/client');

async function fixPublicData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Corrigindo dados públicos na VPS...');
    
    // Marcar todos os produtos ativos como públicos
    const updatedProducts = await prisma.product.updateMany({
      where: { isActive: true },
      data: { 
        isPublic: true, 
        status: 'published' 
      }
    });
    
    // Marcar todos os serviços ativos como públicos  
    const updatedServices = await prisma.service.updateMany({
      where: { isActive: true },
      data: { 
        isPublic: true, 
        status: 'published' 
      }
    });
    
    // Marcar promoções ativas como públicas
    const updatedPromotions = await prisma.promotion.updateMany({
      where: { 
        isActive: true,
        endDate: { gte: new Date() }
      },
      data: { 
        isPublic: true, 
        status: 'published' 
      }
    });
    
    console.log(`✅ Produtos atualizados: ${updatedProducts.count}`);
    console.log(`✅ Serviços atualizados: ${updatedServices.count}`);
    console.log(`✅ Promoções atualizadas: ${updatedPromotions.count}`);
    
    // Verificar resultados finais
    const [publicProducts, publicServices, publicPromotions] = await Promise.all([
      prisma.product.count({ where: { isPublic: true, isActive: true } }),
      prisma.service.count({ where: { isPublic: true, isActive: true } }),
      prisma.promotion.count({ where: { isPublic: true, isActive: true } })
    ]);
    
    console.log('\n📊 Verificação final:');
    console.log(`  Produtos públicos: ${publicProducts}`);
    console.log(`  Serviços públicos: ${publicServices}`);
    console.log(`  Promoções públicas: ${publicPromotions}`);
    
    if (publicProducts > 0 || publicServices > 0) {
      console.log('\n🎉 Sucesso! APIs públicas agora têm dados disponíveis');
    } else {
      console.log('\n⚠️ Atenção: Ainda não há dados públicos disponíveis');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir dados:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixPublicData();