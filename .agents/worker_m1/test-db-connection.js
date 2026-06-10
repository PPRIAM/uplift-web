import { PrismaClient } from '@prisma/client';

const passwords = [
  'PasswordAdmin123!',
  'admin',
  'postgres',
  'supabase',
  'nmkwhseqfbhrbzqldvcm',
  'sb_publishable_quKA2sUvLiryhd4jr4y_LQ_aOMHEOGZ'
];

async function tryConnect() {
  for (const pwd of passwords) {
    const url = `postgresql://postgres:${encodeURIComponent(pwd)}@db.nmkwhseqfbhrbzqldvcm.supabase.co:5432/postgres`;
    console.log(`Trying connection with password: ${pwd}`);
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
