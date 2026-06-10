import { PrismaClient } from '@prisma/client';
import net from 'net';

const regions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-central-1',
  'ap-southeast-1',
  'sa-east-1'
];

async function tryRegions() {
  const pwd = 'PasswordAdmin123!';
  for (const reg of regions) {
    const host = `aws-0-${reg}.pooler.supabase.com`;
    console.log(`Checking region ${reg} (${host})...`);
    
    // Check if port 6543 is open first
    const isOpen = await new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(2000);
      socket.on('connect', () => { resolve(true); socket.destroy(); });
      socket.on('timeout', () => { resolve(false); socket.destroy(); });
      socket.on('error', () => { resolve(false); socket.destroy(); });
      socket.connect(6543, host);
    });
    
    if (!isOpen) {
      console.log(`Port 6543 is CLOSED on ${host}`);
      continue;
    }
    
    console.log(`Port 6543 is OPEN on ${host}. Trying connection...`);
    const url = `postgresql://postgres.nmkwhseqfbhrbzqldvcm:${encodeURIComponent(pwd)}@${host}:6543/postgres?pgbouncer=true`;
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url
        }
      }
    });
    try {
      const res = await prisma.$queryRaw`SELECT 1 as result`;
      console.log(`✅ SUCCESS on ${host}!`, res);
      await prisma.$disconnect();
      return;
    } catch (e) {
      console.log(`❌ Failed on ${host}, error: ${e.message}`);
      await prisma.$disconnect();
    }
  }
}

tryRegions();
