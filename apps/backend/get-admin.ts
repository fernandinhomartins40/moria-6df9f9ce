import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getAdmins() {
  const admins = await prisma.admin.findMany();
  console.log(JSON.stringify(admins, null, 2));
  await prisma.$disconnect();
}

getAdmins();
