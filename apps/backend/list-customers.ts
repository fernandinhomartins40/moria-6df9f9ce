import { prisma } from './src/config/database.js';

async function listCustomers() {
  const customers = await prisma.customer.findMany({
    take: 5,
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      loyaltyPoints: true,
    }
  });

  console.log('Customers:', JSON.stringify(customers, null, 2));
  await prisma.$disconnect();
}

listCustomers();
