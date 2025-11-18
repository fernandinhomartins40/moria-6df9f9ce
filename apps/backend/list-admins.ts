import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAdmins() {
  try {
    const admins = await prisma.admin.findMany();
    console.log(JSON.stringify(admins, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAdmins();
