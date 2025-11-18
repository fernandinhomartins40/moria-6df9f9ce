import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    const [customers, products, revisions, orders, coupons, shippingMethods] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.revision.count(),
      prisma.order.count(),
      prisma.coupon.count(),
      prisma.shippingMethod.count()
    ]);

    console.log('\n=== DATABASE STATS ===');
    console.log('Customers:', customers);
    console.log('Products:', products);
    console.log('Revisions:', revisions);
    console.log('Orders:', orders);
    console.log('Coupons:', coupons);
    console.log('Shipping Methods:', shippingMethods);
    console.log('=====================\n');

    // Check for sample data
    if (products === 0) {
      console.log('⚠️  No products found - need to run seed');
    }
    if (shippingMethods === 0) {
      console.log('⚠️  No shipping methods found - need to run seed');
    }
    if (coupons === 0) {
      console.log('⚠️  No coupons found - seed may be needed');
    }
    if (customers === 0) {
      console.log('⚠️  No customers found - seed may be needed');
    }

  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
