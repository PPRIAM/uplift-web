import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Ce script utilise PrismaClient pour lire et appliquer le fichier SQL de création 
// de la table des sponsors à la base de données.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chargement manuel de .env.local pour configurer le process.env que Prisma lira automatiquement
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split(/\r?\n/).forEach(line => {
  const match = line.trim().match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1].trim();
    let val = (match[2] || '').trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    process.env[key] = val;
  }
});

// Configuration correcte de DATABASE_URL pour Supabase avec l'identifiant du projet (tenant ID)
// dans le nom d'utilisateur : postgres.[project-ref]
const dbUser = 'postgres.nmkwhseqfbhrbzqldvcm';
const dbPassword = 'PasswordAdmin123!';
const dbHost = 'aws-0-us-east-1.pooler.supabase.com'; // Région us-east-1 par défaut
const dbPort = '6543'; // Port du pooler de transactions
const dbName = 'postgres';

process.env.DATABASE_URL = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?pgbouncer=true&connection_limit=1`;
process.env.DIRECT_URL = `postgresql://${dbUser}:${dbPassword}@${dbHost}:5432/${dbName}?connection_limit=1`;

async function run() {
  const prisma = new PrismaClient();
  try {
    const sqlPath = path.resolve(__dirname, '../supabase_schema_sponsors.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
      
    console.log(`Exécution de ${statements.length} requêtes SQL via Prisma...`);
    for (const statement of statements) {
      console.log(`Exécution : ${statement.substring(0, 80)}...`);
      await prisma.$executeRawUnsafe(statement);
    }
    console.log('✅ Schéma des sponsors mis à jour avec succès via Prisma.');
  } catch (err) {
    console.error('❌ Échec de la mise à jour du schéma via Prisma :', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
