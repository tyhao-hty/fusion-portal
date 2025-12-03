import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

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
