#!/usr/bin/env node
// ========================================
// MIGRAÇÃO DE DADOS LEGACY PARA SISTEMA ROBUSTO
// ========================================
const { PrismaClient } = require('@prisma/client');

class LegacyDataMigration {
  constructor() {
    this.prisma = new PrismaClient();
    this.migrationId = new Date().toISOString().replace(/[:.]/g, '-');
    this.stats = {
      products: { migrated: 0, errors: 0 },
      services: { migrated: 0, errors: 0 },
      promotions: { migrated: 0, errors: 0 },
      totalErrors: []
    };
  }

  async runMigration() {
    console.log('🔄 Iniciando migração de dados legacy...');
    console.log(`📋 Migration ID: ${this.migrationId}`);

    try {
      // Verificar conexão
      await this.prisma.$connect();
      console.log('✅ Conexão com banco estabelecida');

      // 1. Migrar produtos
      await this.migrateProducts();

      // 2. Migrar serviços
      await this.migrateServices();

      // 3. Migrar promoções
      await this.migratePromotions();

      // 4. Verificar integridade
      await this.verifyIntegrity();

      // 5. Relatório final
      this.generateReport();

      console.log('\n✅ Migração concluída com sucesso!');
      return { success: true, stats: this.stats };

    } catch (error) {
      console.error('\n❌ Migração falhou:', error.message);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async migrateProducts() {
    console.log('\n📦 Migrando produtos...');

    try {
      // Buscar todos os produtos para verificar e migrar
      const allProducts = await this.prisma.product.findMany();
      
      // Filtrar produtos que precisam migração 
      const productsToMigrate = allProducts.filter(product => 
        product.isPublic === null || 
        product.status === null || 
        product.status === '' ||
        product.isPublic === undefined
      );

      console.log(`  📊 ${productsToMigrate.length} produtos precisam de migração`);

      for (const product of productsToMigrate) {
        try {
          const updates = {};
          
          // Definir visibilidade pública
          if (product.isPublic === null) {
            // Produtos ativos por padrão são públicos
            updates.isPublic = product.isActive !== false;
          }
          
          // Definir status
          if (product.status === null) {
            updates.status = product.isActive === false ? 'archived' : 'published';
          }

          // Garantir campos obrigatórios
          if (!product.rating) updates.rating = 0;
          if (!product.stock) updates.stock = 0;
          if (!product.minStock) updates.minStock = 5;

          if (Object.keys(updates).length > 0) {
            await this.prisma.product.update({
              where: { id: product.id },
              data: updates
            });

            this.stats.products.migrated++;
            console.log(`    ✅ Produto migrado: ${product.name} (ID: ${product.id})`);
          }

        } catch (error) {
          this.stats.products.errors++;
          this.stats.totalErrors.push(`Produto ${product.id}: ${error.message}`);
          console.error(`    ❌ Erro no produto ${product.id}: ${error.message}`);
        }
      }

      console.log(`  ✅ ${this.stats.products.migrated} produtos migrados com sucesso`);
      if (this.stats.products.errors > 0) {
        console.warn(`  ⚠️ ${this.stats.products.errors} erros encontrados`);
      }

    } catch (error) {
      console.error('❌ Erro na migração de produtos:', error);
      throw error;
    }
  }

  async migrateServices() {
    console.log('\n🔧 Migrando serviços...');

    try {
      const allServices = await this.prisma.service.findMany();
      
      const servicesToMigrate = allServices.filter(service => 
        service.isPublic === null || 
        service.status === null || 
        service.status === '' ||
        service.isPublic === undefined
      );

      console.log(`  📊 ${servicesToMigrate.length} serviços precisam de migração`);

      for (const service of servicesToMigrate) {
        try {
          const updates = {};
          
          // Definir visibilidade pública
          if (service.isPublic === null) {
            updates.isPublic = service.isActive !== false;
          }
          
          // Definir status
          if (service.status === null) {
            updates.status = service.isActive === false ? 'archived' : 'published';
          }

          if (Object.keys(updates).length > 0) {
            await this.prisma.service.update({
              where: { id: service.id },
              data: updates
            });

            this.stats.services.migrated++;
            console.log(`    ✅ Serviço migrado: ${service.name} (ID: ${service.id})`);
          }

        } catch (error) {
          this.stats.services.errors++;
          this.stats.totalErrors.push(`Serviço ${service.id}: ${error.message}`);
          console.error(`    ❌ Erro no serviço ${service.id}: ${error.message}`);
        }
      }

      console.log(`  ✅ ${this.stats.services.migrated} serviços migrados com sucesso`);
      if (this.stats.services.errors > 0) {
        console.warn(`  ⚠️ ${this.stats.services.errors} erros encontrados`);
      }

    } catch (error) {
      console.error('❌ Erro na migração de serviços:', error);
      throw error;
    }
  }

  async migratePromotions() {
    console.log('\n🎉 Migrando promoções...');

    try {
      const allPromotions = await this.prisma.promotion.findMany();
      
      const promotionsToMigrate = allPromotions.filter(promotion => 
        promotion.isPublic === null || 
        promotion.status === null || 
        promotion.status === '' ||
        promotion.isPublic === undefined
      );

      console.log(`  📊 ${promotionsToMigrate.length} promoções precisam de migração`);

      for (const promotion of promotionsToMigrate) {
        try {
          const updates = {};
          
          // Definir visibilidade pública
          if (promotion.isPublic === null) {
            // Promoções ativas e dentro do prazo são públicas
            const now = new Date();
            const isValid = promotion.isActive && 
                          promotion.startDate <= now && 
                          promotion.endDate >= now;
            updates.isPublic = isValid;
          }
          
          // Definir status
          if (promotion.status === null) {
            const now = new Date();
            if (!promotion.isActive) {
              updates.status = 'archived';
            } else if (promotion.endDate < now) {
              updates.status = 'expired';
            } else if (promotion.startDate > now) {
              updates.status = 'scheduled';
            } else {
              updates.status = 'published';
            }
          }

          // Garantir campos obrigatórios
          if (!promotion.usedCount) updates.usedCount = 0;

          if (Object.keys(updates).length > 0) {
            await this.prisma.promotion.update({
              where: { id: promotion.id },
              data: updates
            });

            this.stats.promotions.migrated++;
            console.log(`    ✅ Promoção migrada: ${promotion.title} (ID: ${promotion.id})`);
          }

        } catch (error) {
          this.stats.promotions.errors++;
          this.stats.totalErrors.push(`Promoção ${promotion.id}: ${error.message}`);
          console.error(`    ❌ Erro na promoção ${promotion.id}: ${error.message}`);
        }
      }

      console.log(`  ✅ ${this.stats.promotions.migrated} promoções migradas com sucesso`);
      if (this.stats.promotions.errors > 0) {
        console.warn(`  ⚠️ ${this.stats.promotions.errors} erros encontrados`);
      }

    } catch (error) {
      console.error('❌ Erro na migração de promoções:', error);
      throw error;
    }
  }

  async verifyIntegrity() {
    console.log('\n🔍 Verificando integridade pós-migração...');

    try {
      // Contar dados públicos
      const [publicProducts, publicServices, publicPromotions] = await Promise.all([
        this.prisma.product.count({
          where: { 
            isPublic: true, 
            isActive: true, 
            status: 'published' 
          }
        }),
        this.prisma.service.count({
          where: { 
            isPublic: true, 
            isActive: true, 
            status: 'published' 
          }
        }),
        this.prisma.promotion.count({
          where: { 
            isPublic: true, 
            isActive: true, 
            status: 'published' 
          }
        })
      ]);

      console.log('  📊 Dados públicos disponíveis:');
      console.log(`    🛒 Produtos: ${publicProducts}`);
      console.log(`    🔧 Serviços: ${publicServices}`);
      console.log(`    🎉 Promoções: ${publicPromotions}`);

      // Verificar se há dados suficientes
      if (publicProducts === 0 && publicServices === 0) {
        console.warn('  ⚠️ ATENÇÃO: Nenhum produto ou serviço público disponível!');
        console.warn('    As APIs públicas retornarão arrays vazios');
      }

      this.stats.integrity = {
        publicProducts,
        publicServices, 
        publicPromotions
      };

    } catch (error) {
      console.error('❌ Erro na verificação de integridade:', error);
      throw error;
    }
  }

  generateReport() {
    console.log('\n📋 RELATÓRIO FINAL DA MIGRAÇÃO');
    console.log('========================================');
    console.log(`Migration ID: ${this.migrationId}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('');
    console.log('📊 Estatísticas:');
    console.log(`  🛒 Produtos migrados: ${this.stats.products.migrated}`);
    console.log(`  🔧 Serviços migrados: ${this.stats.services.migrated}`);
    console.log(`  🎉 Promoções migradas: ${this.stats.promotions.migrated}`);
    console.log('');
    console.log('🌐 Dados públicos disponíveis:');
    console.log(`  🛒 Produtos: ${this.stats.integrity.publicProducts}`);
    console.log(`  🔧 Serviços: ${this.stats.integrity.publicServices}`);
    console.log(`  🎉 Promoções: ${this.stats.integrity.publicPromotions}`);
    console.log('');
    
    const totalErrors = this.stats.products.errors + this.stats.services.errors + this.stats.promotions.errors;
    if (totalErrors > 0) {
      console.log(`❌ Total de erros: ${totalErrors}`);
      this.stats.totalErrors.forEach(error => {
        console.log(`  • ${error}`);
      });
    } else {
      console.log('✅ Nenhum erro encontrado');
    }

    console.log('========================================');
    
    if (this.stats.integrity.publicProducts === 0 && this.stats.integrity.publicServices === 0) {
      console.log('\n⚠️ AÇÃO NECESSÁRIA:');
      console.log('Marque alguns produtos/serviços como públicos para que');
      console.log('as APIs públicas tenham dados para retornar.');
    } else {
      console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
      console.log('As APIs públicas já têm dados disponíveis.');
    }
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  const migration = new LegacyDataMigration();
  
  migration.runMigration()
    .then(() => {
      console.log('\n✅ MIGRAÇÃO DE DADOS CONCLUÍDA!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ MIGRAÇÃO FALHOU:', error.message);
      process.exit(1);
    });
}

module.exports = { LegacyDataMigration };