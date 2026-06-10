import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
  }
});

const url = env['NEXT_PUBLIC_SUPABASE_URL'];
const key = env['SUPABASE_SERVICE_ROLE_KEY'];

const endpoints = [
  '/pg',
  '/sql',
  '/query',
  '/rest/v1/db',
  '/rest/v1/sql',
  '/rest/v1/rpc/exec',
  '/rest/v1/rpc/run_sql',
  '/rest/v1/rpc/execute_sql',
];

async function checkEndpoints() {
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${url}${ep}`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: 'SELECT 1;' })
      });
      console.log(`Endpoint ${ep}: Status ${res.status}`);
      const text = await res.text();
      console.log(`Response: ${text.substring(0, 100)}`);
    } catch (e) {
      console.log(`Endpoint ${ep} Error: ${e.message}`);
    }
  }
}

checkEndpoints();
