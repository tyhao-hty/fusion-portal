import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
try {
  await prisma.$connect();
  console.log('✅ Database connected successfully');
} catch (err) {
  console.error('❌ Database connection failed:', err);
}

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
