import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create a default guest address for orders without authentication
 * This address is used as a placeholder for guest orders
 */
async function main() {
  console.log('Creating default guest address...');

  // Check if guest address already exists
  const existingAddress = await prisma.$queryRaw<any[]>`
    SELECT * FROM addresses WHERE id = '00000000-0000-0000-0000-000000000000'
  `;

  if (existingAddress.length > 0) {
    console.log('Guest address already exists, skipping...');
    return;
  }

  // Create a guest customer first (if not exists)
  let guestCustomer = await prisma.customer.findFirst({
    where: { email: 'guest@moria.com' },
  });

  if (!guestCustomer) {
    guestCustomer = await prisma.customer.create({
      data: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'guest@moria.com',
        password: '$2b$10$ZF8qZqZ8qZqZ8qZqZ8qZqOZqZ8qZqZ8qZqZ8qZqZ8qZqZ8qZqZ', // Dummy hash
        name: 'Guest Customer',
        phone: '00000000000',
        status: 'ACTIVE',
        level: 'BRONZE',
      },
    });
  }

  // Create default guest address
  await prisma.$executeRaw`
    INSERT INTO addresses (
      id,
      "customerId",
      type,
      street,
      number,
      neighborhood,
      city,
      state,
      "zipCode",
      "isDefault",
      "createdAt",
      "updatedAt"
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      ${guestCustomer.id},
      'OTHER',
      'N/A - Guest Order',
      'N/A',
      'N/A',
      'N/A',
      'SP',
      '00000000',
      false,
      NOW(),
      NOW()
    )
  `;

  console.log('✅ Default guest address created successfully!');
}

main()
  .catch((e) => {
    console.error('Error creating guest address:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
