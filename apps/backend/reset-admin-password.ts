import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  const password = 'Admin@123';
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.admin.update({
    where: { email: 'admin@moria.com' },
    data: { password: hashedPassword }
  });

  console.log('Password reset successfully to: Admin@123');
  await prisma.$disconnect();
}

resetPassword();
