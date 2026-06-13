import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read env from .env.local to ensure Prisma has the right env variables
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

async function run() {
  const prisma = new PrismaClient();
  try {
    const sqlPath = path.resolve(__dirname, '../supabase_schema_update.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL by statements and filter out empty ones
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
      
    console.log(`Executing ${statements.length} SQL statements...`);
    for (const statement of statements) {
      console.log(`Running statement: ${statement.substring(0, 80)}...`);
      await prisma.$executeRawUnsafe(statement);
    }
    console.log('✅ SQL schema updated successfully.');
  } catch (err) {
    console.error('❌ Failed to update SQL schema:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
