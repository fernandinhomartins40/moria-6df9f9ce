import { prisma } from './src/config/database.js';

const customerId = '00ca97d7-06ce-4fc8-9f56-9a04e56f368b';

console.log(`\n🔍 Buscando pedidos para cliente: ${customerId}\n`);

const orders = await prisma.order.findMany({
  where: { customerId },
  include: { items: true },
  orderBy: { createdAt: 'desc' },
});

console.log(`✅ Total de pedidos encontrados: ${orders.length}\n`);

orders.forEach((order, index) => {
  console.log(`${index + 1}. Pedido #${order.id}`);
  console.log(`   Status: ${order.status}`);
  console.log(`   Data: ${order.createdAt.toLocaleDateString('pt-BR')}`);
  console.log(`   Total: R$ ${order.total}`);
  console.log(`   Items: ${order.items.length}`);
  order.items.forEach(item => {
    console.log(`     - ${item.name} (${item.quantity}x R$ ${item.price})`);
  });
  console.log('');
});

await prisma.$disconnect();
