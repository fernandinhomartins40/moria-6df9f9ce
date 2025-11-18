import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  const phone = '42988781321';

  console.log(`\n🔍 Buscando usuário com telefone: ${phone}\n`);

  // Buscar por telefone exato
  const userByPhone = await prisma.customer.findFirst({
    where: { phone }
  });

  if (userByPhone) {
    console.log('✅ Usuário encontrado por telefone:');
    console.log(JSON.stringify({
      id: userByPhone.id,
      name: userByPhone.name,
      email: userByPhone.email,
      phone: userByPhone.phone,
      hasProvisionalPassword: userByPhone.hasProvisionalPassword,
      status: userByPhone.status,
      level: userByPhone.level,
      totalOrders: userByPhone.totalOrders,
      totalSpent: userByPhone.totalSpent.toString(),
      createdAt: userByPhone.createdAt,
    }, null, 2));
  } else {
    console.log('❌ Nenhum usuário encontrado com este telefone exato.');
  }

  // Buscar por telefone com LIKE (caso tenha formatação)
  const usersLike = await prisma.$queryRaw<any[]>`
    SELECT id, name, email, phone, "hasProvisionalPassword", status, level, "createdAt"
    FROM customers
    WHERE phone LIKE ${'%' + phone + '%'}
  `;

  if (usersLike.length > 0) {
    console.log('\n📋 Usuários encontrados com telefone similar:');
    usersLike.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Provisional: ${user.hasProvisionalPassword}`);
      console.log(`   Status: ${user.status}`);
    });
  }

  // Buscar por email provisional
  const provisionalEmail = `${phone}@provisional.moria.com`;
  const userByEmail = await prisma.customer.findUnique({
    where: { email: provisionalEmail }
  });

  if (userByEmail) {
    console.log('\n✅ Usuário encontrado por email provisional:');
    console.log(JSON.stringify({
      id: userByEmail.id,
      name: userByEmail.name,
      email: userByEmail.email,
      phone: userByEmail.phone,
      hasProvisionalPassword: userByEmail.hasProvisionalPassword,
      status: userByEmail.status,
    }, null, 2));
  }

  // Contar total de usuários
  const totalUsers = await prisma.customer.count();
  const provisionalUsers = await prisma.customer.count({
    where: { hasProvisionalPassword: true }
  });

  console.log(`\n📊 Estatísticas:`);
  console.log(`   Total de clientes: ${totalUsers}`);
  console.log(`   Clientes com senha provisória: ${provisionalUsers}`);

  await prisma.$disconnect();
}

checkUser()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  });
