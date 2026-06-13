import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  for (const line of envConfig.split('\n')) {
    const matched = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (matched) {
      const key = matched[1];
      let value = matched[2] || '';
      value = value.trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  }
}

// Set up DATABASE_URL to use pg pooled or direct
const prisma = new PrismaClient();

async function main() {
  console.log('--- DIAGNOSING DATABASE TRIGGERS ---');
  try {
    // 1. Get all triggers on public.events
    const triggers = await prisma.$queryRaw`
      SELECT 
        trigger_name, 
        event_manipulation, 
        event_object_table, 
        action_statement, 
        action_timing
      FROM information_schema.triggers
      WHERE event_object_table = 'events';
    `;
    console.log('\nTriggers found:', triggers);

    // 2. Get trigger functions definition
    const triggerFunctions = await prisma.$queryRaw`
      SELECT 
        routine_name, 
        routine_definition 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
    `;
    console.log('\nTrigger functions found:');
    triggerFunctions.forEach(f => {
      console.log(`\nFunction: ${f.routine_name}`);
      console.log('--- DEFINITION ---');
      console.log(f.routine_definition);
      console.log('-----------------');
    });

  } catch (err) {
    console.error('Error querying database metadata:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
