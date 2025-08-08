// ============================================
// SEED - Migrar dados MOCK para SQLite
// ============================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // ============================================
  // PRODUTOS - Dados do frontend mock
  // ============================================
  
  console.log('📦 Inserindo produtos...');

  const products = [
    {
      name: "Pastilha de Freio Cerâmica",
      description: "Pastilha de freio de alta qualidade com cerâmica para maior durabilidade e performance",
      category: "Freios",
      price: 89.90,
      salePrice: 120.00,
      promoPrice: 89.90, // Preço com desconto de 25%
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 15,
      isActive: true,
      rating: 4.8,
      specifications: JSON.stringify({
        "material": "Cerâmica",
        "compatibilidade": "Veículos populares",
        "garantia": "12 meses"
      }),
      vehicleCompatibility: JSON.stringify(["Honda Civic", "Toyota Corolla", "Volkswagen Gol"])
    },
    {
      name: "Filtro de Ar Esportivo",
      description: "Filtro de ar de alta performance para melhorar a respiração do motor",
      category: "Filtros",
      price: 156.90,
      salePrice: 220.00,
      promoPrice: 156.90, // Preço com desconto de 30%
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 8,
      isActive: true,
      rating: 4.9,
      specifications: JSON.stringify({
        "tipo": "Esportivo",
        "material": "Algodão",
        "fluxo_ar": "Alto"
      }),
      vehicleCompatibility: JSON.stringify(["Ford Focus", "Chevrolet Cruze", "Nissan Sentra"])
    },
    {
      name: "Óleo Motor 5W30 Sintético",
      description: "Óleo sintético premium para máxima proteção do motor",
      category: "Óleos",
      price: 45.90,
      salePrice: null,
      promoPrice: null,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 25,
      isActive: true,
      rating: 4.7,
      specifications: JSON.stringify({
        "viscosidade": "5W30",
        "tipo": "Sintético",
        "volume": "1L"
      }),
      vehicleCompatibility: JSON.stringify(["Motores flex", "Motores gasolina", "Motores turbo"])
    },
    {
      name: "Amortecedor Dianteiro",
      description: "Amortecedor dianteiro para maior conforto e segurança na direção",
      category: "Suspensão",
      price: 234.90,
      salePrice: 280.00,
      promoPrice: 234.90, // Preço com desconto de 16%
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 6,
      isActive: true,
      rating: 4.6,
      specifications: JSON.stringify({
        "posicao": "Dianteiro",
        "tipo": "Pressurizado",
        "garantia": "24 meses"
      }),
      vehicleCompatibility: JSON.stringify(["Honda Civic", "Toyota Corolla"])
    },
    {
      name: "Bateria 60Ah",
      description: "Bateria automotiva de alta capacidade e longa duração",
      category: "Elétrica",
      price: 189.90,
      salePrice: 250.00,
      promoPrice: 189.90, // Preço com desconto de 24%
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 12,
      isActive: true,
      rating: 4.8,
      specifications: JSON.stringify({
        "capacidade": "60Ah",
        "voltagem": "12V",
        "garantia": "18 meses"
      }),
      vehicleCompatibility: JSON.stringify(["Carros populares", "SUVs compactos"])
    },
    {
      name: "Kit Velas de Ignição",
      description: "Kit completo com 4 velas de ignição para motor 1.0/1.4",
      category: "Motor",
      price: 67.90,
      salePrice: null,
      promoPrice: null,
      images: JSON.stringify(["/api/placeholder/300/300"]),
      stock: 0, // Fora de estoque
      isActive: true,
      rating: 4.9,
      specifications: JSON.stringify({
        "quantidade": "4 unidades",
        "tipo": "Iridium",
        "motor": "1.0/1.4"
      }),
      vehicleCompatibility: JSON.stringify(["Volkswagen Gol", "Fiat Uno", "Ford Ka"])
    }
  ];

  for (const productData of products) {
    await prisma.product.create({
      data: productData
    });
  }

  console.log(`✅ ${products.length} produtos inseridos`);

  // ============================================
  // SERVIÇOS - Dados do frontend mock
  // ============================================
  
  console.log('🔧 Inserindo serviços...');

  const services = [
    {
      name: "Manutenção Preventiva",
      description: "Revisões completas para manter seu veículo sempre em perfeito estado",
      category: "Manutenção",
      basePrice: 150.00,
      estimatedTime: "2 horas",
      specifications: JSON.stringify({
        "includes": ["Revisão geral", "Checklist completo", "Relatório detalhado"],
        "duracao": "Serviço completo",
        "garantia": "Garantia inclusa",
        "qualidade": "Peças originais"
      }),
      isActive: true
    },
    {
      name: "Troca de Óleo",
      description: "Óleos originais e de qualidade para prolongar a vida do motor",
      category: "Manutenção",
      basePrice: 80.00,
      estimatedTime: "30 minutos",
      specifications: JSON.stringify({
        "includes": ["Óleos premium", "Filtros inclusos", "Descarte ecológico"],
        "duracao": "Serviço rápido",
        "garantia": "Garantia inclusa",
        "qualidade": "Óleos premium"
      }),
      isActive: true
    },
    {
      name: "Diagnóstico Eletrônico",
      description: "Equipamentos modernos para identificar problemas com precisão",
      category: "Diagnóstico",
      basePrice: 50.00,
      estimatedTime: "45 minutos",
      specifications: JSON.stringify({
        "includes": ["Scanner profissional", "Relatório técnico", "Solução rápida"],
        "duracao": "Diagnóstico completo",
        "garantia": "Garantia inclusa",
        "qualidade": "Equipamentos modernos"
      }),
      isActive: true
    },
    {
      name: "Freios e Suspensão",
      description: "Segurança em primeiro lugar com serviços especializados",
      category: "Segurança",
      basePrice: 200.00,
      estimatedTime: "3 horas",
      specifications: JSON.stringify({
        "includes": ["Pastilhas originais", "Fluido de freio", "Teste de segurança"],
        "duracao": "Serviço especializado",
        "garantia": "Garantia estendida",
        "qualidade": "Pastilhas originais"
      }),
      isActive: true
    },
    {
      name: "Ar Condicionado",
      description: "Climatização perfeita para seu conforto em qualquer época",
      category: "Conforto",
      basePrice: 120.00,
      estimatedTime: "1.5 horas",
      specifications: JSON.stringify({
        "includes": ["Higienização", "Recarga de gás", "Troca de filtros"],
        "duracao": "Serviço completo",
        "garantia": "Garantia inclusa",
        "qualidade": "Produtos premium"
      }),
      isActive: true
    },
    {
      name: "Sistema Elétrico",
      description: "Especialistas em problemas elétricos e eletrônicos",
      category: "Elétrica",
      basePrice: 100.00,
      estimatedTime: "2 horas",
      specifications: JSON.stringify({
        "includes": ["Diagnóstico avançado", "Reparo de chicotes", "Atualização ECU"],
        "duracao": "Serviço técnico",
        "garantia": "Garantia inclusa",
        "qualidade": "Equipamentos modernos"
      }),
      isActive: true
    }
  ];

  for (const serviceData of services) {
    await prisma.service.create({
      data: serviceData
    });
  }

  console.log(`✅ ${services.length} serviços inseridos`);

  // ============================================
  // CONFIGURAÇÕES DA APLICAÇÃO
  // ============================================
  
  console.log('⚙️ Inserindo configurações...');

  const configs = [
    {
      key: "store_name",
      value: "Moria Peças & Serviços",
      description: "Nome da loja"
    },
    {
      key: "store_description", 
      value: "Sua oficina de confiança especializada em peças e serviços automotivos",
      description: "Descrição da loja"
    },
    {
      key: "contact_phone",
      value: "(11) 99999-9999",
      description: "Telefone de contato"
    },
    {
      key: "contact_email",
      value: "contato@moriapecas.com.br",
      description: "Email de contato"
    },
    {
      key: "address",
      value: JSON.stringify({
        "street": "Rua das Peças, 123",
        "neighborhood": "Centro Automotivo",
        "city": "São Paulo",
        "state": "SP",
        "zipcode": "01234-567"
      }),
      description: "Endereço da loja"
    }
  ];

  for (const configData of configs) {
    await prisma.appConfig.create({
      data: configData
    });
  }

  console.log(`✅ ${configs.length} configurações inseridas`);

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });