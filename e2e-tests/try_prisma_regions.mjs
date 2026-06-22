import { PrismaClient } from '@prisma/client';

// Ce script teste les connexions Prisma à travers différentes régions Supabase sur le port 6543
// pour trouver l'hôte exact où le tenant 'nmkwhseqfbhrbzqldvcm' existe.
const regions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ca-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-central-1',
  'eu-central-2',
  'eu-north-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'sa-east-1'
];

async function main() {
  const user = 'postgres.nmkwhseqfbhrbzqldvcm';
  const password = 'PasswordAdmin123!';
  const port = '6543';
  const dbName = 'postgres';

  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    console.log(`Essai avec l'hôte : ${host}...`);
    
    // Définition de l'URL pour ce test de région
    process.env.DATABASE_URL = `postgresql://${user}:${password}@${host}:${port}/${dbName}?pgbouncer=true&connection_limit=1`;
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    try {
      await prisma.$queryRawUnsafe('SELECT 1;');
      console.log(`\n🎉 TROUVÉ ! Connexion réussie via Prisma sur la région : ${region}`);
      console.log(`DATABASE_URL de travail : ${process.env.DATABASE_URL}`);
      await prisma.$disconnect();
      return region;
    } catch (err) {
      console.log(`Échec pour ${region} : ${err.message.substring(0, 150)}...`);
      await prisma.$disconnect();
    }
  }
  console.log('\n❌ Aucune région n\'a fonctionné avec Prisma.');
  return null;
}

main();
