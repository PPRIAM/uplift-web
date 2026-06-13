import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlPath = path.resolve(__dirname, '../supabase_schema_update.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const passwords = ['PasswordAdmin123!'];
const hosts = [
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-sa-east-1.pooler.supabase.com'
];
const users = [
  'postgres.nmkwhseqfbhrbzqldvcm',
  'postgres'
];
const ports = [5432, 6543];

async function tryConnect() {
  for (const host of hosts) {
    for (const port of ports) {
      for (const user of users) {
        for (const pwd of passwords) {
          console.log(`Trying connection to ${host}:${port} as ${user}...`);
          const client = new pg.Client({
            host,
            port,
            user,
            password: pwd,
            database: 'postgres',
            connectionTimeoutMillis: 3000,
            ssl: {
              rejectUnauthorized: false
            }
          });
          try {
            await client.connect();
            console.log('✅ Connected successfully!');
            console.log('Executing SQL migration script...');
            await client.query(sql);
            console.log('🎉 SQL Migration applied successfully!');
            await client.end();
            return true;
          } catch (err) {
            console.log(`❌ Failed: ${err.message}`);
            try {
              await client.end();
            } catch (e) {}
          }
        }
      }
    }
  }
  return false;
}

tryConnect().then(success => {
  if (success) {
    process.exit(0);
  } else {
    console.error('Could not connect to database using any combination.');
    process.exit(1);
  }
});
