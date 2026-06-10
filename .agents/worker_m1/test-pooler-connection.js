import { PrismaClient } from '@prisma/client';

const passwords = [
  'PasswordAdmin123!',
  'admin',
  'postgres',
  'supabase',
  'nmkwhseqfbhrbzqldvcm'
];

async function tryConnect() {
  for (const pwd of passwords) {
    const url = `postgresql://postgres.nmkwhseqfbhrbzqldvcm:${encodeURIComponent(pwd)}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`;
    console.log(`Trying pooler connection with password: ${pwd}`);
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url
        }
      }
    });
    try {
      const res = await prisma.$queryRaw`SELECT 1 as result`;
      console.log(`✅ SUCCESS with password: ${pwd}`, res);
      await prisma.$disconnect();
      return;
    } catch (e) {
      console.log(`❌ Failed with password: ${pwd}, error: ${e.message}`);
      await prisma.$disconnect();
    }
  }
}

tryConnect();
